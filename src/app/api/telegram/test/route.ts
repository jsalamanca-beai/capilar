import { NextResponse } from "next/server";
import {
  notifyDailySummary,
  notifyPhotoUploaded,
  notifyEscalation,
  notifyPreOpDeadline,
  notifyPatientFirstAccess,
} from "@/lib/telegram/bot";

/**
 * GET /api/telegram/test
 *
 * Envia mensajes de prueba al canal de Telegram de la clinica.
 * Solo disponible en desarrollo. En produccion se desactiva.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible en produccion" }, { status: 403 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CLINIC_CHAT_ID;

  if (!token || !chatId || token.includes("your_")) {
    return NextResponse.json({
      error: "Telegram no configurado",
      help: "Configura TELEGRAM_BOT_TOKEN y TELEGRAM_CLINIC_CHAT_ID en .env.local",
      docs: "/docs/setup-telegram.html",
    }, { status: 400 });
  }

  try {
    // Test 1: Resumen diario
    await notifyDailySummary({
      totalActive: 8,
      preOpPatients: [
        { name: "Jose Salamanca", daysUntil: 3 },
        { name: "Maria Lopez", daysUntil: 7 },
      ],
      postOpCritical: [
        { name: "Carlos Ruiz", day: 2 },
        { name: "Ana Garcia", day: 5 },
      ],
      pendingPhotos: [
        { name: "Pedro Martin", day: 7 },
      ],
      pendingEscalations: 1,
    });

    // Esperar 1 segundo para no saturar
    await new Promise((r) => setTimeout(r, 1000));

    // Test 2: Foto subida
    await notifyPhotoUploaded({
      patientName: "Jose Salamanca (TEST)",
      dayOffset: 7,
      zone: "frontal",
      aiRiskLevel: "normal",
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Test 3: Escalado
    await notifyEscalation({
      patientName: "Carlos Ruiz (TEST)",
      dayOffset: 3,
      urgency: "high",
      reason: "Paciente reporta dolor intenso que no cede con paracetamol",
      lastMessage: "Hola, llevo 2 dias con mucho dolor en la zona donante y el paracetamol no me hace nada. Estoy preocupado.",
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Test 4: Plazo pre-op
    await notifyPreOpDeadline({
      patientName: "Maria Lopez (TEST)",
      surgeryDate: "2026-03-28",
      daysUntilSurgery: 7,
      pendingItems: ["Analitica preoperatoria", "Comprar Agua Termal AVENE"],
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Test 5: Primer acceso
    await notifyPatientFirstAccess({
      patientName: "Ana Garcia (TEST)",
      surgeryDate: "2026-04-05",
    });

    return NextResponse.json({
      success: true,
      message: "5 mensajes de prueba enviados al canal de Telegram",
      tests: [
        "Resumen diario",
        "Foto subida por paciente",
        "Escalado de chat (urgencia alta)",
        "Plazo preoperatorio con pendientes",
        "Primer acceso de paciente",
      ],
    });
  } catch (error) {
    return NextResponse.json({
      error: "Error enviando mensajes",
      detail: String(error),
    }, { status: 500 });
  }
}
