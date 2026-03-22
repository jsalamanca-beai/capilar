import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { signPatientJWT, PATIENT_COOKIE_NAME } from "@/lib/auth/patient-jwt";
import { checkRateLimit } from "@/lib/auth/rate-limiter";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera 15 minutos." },
      { status: 429 }
    );
  }

  let body: { code?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Peticion invalida" },
      { status: 400 }
    );
  }

  const { code } = body;
  if (!code || typeof code !== "string" || code.trim().length < 4) {
    return NextResponse.json(
      { error: "Codigo invalido" },
      { status: 400 }
    );
  }

  const normalizedCode = code.trim().toUpperCase();

  const supabase = createServiceClient();
  const { data: intervention, error } = await supabase
    .from("cap_interventions")
    .select("id, patient_id, clinic_id, surgery_date, status, access_code_expires_at")
    .eq("access_code", normalizedCode)
    .eq("is_active", true)
    .single();

  if (error || !intervention) {
    console.error("[validate-code] Code lookup failed:", {
      code: normalizedCode,
      error: error?.message,
      errorCode: error?.code,
    });
    return NextResponse.json(
      { error: "Codigo no encontrado. Verifica con tu clinica." },
      { status: 404 }
    );
  }

  // Check expiration
  if (intervention.access_code_expires_at) {
    const expires = new Date(intervention.access_code_expires_at);
    if (expires < new Date()) {
      return NextResponse.json(
        { error: "Este codigo ha expirado. Contacta con tu clinica." },
        { status: 410 }
      );
    }
  }

  // Sign JWT
  const token = await signPatientJWT({
    intervention_id: intervention.id,
    patient_id: intervention.patient_id,
    clinic_id: intervention.clinic_id,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(PATIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90, // 90 days
    path: "/",
  });

  return response;
}
