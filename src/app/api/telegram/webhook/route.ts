import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const TELEGRAM_API = "https://api.telegram.org/bot";

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CLINIC_CHAT_ID;
  if (!token || !chatId) return null;
  return { token, chatId };
}

async function reply(chatId: number, text: string, token: string) {
  await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
}

// ============================================================
// COMMAND HANDLERS
// ============================================================

async function handlePaciente(args: string, chatId: number, token: string) {
  const supabase = createServiceClient();
  const searchTerm = args.trim();

  if (!searchTerm) {
    await reply(chatId, "Uso: <code>/paciente nombre apellido</code>", token);
    return;
  }

  // Search by name — split words to match across first_name and last_name
  const words = searchTerm.split(/\s+/).filter(Boolean);
  let query = supabase
    .from("cap_intervention_timeline")
    .select("*")
    .eq("is_active", true);

  for (const word of words) {
    query = query.or(`first_name.ilike.%${word}%,last_name.ilike.%${word}%`);
  }

  const { data: patients, error } = await query.order("surgery_date", { ascending: false });

  if (error || !patients || patients.length === 0) {
    await reply(chatId, `No se encontro ningun paciente con "<b>${searchTerm}</b>".`, token);
    return;
  }

  for (const p of patients.slice(0, 3)) {
    // Get photo count
    const { count: totalPhotos } = await supabase
      .from("cap_photos")
      .select("*", { count: "exact", head: true })
      .eq("intervention_id", p.id);

    // Get flagged photos (pending review)
    const { count: pendingPhotos } = await supabase
      .from("cap_photos")
      .select("*", { count: "exact", head: true })
      .eq("intervention_id", p.id)
      .is("staff_reviewed_at", null);

    // Get last photo AI assessment
    const { data: lastPhoto } = await supabase
      .from("cap_photos")
      .select("ai_analysis, zone, created_at")
      .eq("intervention_id", p.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get escalated chats
    const { count: escalations } = await supabase
      .from("cap_chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("intervention_id", p.id)
      .eq("is_escalated", true)
      .is("read_at", null);

    const dayLabel =
      p.current_day < 0
        ? `${Math.abs(p.current_day)} dias para cirugia`
        : p.current_day === 0
          ? "HOY es la cirugia"
          : `Dia ${p.current_day} postoperatorio`;

    const statusEmoji =
      p.current_day >= 1 && p.current_day <= 7
        ? "🔴"
        : p.current_day < 0
          ? "🔵"
          : "🟢";

    let lastPhotoInfo = "Sin fotos";
    if (lastPhoto?.ai_analysis) {
      const assessment = lastPhoto.ai_analysis.overall_assessment || "—";
      const assessmentEmoji =
        assessment === "urgente" ? "🔴" :
        assessment === "atencion_clinica" ? "🟡" :
        assessment === "monitorizar" ? "🟠" : "🟢";
      lastPhotoInfo = `${assessmentEmoji} ${assessment.toUpperCase()} (${lastPhoto.zone})`;
    } else if (lastPhoto) {
      lastPhotoInfo = `Zona: ${lastPhoto.zone} (sin analisis)`;
    }

    const msg =
      `${statusEmoji} <b>${p.first_name} ${p.last_name}</b>\n` +
      `${"─".repeat(25)}\n` +
      `📅 ${dayLabel}\n` +
      `🗓 Cirugia: <b>${p.surgery_date}</b>\n` +
      `✂️ Tecnica: ${p.technique || "—"} | Injertos: ${p.grafts_count || "—"}\n` +
      `👨‍⚕️ Cirujano: ${p.surgeon_name || "—"}\n\n` +
      `📸 Fotos: <b>${totalPhotos || 0}</b> total | <b>${pendingPhotos || 0}</b> sin revisar\n` +
      `🤖 Ultima foto: ${lastPhotoInfo}\n` +
      `⚠️ Escalados pendientes: <b>${escalations || 0}</b>\n` +
      `📱 Tel: ${p.patient_phone || "—"}\n` +
      `📧 Email: ${p.patient_email || "—"}`;

    await reply(chatId, msg, token);
  }

  if (patients.length > 3) {
    await reply(chatId, `... y ${patients.length - 3} pacientes mas. Se preciso en la busqueda.`, token);
  }
}

async function handlePacientes(chatId: number, token: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("cap_intervention_timeline")
    .select("*")
    .eq("is_active", true)
    .order("surgery_date", { ascending: true });

  if (error || !data || data.length === 0) {
    await reply(chatId, "No hay pacientes activos.", token);
    return;
  }

  let msg = `👥 <b>PACIENTES ACTIVOS (${data.length})</b>\n${"─".repeat(25)}\n\n`;

  for (const p of data) {
    const statusEmoji =
      p.current_day >= 1 && p.current_day <= 7
        ? "🔴"
        : p.current_day < 0
          ? "🔵"
          : "🟢";

    const dayLabel =
      p.current_day < 0
        ? `en ${Math.abs(p.current_day)}d`
        : p.current_day === 0
          ? "HOY"
          : `dia ${p.current_day}`;

    msg += `${statusEmoji} <b>${p.first_name} ${p.last_name}</b> — ${dayLabel}\n`;
  }

  msg += `\n<i>Usa /paciente nombre para ver detalle</i>`;
  await reply(chatId, msg, token);
}

async function handleHelp(chatId: number, token: string) {
  const msg =
    `🤖 <b>Comandos CapilexBot</b>\n` +
    `${"─".repeat(25)}\n\n` +
    `/paciente nombre — Info detallada de un paciente\n` +
    `/pacientes — Lista de pacientes activos\n` +
    `/ayuda — Mostrar este mensaje`;

  await reply(chatId, msg, token);
}

// ============================================================
// WEBHOOK HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  const config = getConfig();
  if (!config) {
    return NextResponse.json({ error: "Bot no configurado" }, { status: 500 });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  // Only respond in the clinic group
  const chatId = message.chat.id;
  if (String(chatId) !== config.chatId) {
    return NextResponse.json({ ok: true });
  }

  const text = message.text.trim();

  if (text.startsWith("/pacientes")) {
    await handlePacientes(chatId, config.token);
  } else if (text.startsWith("/paciente")) {
    const args = text.replace(/^\/paciente(@\w+)?/, "").trim();
    await handlePaciente(args, chatId, config.token);
  } else if (text.startsWith("/ayuda") || text.startsWith("/help") || text.startsWith("/start")) {
    await handleHelp(chatId, config.token);
  }

  return NextResponse.json({ ok: true });
}
