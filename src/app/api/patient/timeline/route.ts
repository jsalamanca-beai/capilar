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
    .from("intervention_timeline")
    .select("*")
    .eq("id", interventionId)
    .single();

  if (!intervention) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const currentDay = intervention.current_day;

  // Get tasks for current day
  const { data: tasks } = await supabase
    .from("protocol_task_items")
    .select("*")
    .eq("protocol_id", intervention.protocol_id)
    .eq("is_active", true)
    .lte("day_offset", currentDay)
    .or(`day_offset_end.gte.${currentDay},day_offset_end.is.null`)
    .order("sort_order");

  // Get completions for today
  const { data: completions } = await supabase
    .from("task_completions")
    .select("*")
    .eq("intervention_id", interventionId)
    .eq("day_offset", currentDay);

  return NextResponse.json({
    intervention,
    tasks: tasks || [],
    completions: completions || [],
    currentDay,
  });
}
