import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: messages } = await supabase
    .from("cap_chat_messages")
    .select("*")
    .eq("intervention_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json(messages || []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Mensaje vacio" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: intervention } = await supabase
    .from("cap_intervention_timeline")
    .select("current_day")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("cap_chat_messages").insert({
    intervention_id: id,
    role: "staff",
    content: content.trim(),
    day_offset: intervention?.current_day || 0,
  });

  if (error) {
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }

  // Mark escalations as read
  await supabase
    .from("cap_chat_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("intervention_id", id)
    .eq("is_escalated", true)
    .is("read_at", null);

  return NextResponse.json({ success: true });
}
