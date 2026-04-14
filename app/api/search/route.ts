import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bdclient } from "@brightdata/sdk";
import { ScrapeJob } from "@brightdata/sdk/scrapers";

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

function makeBdClient() {
  return new bdclient({ apiKey: process.env.BRIGHTDATA_API_KEY! });
}

// Discover LinkedIn profiles by first + last name
async function discoverByName(
  firstName: string,
  lastName: string
): Promise<BrightDataProfile[]> {
  const client = makeBdClient();
  try {
    const job = (await client.scrape.linkedin.discoverProfiles(
      [{ first_name: firstName, last_name: lastName }],
      { format: "json" }
    )) as unknown as ScrapeJob;
    const result = await job.toResult({ pollInterval: 3500, pollTimeout: 60000 });
    if (!result.success) throw new Error(result.error ?? "BrightData discover failed");
    return (Array.isArray(result.data) ? result.data : []) as BrightDataProfile[];
  } finally {
    await client.close();
  }
}

// Keyword search: Google → LinkedIn URLs → collect profiles
async function discoverByKeyword(
  query: string,
  jobTitle: string,
  company: string,
  location: string,
  country: string
): Promise<BrightDataProfile[]> {
  const client = makeBdClient();
  try {
    const parts = [query, jobTitle, company, location].filter(Boolean);
    const searchQuery = parts.join(" ") + " site:linkedin.com/in";

    const searchResults = await client.search.google(searchQuery, {
      format: "json",
      ...(country ? { country: country.toLowerCase().slice(0, 2) } : {}),
    });

    const urls = (Array.isArray(searchResults) ? searchResults : [])
      .map((r: Record<string, unknown>) => r.link as string)
      .filter((link) => typeof link === "string" && link.includes("linkedin.com/in/"))
      .slice(0, 10);

    if (urls.length === 0) return [];

    const result = await client.scrape.linkedin.profiles(urls, {
      pollInterval: 3500,
      pollTimeout: 60000,
      format: "json",
    });

    if (!result.success) throw new Error(result.error ?? "BrightData collect failed");
    return (Array.isArray(result.data) ? result.data : []) as BrightDataProfile[];
  } finally {
    await client.close();
  }
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
      rawData = await discoverByName(words[0], words[1]);
    } else {
      rawData = await discoverByKeyword(query, jobTitle, company, location, country);
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
