import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { analyzePhoto } from "@/lib/openai/analyze-photo";
import { notifyPhotoUploaded } from "@/lib/telegram/bot";

export async function POST(request: NextRequest) {
  const interventionId = request.headers.get("x-intervention-id");
  if (!interventionId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const zone = (formData.get("zone") as string) || "frontal";

  if (!file) {
    return NextResponse.json({ error: "No se recibio imagen" }, { status: 400 });
  }

  // Validate file
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Formato no soportado. Usa JPEG, PNG o WebP." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Imagen demasiado grande. Maximo 10MB." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Get intervention data
  const { data: intervention } = await supabase
    .from("cap_intervention_timeline")
    .select("*")
    .eq("id", interventionId)
    .single();

  if (!intervention) {
    return NextResponse.json({ error: "Intervencion no encontrada" }, { status: 404 });
  }

  const currentDay = intervention.current_day;
  const timestamp = Date.now();
  const ext = file.type === "image/png" ? "png" : "jpg";
  const storagePath = `${interventionId}/originals/${timestamp}_${zone}.${ext}`;

  // Upload to Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("patient-photos")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }

  // Analyze with GPT-4o Vision
  let aiAnalysis = null;
  let aiRiskLevel = "normal";
  try {
    const base64 = buffer.toString("base64");
    aiAnalysis = await analyzePhoto({
      imageBase64: base64,
      mimeType: file.type,
      postOpDay: currentDay,
      zone,
      graftsCount: intervention.grafts_count,
      technique: intervention.technique,
    });
    aiRiskLevel = aiAnalysis.overall_assessment === "urgente"
      ? "urgente"
      : aiAnalysis.overall_assessment === "atencion_clinica"
        ? "atencion_clinica"
        : aiAnalysis.overall_assessment === "monitorizar"
          ? "monitorizar"
          : "normal";
  } catch (err) {
    console.error("AI analysis error:", err);
    // Continue without analysis - photo is still saved
  }

  // Save to database
  const { data: photo, error: dbError } = await supabase
    .from("cap_photos")
    .insert({
      intervention_id: interventionId,
      storage_path: storagePath,
      day_offset: currentDay,
      zone,
      photo_type: "progress",
      ai_analysis: aiAnalysis,
      ai_analyzed_at: aiAnalysis ? new Date().toISOString() : null,
      is_flagged: aiRiskLevel === "urgente" || aiRiskLevel === "atencion_clinica",
    })
    .select()
    .single();

  if (dbError) {
    console.error("DB insert error:", dbError);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }

  // Notify clinic via Telegram
  const patientName = `${intervention.first_name} ${intervention.last_name}`;
  await notifyPhotoUploaded({
    patientName,
    dayOffset: currentDay,
    zone,
    aiRiskLevel,
  });

  return NextResponse.json({
    photo,
    analysis: aiAnalysis,
  });
}
