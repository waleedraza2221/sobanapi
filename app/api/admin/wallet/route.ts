import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

// POST /api/admin/wallet — add or set wallet balance
// body: { userId, amount, mode: "add" | "set" }
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, amount, mode = "add" } = await req.json();

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (typeof amount !== "number" || isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: "amount must be a non-negative number" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (mode === "set") {
    const { data, error } = await admin
      .from("profiles")
      .update({ wallet_balance: amount })
      .eq("id", userId)
      .select("wallet_balance")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ wallet_balance: data.wallet_balance });
  }

  // mode === "add" — increment existing balance
  const { data: current, error: fetchErr } = await admin
    .from("profiles")
    .select("wallet_balance")
    .eq("id", userId)
    .single();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const newBalance = parseFloat(String(current.wallet_balance ?? 0)) + amount;
  const { data, error } = await admin
    .from("profiles")
    .update({ wallet_balance: newBalance })
    .eq("id", userId)
    .select("wallet_balance")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ wallet_balance: data.wallet_balance });
}
