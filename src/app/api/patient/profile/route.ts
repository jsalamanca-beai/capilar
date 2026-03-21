import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const interventionId = request.headers.get("x-intervention-id");
  if (!interventionId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("cap_intervention_timeline")
    .select("*")
    .eq("id", interventionId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Intervencion no encontrada" }, { status: 404 });
  }

  return NextResponse.json(data);
}
