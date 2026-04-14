import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/lists or /api/lists?id=X
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listId = req.nextUrl.searchParams.get("id");

  // Return single list with its leads
  if (listId) {
    const { data: list, error: listErr } = await supabase
      .from("lead_lists")
      .select("*")
      .eq("id", listId)
      .eq("user_id", user.id)
      .single();
    if (listErr || !list) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: items } = await supabase
      .from("lead_list_items")
      .select("leads(*)")
      .eq("list_id", listId);

    const leads = (items ?? []).map((item) => item.leads).filter(Boolean);
    return NextResponse.json({ list, leads });
  }

  const { data, error } = await supabase
    .from("lead_lists")
    .select("*, lead_list_items(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const lists = (data ?? []).map((list) => ({
    ...list,
    leadCount: list.lead_list_items?.[0]?.count ?? 0,
    lead_list_items: undefined,
  }));

  return NextResponse.json({ lists });
}

// POST /api/lists — create a new list
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("lead_lists")
    .insert({ user_id: user.id, name: name.trim(), description: description?.trim() ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ list: data }, { status: 201 });
}

// DELETE /api/lists?id=... — delete a list
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("lead_lists")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
