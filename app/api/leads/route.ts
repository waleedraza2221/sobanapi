import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canPlanSave } from "@/lib/plans";

// GET /api/leads — list saved leads
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

// POST /api/leads — save a lead
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check plan allows saving
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!canPlanSave(profile?.plan ?? "free")) {
    return NextResponse.json(
      { error: "Your plan does not support saving contacts. Upgrade to Starter or higher." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, title, company, location, industry, linkedinUrl, email, phone, companySize, experience } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("leads")
    .insert({
      user_id: user.id,
      name,
      title,
      company,
      location,
      industry,
      linkedin_url: linkedinUrl,
      email,
      phone,
      company_size: companySize,
      experience,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update saved_leads count
  await supabase.rpc("increment_saved_leads", { uid: user.id }).catch(() => {
    supabase
      .from("profiles")
      .select("saved_leads")
      .eq("id", user.id)
      .single()
      .then(({ data: p }) => {
        if (p) {
          supabase
            .from("profiles")
            .update({ saved_leads: (p.saved_leads ?? 0) + 1 })
            .eq("id", user.id);
        }
      });
  });

  return NextResponse.json({ lead: data }, { status: 201 });
}

// DELETE /api/leads?id=... — unsave a lead
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
