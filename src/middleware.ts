import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyPatientJWT, PATIENT_COOKIE_NAME } from "@/lib/auth/patient-jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Patient routes: validate JWT cookie
  if (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/checklist") ||
      pathname.startsWith("/photos") ||
      pathname.startsWith("/chat") ||
      pathname.startsWith("/medications") ||
      pathname.startsWith("/shopping") ||
      pathname.startsWith("/emergency") ||
      pathname.startsWith("/timeline")) {
    const token = request.cookies.get(PATIENT_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = await verifyPatientJWT(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(PATIENT_COOKIE_NAME);
      return response;
    }
  }

  // Patient API routes: validate JWT
  if (pathname.startsWith("/api/patient")) {
    const token = request.cookies.get(PATIENT_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const payload = await verifyPatientJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Sesion expirada" }, { status: 401 });
    }
    // Inject payload into headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-intervention-id", payload.intervention_id);
    requestHeaders.set("x-patient-id", payload.patient_id);
    requestHeaders.set("x-clinic-id", payload.clinic_id);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Cron routes: validate secret
  if (pathname.startsWith("/api/cron")) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checklist/:path*",
    "/photos/:path*",
    "/chat/:path*",
    "/medications/:path*",
    "/shopping/:path*",
    "/emergency/:path*",
    "/timeline/:path*",
    "/api/patient/:path*",
    "/api/cron/:path*",
  ],
};
