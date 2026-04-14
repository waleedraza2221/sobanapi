import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY!;
const BRIGHTDATA_BASE = "https://api.brightdata.com/datasets/v3";
// Profile Discovery dataset — input: first_name + last_name
const PROFILE_DISCOVERY_DATASET_ID = "gd_m8d03he47z8nwb5xc";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface BrightDataProfile {
  profile_info?: {
    id?: string;
    name?: string;
    location?: { city?: string; state?: string; country?: string };
    about?: string;
    metrics?: { followers?: number; connections?: number };
  };
  professional?: {
    current_position?: {
      title?: string;
      company?: string;
      company_link?: string;
    };
    education?: {
      school?: string;
      years?: string;
    };
  };
  url?: string;
  similar_professionals?: unknown[];
  recommendations?: unknown[];
  // Error entries
  error?: string;
  error_code?: string;
}

function transformResults(
  data: BrightDataProfile[],
  filters: { industry: string; experience: string; location: string }
) {
  if (!Array.isArray(data)) return [];
  // Filter out error entries from BrightData
  const valid = data.filter((p) => !p.error_code);
  return valid.map((p) => {
    const city = p.profile_info?.location?.city ?? "";
    const country = p.profile_info?.location?.country ?? "";
    const loc =
      filters.location ||
      [city, country].filter(Boolean).join(", ") ||
      "Unknown";

    return {
      id: p.profile_info?.id ?? crypto.randomUUID(),
      name: p.profile_info?.name ?? "Unknown",
      title:
        p.professional?.current_position?.title ?? "Professional",
      company:
        p.professional?.current_position?.company ?? "Unknown Company",
      location: loc,
      industry: filters.industry || "General",
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
    `${BRIGHTDATA_BASE}/trigger?dataset_id=${PROFILE_DISCOVERY_DATASET_ID}&include_errors=true`,
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

    // This dataset requires first_name + last_name
    // Accept "FirstName LastName" or "FirstName MiddleName LastName"
    if (words.length < 2) {
      return NextResponse.json(
        { error: "Please enter a first and last name (e.g. John Smith)" },
        { status: 400 }
      );
    }

    const firstName = words[0];
    const lastName = words.slice(1).join(" ");

    const searchUrl = `https://www.linkedin.com/search/results/people/?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`;

    const rawData = await triggerBrightData({
      url: searchUrl,
      first_name: firstName,
      last_name: lastName,
    });

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
