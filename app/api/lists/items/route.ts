import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/lists/items — add a lead to a list
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listId, leadId } = await req.json();
  if (!listId || !leadId) {
    return NextResponse.json({ error: "listId and leadId are required" }, { status: 400 });
  }

  // Verify the list belongs to the user
  const { data: list } = await supabase
    .from("lead_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .single();

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("lead_list_items")
    .upsert({ list_id: listId, lead_id: leadId }, { onConflict: "list_id,lead_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
