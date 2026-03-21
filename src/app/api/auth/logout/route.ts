import { NextResponse } from "next/server";
import { PATIENT_COOKIE_NAME } from "@/lib/auth/patient-jwt";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear patient cookie
  response.cookies.delete(PATIENT_COOKIE_NAME);

  // Clear staff cookies
  response.cookies.delete("sb-access-token");
  response.cookies.delete("sb-refresh-token");

  return response;
}
