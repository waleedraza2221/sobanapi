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
    if (words.length < 2) {
      return NextResponse.json(
        { error: "Enter a first and last name (e.g. John Smith)" },
        { status: 400 }
      );
    }

    const firstName = words[0];
    const lastName = words.slice(1).join(" ");
    const searchUrl = `https://www.linkedin.com/search/results/people/?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`;
    const input = { url: searchUrl, first_name: firstName, last_name: lastName };

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

        // Transform using nested structure matching BrightData Profile Discovery response
        const transformed = valid.map((p: Record<string, unknown>) => {
          const profileInfo = p.profile_info as Record<string, unknown> | undefined;
          const professional = p.professional as Record<string, unknown> | undefined;
          const currentPos = professional?.current_position as Record<string, unknown> | undefined;
          const location = profileInfo?.location as Record<string, unknown> | undefined;

          return {
            id: profileInfo?.id ?? "no-id",
            name: profileInfo?.name ?? "Unknown",
            title: currentPos?.title ?? "Professional",
            company: currentPos?.company ?? "Unknown Company",
            location: [location?.city, location?.country].filter(Boolean).join(", ") || "Unknown",
            linkedinUrl: p.url ?? "#",
            _allKeys: Object.keys(p),
          };
        });

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
