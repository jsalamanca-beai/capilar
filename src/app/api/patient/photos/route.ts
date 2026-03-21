import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const interventionId = request.headers.get("x-intervention-id");
  if (!interventionId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: photos, error } = await supabase
    .from("cap_photos")
    .select("*")
    .eq("intervention_id", interventionId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Error al cargar fotos" }, { status: 500 });
  }

  // Generate signed URLs for each photo
  const photosWithUrls = await Promise.all(
    (photos || []).map(async (photo) => {
      const { data: urlData } = await supabase.storage
        .from("patient-photos")
        .createSignedUrl(photo.storage_path, 3600); // 1h expiry

      return {
        ...photo,
        image_url: urlData?.signedUrl || null,
      };
    })
  );

  return NextResponse.json(photosWithUrls);
}
