import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY!;
const BRIGHTDATA_DATASET_ID = "gd_l1viktl72bvl7bjuj0";
const BRIGHTDATA_BASE = "https://api.brightdata.com/datasets/v3";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface BrightDataProfile {
  profile_info?: {
    id?: string;
    name?: string;
    location?: { city?: string; state?: string; country?: string };
    about?: string;
  };
  professional?: {
    current_position?: { title?: string; company?: string; company_link?: string };
  };
  url?: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  industry?: string;
  current_company?: { name?: string };
}

function transformResults(
  data: BrightDataProfile[],
  filters: { industry: string; experience: string; location: string }
) {
  if (!Array.isArray(data)) return [];
  return data.map((p) => {
    const city = p.profile_info?.location?.city ?? "";
    const country = p.profile_info?.location?.country ?? "";
    const loc =
      filters.location ||
      [city, country].filter(Boolean).join(", ") ||
      "Unknown";

    return {
      id: p.profile_info?.id ?? crypto.randomUUID(),
      name:
        (p.profile_info?.name ??
        `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()) ||
        "Unknown",
      title:
        p.professional?.current_position?.title ?? p.position ?? "Professional",
      company:
        p.professional?.current_position?.company ??
        p.current_company?.name ??
        "Unknown Company",
      location: loc,
      industry: filters.industry || p.industry || "General",
      linkedinUrl: p.url ?? "#",
      email: p.email ?? undefined,
      phone: undefined,
      companySize: undefined,
      experience: filters.experience || undefined,
    };
  });
}

async function callBrightData(
  input: Record<string, string>[],
  discoverBy: string
) {
  const triggerRes = await fetch(
    `${BRIGHTDATA_BASE}/trigger?dataset_id=${BRIGHTDATA_DATASET_ID}&type=discover_new&discover_by=${discoverBy}&include_errors=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BRIGHTDATA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!triggerRes.ok) {
    const err = await triggerRes.text();
    throw new Error(`BrightData trigger failed ${triggerRes.status}: ${err}`);
  }

  const { snapshot_id } = await triggerRes.json();
  if (!snapshot_id) throw new Error("No snapshot_id returned");

  // Poll for up to 60 seconds
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    await sleep(3500);

    const progressRes = await fetch(
      `${BRIGHTDATA_BASE}/progress/${snapshot_id}`,
      { headers: { Authorization: `Bearer ${BRIGHTDATA_API_KEY}` } }
    );
    const progress = await progressRes.json();

    if (progress.status === "ready") {
      const dataRes = await fetch(
        `${BRIGHTDATA_BASE}/snapshot/${snapshot_id}?format=json`,
        { headers: { Authorization: `Bearer ${BRIGHTDATA_API_KEY}` } }
      );
      return await dataRes.json();
    }

    if (progress.status === "failed" || progress.status === "error") {
      throw new Error(`BrightData collection failed: ${progress.status}`);
    }
  }

  throw new Error("BrightData request timed out after 60 seconds");
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check search quota
  const { data: profile } = await supabase
    .from("profiles")
    .select("searches_used, searches_limit, plan")
    .eq("id", user.id)
    .single();

  if (
    profile &&
    profile.searches_used >= profile.searches_limit &&
    profile.plan !== "enterprise"
  ) {
    return NextResponse.json(
      { error: "Monthly search limit reached. Upgrade your plan." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const {
    query = "",
    location = "",
    industry = "",
    experience = "",
    companySize = "",
    hasEmail = false,
  } = body;

  if (!query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  let leads: ReturnType<typeof transformResults> = [];
  let searchError: string | null = null;

  try {
    const words = query.trim().split(/\s+/);

    // Decide strategy: 2 words with no job-title keywords → name search; else keyword
    const roleKeywords = [
      "ceo", "cto", "cmo", "coo", "vp", "director", "manager", "founder",
      "engineer", "developer", "designer", "analyst", "consultant", "head",
      "lead", "senior", "junior", "executive",
    ];
    const looksLikeName =
      words.length === 2 &&
      !words.some((w: string) => roleKeywords.includes(w.toLowerCase()));

    let rawData: BrightDataProfile[];

    if (looksLikeName) {
      rawData = await callBrightData(
        [{ first_name: words[0], last_name: words[1] }],
        "name"
      );
    } else {
      // Keyword-based discovery: keyword + optional location
      const input: Record<string, string> = { keyword: query };
      if (location) input.location = location;
      rawData = await callBrightData([input], "keyword");
    }

    leads = transformResults(rawData, { industry, experience, location });

    // Apply client-side filters
    if (industry && industry !== "All Industries") {
      leads = leads.filter((l) =>
        l.industry.toLowerCase().includes(industry.toLowerCase())
      );
    }
    if (hasEmail) leads = leads.filter((l) => l.email);
  } catch (err) {
    searchError = err instanceof Error ? err.message : "Search failed";
    console.error("[BrightData]", searchError);
  }

  // Save search to history regardless of result
  await supabase.from("searches").insert({
    user_id: user.id,
    query,
    location,
    industry,
    experience,
    company_size: companySize,
    result_count: leads.length,
    filters: { query, location, industry, experience, companySize, hasEmail },
  });

  // Increment search counter
  if (profile) {
    await supabase
      .from("profiles")
      .update({ searches_used: (profile.searches_used ?? 0) + 1 })
      .eq("id", user.id);
  }

  if (searchError && leads.length === 0) {
    return NextResponse.json(
      { error: searchError, leads: [] },
      { status: 502 }
    );
  }

  return NextResponse.json({ leads });
}
