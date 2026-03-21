import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const interventionId = request.headers.get("x-intervention-id");
  if (!interventionId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { taskId, dayOffset, undo } = await request.json();

  const supabase = createServiceClient();

  if (undo) {
    // Remove completion
    await supabase
      .from("cap_task_completions")
      .delete()
      .eq("intervention_id", interventionId)
      .eq("protocol_task_item_id", taskId)
      .eq("day_offset", dayOffset);
  } else {
    // Upsert completion
    await supabase.from("cap_task_completions").upsert(
      {
        intervention_id: interventionId,
        protocol_task_item_id: taskId,
        day_offset: dayOffset,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "intervention_id,protocol_task_item_id,day_offset" }
    );
  }

  return NextResponse.json({ success: true });
}
