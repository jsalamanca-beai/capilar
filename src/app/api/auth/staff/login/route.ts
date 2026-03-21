import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contrasena requeridos" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  // Verify user is staff
  const { createClient: createService } = await import("@supabase/supabase-js");
  const serviceClient = createService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: staffData } = await serviceClient
    .from("staff")
    .select("id, clinic_id, full_name, role")
    .eq("id", data.user.id)
    .single();

  if (!staffData) {
    return NextResponse.json({ error: "No tienes acceso al panel de administracion" }, { status: 403 });
  }

  const response = NextResponse.json({
    user: staffData,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });

  response.cookies.set("sb-access-token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  response.cookies.set("sb-refresh-token", data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
