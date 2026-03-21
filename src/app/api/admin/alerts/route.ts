import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  // Unreviewed photos
  const { data: photos } = await supabase
    .from("photos")
    .select("id, intervention_id, day_offset, zone, ai_analysis, is_flagged, created_at")
    .is("staff_reviewed_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  // Unread escalations
  const { data: escalations } = await supabase
    .from("chat_messages")
    .select("id, intervention_id, content, day_offset, created_at")
    .eq("is_escalated", true)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  // Upcoming surgeries (next 7 days)
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data: upcoming } = await supabase
    .from("intervention_timeline")
    .select("*")
    .gte("surgery_date", today)
    .lte("surgery_date", nextWeek)
    .order("surgery_date");

  return NextResponse.json({
    unreviewed_photos: photos || [],
    pending_escalations: escalations || [],
    upcoming_surgeries: upcoming || [],
    counts: {
      photos: photos?.length || 0,
      escalations: escalations?.length || 0,
      upcoming: upcoming?.length || 0,
    },
  });
}
