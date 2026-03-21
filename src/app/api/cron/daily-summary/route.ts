import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  notifyDailySummary,
  notifyPreOpDeadline,
  notifyMissingPhotos,
} from "@/lib/telegram/bot";

/**
 * Cron job: resumen diario para el canal de Telegram de la clinica.
 * Se ejecuta cada dia a las 08:00 via Vercel Cron.
 *
 * vercel.json:
 * { "crons": [{ "path": "/api/cron/daily-summary", "schedule": "0 8 * * *" }] }
 */
export async function POST(request: NextRequest) {
  // Auth check is handled by middleware (CRON_SECRET)
  const supabase = createServiceClient();

  // Get all active interventions
  const { data: interventions } = await supabase
    .from("intervention_timeline")
    .select("*")
    .eq("is_active", true);

  if (!interventions || interventions.length === 0) {
    return NextResponse.json({ message: "No active interventions" });
  }

  // Classify patients
  const preOpPatients: { name: string; daysUntil: number }[] = [];
  const postOpCritical: { name: string; day: number }[] = [];
  const photoCheckDays = [7, 10, 120, 180, 270, 365];

  for (const inv of interventions) {
    const name = `${inv.first_name} ${inv.last_name}`;
    const day = inv.current_day;

    // Pre-op patients with upcoming surgery (next 7 days)
    if (day >= -7 && day < 0) {
      preOpPatients.push({ name, daysUntil: Math.abs(day) });

      // Check if they have pending pre-op items
      const pendingItems: string[] = [];
      if (!inv.pre_op_lab_completed) {
        pendingItems.push("Analitica preoperatoria");
      }
      if (pendingItems.length > 0) {
        await notifyPreOpDeadline({
          patientName: name,
          surgeryDate: inv.surgery_date,
          daysUntilSurgery: Math.abs(day),
          pendingItems,
        });
      }
    }

    // Post-op critical (days 1-7)
    if (day >= 1 && day <= 7) {
      postOpCritical.push({ name, day });
    }

    // Check for missing photos on key days
    if (photoCheckDays.includes(day)) {
      const { data: photos } = await supabase
        .from("photos")
        .select("id")
        .eq("intervention_id", inv.id)
        .eq("day_offset", day)
        .limit(1);

      if (!photos || photos.length === 0) {
        await notifyMissingPhotos({
          patientName: name,
          dayOffset: day,
          expectedDay: day,
        });
      }
    }
  }

  // Count pending escalations
  const { count: pendingEscalations } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("is_escalated", true)
    .is("read_at", null);

  // Check for missing photos across all patients on photo days
  const pendingPhotos: { name: string; day: number }[] = [];
  for (const inv of interventions) {
    const day = inv.current_day;
    if (photoCheckDays.includes(day - 1)) {
      // Yesterday was photo day, check if submitted
      const { data: photos } = await supabase
        .from("photos")
        .select("id")
        .eq("intervention_id", inv.id)
        .eq("day_offset", day - 1)
        .limit(1);

      if (!photos || photos.length === 0) {
        pendingPhotos.push({
          name: `${inv.first_name} ${inv.last_name}`,
          day: day - 1,
        });
      }
    }
  }

  // Send daily summary
  await notifyDailySummary({
    totalActive: interventions.length,
    preOpPatients,
    postOpCritical,
    pendingPhotos,
    pendingEscalations: pendingEscalations || 0,
  });

  return NextResponse.json({
    message: "Daily summary sent",
    stats: {
      totalActive: interventions.length,
      preOp: preOpPatients.length,
      critical: postOpCritical.length,
      pendingPhotos: pendingPhotos.length,
      escalations: pendingEscalations,
    },
  });
}
