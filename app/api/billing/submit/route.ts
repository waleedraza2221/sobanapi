import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { plan, amount, method, screenshot_url, transaction_ref } = body;

    if (!plan || !amount || !method || !screenshot_url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["jazzcash", "bank"].includes(method)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    if (!["starter", "pro", "enterprise"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { error } = await supabase.from("payments").insert({
      user_id: user.id,
      plan,
      amount,
      method,
      screenshot_url,
      transaction_ref: transaction_ref || null,
      status: "pending",
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
