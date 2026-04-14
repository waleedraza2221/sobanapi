import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { getPlanLimit } from "@/lib/plans";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("payments")
      .select(`
        *,
        profiles (
          name,
          email,
          plan,
          plan_expires_at
        )
      `)
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    // Generate signed URLs for screenshots (bucket is private)
    const payments = await Promise.all(
      (data ?? []).map(async (payment) => {
        if (!payment.screenshot_url) return payment;
        const { data: signed } = await admin.storage
          .from("payment-screenshots")
          .createSignedUrl(payment.screenshot_url, 60 * 60); // 1 hour
        return { ...payment, screenshot_signed_url: signed?.signedUrl ?? null };
      })
    );

    return NextResponse.json({ payments });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { paymentId, action, note } = body;

    if (!paymentId || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Get payment details
    const { data: payment, error: payErr } = await admin
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (payErr || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update payment status
    const { error: updateErr } = await admin
      .from("payments")
      .update({
        status: action,
        admin_note: note || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", paymentId);

    if (updateErr) throw updateErr;

    // If approved → activate plan + set expiry + reset searches
    if (action === "approved") {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: profileErr } = await admin
        .from("profiles")
        .update({
          plan: payment.plan,
          plan_expires_at: expiresAt.toISOString(),
          searches_used: 0,
          searches_limit: getPlanLimit(payment.plan),
        })
        .eq("id", payment.user_id);

      if (profileErr) throw profileErr;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
