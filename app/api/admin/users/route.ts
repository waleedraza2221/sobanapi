import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanLimit, type PlanKey } from "@/lib/plans";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return null;
  return user;
}

// GET /api/admin/users — list all users
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

// PATCH /api/admin/users — update a user's role or plan
export async function PATCH(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, role, plan, searches_limit } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const updates: Record<string, string | number> = {};
  if (role) updates.role = role;
  if (plan) {
    updates.plan = plan;
    // Auto-sync searches_limit from plan config unless explicitly overridden
    updates.searches_limit = searches_limit ?? getPlanLimit(plan as PlanKey);
  } else if (searches_limit !== undefined) {
    updates.searches_limit = searches_limit;
  }
  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(updates).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
