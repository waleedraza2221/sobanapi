import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY!;
const BRIGHTDATA_BASE = "https://api.brightdata.com/datasets/v3";
// linkedin_people_search dataset — plain trigger, no discover_by needed
const PEOPLE_SEARCH_DATASET_ID = "gd_m8d03he47z8nwb5xc";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface BrightDataProfile {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  city?: string;
  location?: string;
  country_code?: string;
  url?: string;
  avatar?: string;
  about?: string;
  followers?: number;
  connections?: number;
  current_company?: { name?: string; link?: string; title?: string };
  experience?: unknown[];
  education?: unknown[];
  industry?: string;
}

function transformResults(
  data: BrightDataProfile[],
  filters: { industry: string; experience: string; location: string }
) {
  if (!Array.isArray(data)) return [];
  return data.map((p) => {
    const loc =
      filters.location ||
      p.city ||
      p.location ||
      "Unknown";

    return {
      id: p.id ?? crypto.randomUUID(),
      name:
        p.name ||
        `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() ||
        "Unknown",
      title: p.position ?? p.current_company?.title ?? "Professional",
      company: p.current_company?.name ?? "Unknown Company",
      location: loc,
      industry: filters.industry || p.industry || "General",
      linkedinUrl: p.url ?? "#",
      email: undefined,
      phone: undefined,
      companySize: undefined,
      experience: filters.experience || undefined,
    };
  });
}

async function triggerBrightData(
  input: Record<string, string>
): Promise<BrightDataProfile[]> {
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
    throw new Error(`BrightData trigger failed ${triggerRes.status}: ${err}`);
  }

  const { snapshot_id } = await triggerRes.json();
  if (!snapshot_id) throw new Error("No snapshot_id returned");

  // Poll for up to 90 seconds
  const deadline = Date.now() + 90000;
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
      const data = await dataRes.json();
      return Array.isArray(data) ? data : [];
    }

    if (progress.status === "failed" || progress.status === "error") {
      throw new Error(`BrightData collection failed: ${progress.status}`);
    }
  }

  throw new Error("BrightData request timed out after 90 seconds");
}

// Build a LinkedIn people search URL from query params
function buildLinkedInSearchUrl(opts: {
  query?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
}): string {
  const qs = new URLSearchParams();
  if (opts.firstName && opts.lastName) {
    // Name-based search
    qs.set("firstName", opts.firstName);
    qs.set("lastName", opts.lastName);
  } else {
    // Keyword-based: combine query + company + location into keywords
    const keywords = [opts.query, opts.company, opts.location]
      .filter(Boolean)
      .join(" ");
    if (keywords) qs.set("keywords", keywords);
    // Job title uses LinkedIn's dedicated titleFreeText param
    if (opts.jobTitle) qs.set("titleFreeText", opts.jobTitle);
  }
  return `https://www.linkedin.com/search/results/people/?${qs.toString()}`;
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
    country = "",
    industry = "",
    experience = "",
    companySize = "",
    jobTitle = "",
    company = "",
    connectionDegree = "",
    hasEmail = false,
    hasPhone = false,
    openToWork = false,
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
      const searchUrl = buildLinkedInSearchUrl({ firstName: words[0], lastName: words[1] });
      rawData = await triggerBrightData({ url: searchUrl, first_name: words[0], last_name: words[1] });
    } else {
      const searchUrl = buildLinkedInSearchUrl({ query, jobTitle, company, location });
      rawData = await triggerBrightData({ url: searchUrl });
    }

    leads = transformResults(rawData, { industry, experience, location: location || country });

    // Post-process client-side filters
    if (industry) {
      leads = leads.filter((l) =>
        l.industry.toLowerCase().includes(industry.toLowerCase())
      );
    }
    if (hasEmail) leads = leads.filter((l) => l.email);
    if (hasPhone) leads = leads.filter((l) => l.phone);
    if (openToWork) leads = leads.filter((l) => (l as Record<string, unknown>).openToWork);
  } catch (err) {
    searchError = err instanceof Error ? err.message : "Search failed";
    console.error("[BrightData]", searchError);
  }

  // Save search to history regardless of result
  await supabase.from("searches").insert({
    user_id: user.id,
    query,
    location: location || country,
    industry,
    experience,
    company_size: companySize,
    result_count: leads.length,
    filters: { query, location, country, industry, experience, companySize, jobTitle, company, connectionDegree, hasEmail, hasPhone, openToWork },
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
