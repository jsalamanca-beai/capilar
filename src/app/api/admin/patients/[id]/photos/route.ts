import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("intervention_id", id)
    .order("created_at", { ascending: false });

  const photosWithUrls = await Promise.all(
    (photos || []).map(async (photo) => {
      const { data: urlData } = await supabase.storage
        .from("patient-photos")
        .createSignedUrl(photo.storage_path, 3600);
      return { ...photo, image_url: urlData?.signedUrl || null };
    })
  );

  return NextResponse.json(photosWithUrls);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { photoId, staff_review } = await request.json();
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("photos")
    .update({
      staff_review,
      staff_reviewed_at: new Date().toISOString(),
    })
    .eq("id", photoId)
    .eq("intervention_id", id);

  if (error) {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
