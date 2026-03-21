/**
 * Telegram Bot - Canal privado de la clinica Capilex
 *
 * Envia notificaciones al grupo/canal privado de Telegram del equipo clinico.
 *
 * SETUP:
 * 1. Habla con @BotFather en Telegram y crea un bot nuevo
 * 2. Copia el token y ponlo en TELEGRAM_BOT_TOKEN
 * 3. Crea un grupo privado en Telegram y anade el bot como admin
 * 4. Para obtener el chat_id del grupo, envia un mensaje al grupo
 *    y visita: https://api.telegram.org/bot<TOKEN>/getUpdates
 *    El chat_id del grupo aparece como un numero negativo (ej: -1001234567890)
 * 5. Pon ese chat_id en TELEGRAM_CLINIC_CHAT_ID
 */

const TELEGRAM_API = "https://api.telegram.org/bot";

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CLINIC_CHAT_ID;

  if (!token || !chatId) {
    return null;
  }
  return { token, chatId };
}

async function sendMessage(text: string, parseMode: "HTML" | "Markdown" = "HTML") {
  const config = getConfig();
  if (!config) {
    console.warn("[Telegram] Bot no configurado, saltando notificacion");
    return;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}${config.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[Telegram] Error enviando mensaje:", err);
    }
  } catch (error) {
    console.error("[Telegram] Error de conexion:", error);
  }
}

// ============================================================
// NOTIFICACIONES ESPECIFICAS
// ============================================================

/** Cuando un paciente sube una foto */
export async function notifyPhotoUploaded(params: {
  patientName: string;
  dayOffset: number;
  zone: string;
  aiRiskLevel?: string;
}) {
  const urgencyEmoji =
    params.aiRiskLevel === "urgente"
      ? "🔴"
      : params.aiRiskLevel === "atencion_clinica"
        ? "🟡"
        : "🟢";

  await sendMessage(
    `📸 <b>Nueva foto de paciente</b>\n\n` +
    `${urgencyEmoji} Paciente: <b>${params.patientName}</b>\n` +
    `📅 Dia postoperatorio: <b>${params.dayOffset}</b>\n` +
    `📍 Zona: ${params.zone}\n` +
    `${params.aiRiskLevel ? `🤖 Evaluacion IA: <b>${params.aiRiskLevel.toUpperCase()}</b>` : ""}` +
    `\n\n👉 Revisar en el panel de administracion`
  );
}

/** Cuando la IA escala una conversacion */
export async function notifyEscalation(params: {
  patientName: string;
  dayOffset: number;
  urgency: "medium" | "high" | "emergency";
  reason: string;
  lastMessage: string;
}) {
  const urgencyMap = {
    medium: "🟡 MEDIA",
    high: "🔴 ALTA",
    emergency: "🚨 EMERGENCIA",
  };

  await sendMessage(
    `⚠️ <b>ESCALADO DE CHAT</b>\n\n` +
    `Urgencia: <b>${urgencyMap[params.urgency]}</b>\n` +
    `Paciente: <b>${params.patientName}</b>\n` +
    `Dia postoperatorio: ${params.dayOffset}\n` +
    `Motivo: ${params.reason}\n\n` +
    `💬 Ultimo mensaje:\n<i>"${params.lastMessage.slice(0, 200)}"</i>\n\n` +
    `👉 Responder en el panel de administracion`
  );
}

/** Recordatorio de plazos preoperatorios */
export async function notifyPreOpDeadline(params: {
  patientName: string;
  surgeryDate: string;
  daysUntilSurgery: number;
  pendingItems: string[];
}) {
  const items = params.pendingItems
    .map((item) => `  • ${item}`)
    .join("\n");

  await sendMessage(
    `📋 <b>Plazo preoperatorio</b>\n\n` +
    `Paciente: <b>${params.patientName}</b>\n` +
    `🗓 Cirugia: <b>${params.surgeryDate}</b>\n` +
    `⏰ Faltan: <b>${params.daysUntilSurgery} dias</b>\n\n` +
    `Pendiente:\n${items || "  ✅ Todo en orden"}`
  );
}

/** Cuando un paciente no ha enviado fotos requeridas */
export async function notifyMissingPhotos(params: {
  patientName: string;
  dayOffset: number;
  expectedDay: number;
}) {
  await sendMessage(
    `📷 <b>Fotos pendientes</b>\n\n` +
    `Paciente: <b>${params.patientName}</b>\n` +
    `Dia postoperatorio: ${params.dayOffset}\n` +
    `⚠️ No ha enviado las fotos del dia ${params.expectedDay}\n\n` +
    `Considerar contactar al paciente para seguimiento.`
  );
}

/** Resumen diario de pacientes activos */
export async function notifyDailySummary(params: {
  totalActive: number;
  preOpPatients: { name: string; daysUntil: number }[];
  postOpCritical: { name: string; day: number }[];
  pendingPhotos: { name: string; day: number }[];
  pendingEscalations: number;
}) {
  let summary =
    `📊 <b>RESUMEN DIARIO CAPILEX</b>\n` +
    `${"─".repeat(25)}\n\n` +
    `👥 Pacientes activos: <b>${params.totalActive}</b>\n`;

  if (params.preOpPatients.length > 0) {
    summary += `\n🗓 <b>Proximas cirugias:</b>\n`;
    for (const p of params.preOpPatients) {
      summary += `  • ${p.name} — en ${p.daysUntil} dias\n`;
    }
  }

  if (params.postOpCritical.length > 0) {
    summary += `\n🏥 <b>Postop critico (dia 1-7):</b>\n`;
    for (const p of params.postOpCritical) {
      summary += `  • ${p.name} — dia ${p.day}\n`;
    }
  }

  if (params.pendingPhotos.length > 0) {
    summary += `\n📷 <b>Fotos pendientes:</b>\n`;
    for (const p of params.pendingPhotos) {
      summary += `  • ${p.name} — dia ${p.day}\n`;
    }
  }

  if (params.pendingEscalations > 0) {
    summary += `\n⚠️ <b>Escalados sin resolver: ${params.pendingEscalations}</b>\n`;
  }

  summary += `\n${"─".repeat(25)}\n`;
  summary += `<i>Generado automaticamente por Capilex App</i>`;

  await sendMessage(summary);
}

/** Cuando un paciente da su consentimiento y accede por primera vez */
export async function notifyPatientFirstAccess(params: {
  patientName: string;
  surgeryDate: string;
}) {
  await sendMessage(
    `🆕 <b>Nuevo acceso de paciente</b>\n\n` +
    `Paciente: <b>${params.patientName}</b>\n` +
    `🗓 Cirugia programada: ${params.surgeryDate}\n` +
    `✅ Ha accedido a la app por primera vez`
  );
}
