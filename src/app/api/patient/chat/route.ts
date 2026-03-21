import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const interventionId = request.headers.get("x-intervention-id");
  if (!interventionId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("intervention_id", interventionId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Error al cargar mensajes" }, { status: 500 });
  }

  return NextResponse.json(messages || []);
}
