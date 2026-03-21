import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("intervention_timeline")
    .select("*")
    .order("surgery_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Error al cargar pacientes" }, { status: 500 });
  }

  // Enrich with pending counts
  const enriched = await Promise.all(
    (data || []).map(async (inv) => {
      const { count: pendingPhotos } = await supabase
        .from("photos")
        .select("*", { count: "exact", head: true })
        .eq("intervention_id", inv.id)
        .is("staff_reviewed_at", null);

      const { count: escalatedChats } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("intervention_id", inv.id)
        .eq("is_escalated", true)
        .is("read_at", null);

      return {
        ...inv,
        pending_photos: pendingPhotos || 0,
        pending_escalations: escalatedChats || 0,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { first_name, last_name, email, phone, surgery_date, grafts_count, technique, surgeon_name } = body;

  if (!first_name || !last_name || !surgery_date) {
    return NextResponse.json({ error: "Nombre, apellidos y fecha de cirugia son obligatorios" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const clinicId = "00000000-0000-0000-0000-000000000001";
  const protocolId = "00000000-0000-0000-0000-000000000010";

  // Create patient
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .insert({ clinic_id: clinicId, first_name, last_name, email, phone })
    .select()
    .single();

  if (patientError || !patient) {
    return NextResponse.json({ error: "Error al crear paciente" }, { status: 500 });
  }

  // Generate access code
  const code = Array.from({ length: 8 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");

  // Create intervention
  const { data: intervention, error: intError } = await supabase
    .from("interventions")
    .insert({
      patient_id: patient.id,
      protocol_id: protocolId,
      clinic_id: clinicId,
      access_code: code,
      surgery_date,
      status: "scheduled",
      grafts_count: grafts_count || null,
      technique: technique || "FUE",
      surgeon_name: surgeon_name || null,
    })
    .select()
    .single();

  if (intError || !intervention) {
    return NextResponse.json({ error: "Error al crear intervencion" }, { status: 500 });
  }

  return NextResponse.json({
    patient,
    intervention,
    access_code: code,
    access_link: `/login?code=${code}`,
  });
}
