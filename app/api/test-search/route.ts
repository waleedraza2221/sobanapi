import { NextRequest, NextResponse } from "next/server";

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY!;
const BRIGHTDATA_BASE = "https://api.brightdata.com/datasets/v3";
const PEOPLE_SEARCH_DATASET_ID = "gd_m8d03he47z8nwb5xc";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const words = query.trim().split(/\s+/);
    const roleKeywords = [
      "ceo","cto","cmo","coo","vp","director","manager","founder",
      "engineer","developer","designer","analyst","consultant","head",
      "lead","senior","junior","executive",
    ];
    const looksLikeName =
      words.length === 2 &&
      !words.some((w: string) => roleKeywords.includes(w.toLowerCase()));

    let input: Record<string, string>;
    if (looksLikeName) {
      const params = new URLSearchParams({ firstName: words[0], lastName: words[1] });
      input = {
        url: `https://www.linkedin.com/search/results/people/?${params}`,
        first_name: words[0],
        last_name: words[1],
      };
    } else {
      const params = new URLSearchParams({ keywords: query });
      input = { url: `https://www.linkedin.com/search/results/people/?${params}` };
    }

    // 1. Trigger
    const triggerRes = await fetch(
      `${BRIGHTDATA_BASE}/trigger?dataset_id=${PEOPLE_SEARCH_DATASET_ID}&include_errors=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BRIGHTDATA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([input]),
      }
    );

    if (!triggerRes.ok) {
      const err = await triggerRes.text();
      return NextResponse.json(
        { error: `Trigger failed ${triggerRes.status}: ${err}` },
        { status: 502 }
      );
    }

    const { snapshot_id } = await triggerRes.json();
    if (!snapshot_id) {
      return NextResponse.json({ error: "No snapshot_id" }, { status: 502 });
    }

    // 2. Poll
    const deadline = Date.now() + 90000;
    while (Date.now() < deadline) {
      await sleep(3500);
      const progressRes = await fetch(
        `${BRIGHTDATA_BASE}/progress/${snapshot_id}`,
        { headers: { Authorization: `Bearer ${BRIGHTDATA_API_KEY}` } }
      );
      const progress = await progressRes.json();

      if (progress.status === "ready") {
        // 3. Fetch snapshot
        const dataRes = await fetch(
          `${BRIGHTDATA_BASE}/snapshot/${snapshot_id}?format=json`,
          { headers: { Authorization: `Bearer ${BRIGHTDATA_API_KEY}` } }
        );
        const raw = await dataRes.json();
        const arr = Array.isArray(raw) ? raw : [];

        // Separate errors from real results
        const errors = arr.filter((p: Record<string, unknown>) => 'error_code' in p);
        const valid = arr.filter((p: Record<string, unknown>) => !('error_code' in p));

        // Transform using same logic as search route
        const transformed = valid.map((p: Record<string, unknown>) => ({
          id: p.id ?? "no-id",
          name: p.name ?? (`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unknown"),
          title: p.position ?? (p.current_company as Record<string, unknown>)?.title ?? "Professional",
          company: (p.current_company as Record<string, unknown>)?.name ?? "Unknown Company",
          location: p.city ?? p.location ?? "Unknown",
          linkedinUrl: p.url ?? "#",
          // Show ALL keys so we can see the full schema
          _allKeys: Object.keys(p),
        }));

        return NextResponse.json({
          snapshot_id,
          input,
          totalItems: arr.length,
          errorCount: errors.length,
          validCount: valid.length,
          errors: errors.slice(0, 3),
          raw: valid.slice(0, 5), // First 5 valid raw results
          transformed: transformed.slice(0, 5),
        });
      }

      if (progress.status === "failed" || progress.status === "error") {
        return NextResponse.json(
          { error: `Collection failed: ${JSON.stringify(progress)}` },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ error: "Timed out after 90s" }, { status: 504 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
