import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const interventionId = request.headers.get("x-intervention-id");
  if (!interventionId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get intervention with protocol
  const { data: intervention } = await supabase
    .from("cap_intervention_timeline")
    .select("*")
    .eq("id", interventionId)
    .single();

  if (!intervention) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Allow querying tasks for a specific day (for phase expansion)
  const url = new URL(request.url);
  const queryDay = url.searchParams.get("day");
  const targetDay = queryDay !== null ? parseInt(queryDay) : intervention.current_day;

  // Get all tasks that are active for the target day
  const { data: tasks } = await supabase
    .from("cap_protocol_task_items")
    .select("*")
    .eq("protocol_id", intervention.protocol_id)
    .eq("is_active", true)
    .lte("day_offset", targetDay)
    .or(`day_offset_end.gte.${targetDay},day_offset_end.is.null`)
    .order("sort_order");

  // Get completions for the target day
  const { data: completions } = await supabase
    .from("cap_task_completions")
    .select("*")
    .eq("intervention_id", interventionId)
    .eq("day_offset", targetDay);

  return NextResponse.json({
    intervention,
    tasks: tasks || [],
    completions: completions || [],
    currentDay: intervention.current_day,
    targetDay,
  });
}
