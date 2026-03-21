import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/openai/client";
import {
  routeMessage,
  getAgentSystemPrompt,
  ESCALATION_MESSAGE,
  type AgentType,
} from "@/lib/openai/chat-router";
import { notifyEscalation } from "@/lib/telegram/bot";

export async function POST(request: NextRequest) {
  const interventionId = request.headers.get("x-intervention-id");
  if (!interventionId) {
    return new Response("No autorizado", { status: 401 });
  }

  const { message } = await request.json();
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return new Response("Mensaje vacio", { status: 400 });
  }

  const supabase = createServiceClient();

  // Get intervention
  const { data: intervention } = await supabase
    .from("intervention_timeline")
    .select("*")
    .eq("id", interventionId)
    .single();

  if (!intervention) {
    return new Response("No encontrado", { status: 404 });
  }

  // Save patient message
  await supabase.from("chat_messages").insert({
    intervention_id: interventionId,
    role: "patient",
    content: message.trim(),
    day_offset: intervention.current_day,
  });

  // Route message
  const { agent, escalate } = await routeMessage(message, intervention);

  // Handle escalation
  if (escalate) {
    await supabase.from("chat_messages").insert({
      intervention_id: interventionId,
      role: "ai_agent",
      content: ESCALATION_MESSAGE,
      metadata: { agent_type: "surgery_expert", escalated: true },
      day_offset: intervention.current_day,
      is_escalated: true,
    });

    await notifyEscalation({
      patientName: `${intervention.first_name} ${intervention.last_name}`,
      dayOffset: intervention.current_day,
      urgency: "high",
      reason: "Paciente requiere atencion humana",
      lastMessage: message.trim().slice(0, 300),
    });

    // Return escalation as SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ agent, escalated: true })}\n\n`)
        );
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: ESCALATION_MESSAGE, done: true })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Get conversation history (last 20 messages)
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content, metadata")
    .eq("intervention_id", interventionId)
    .order("created_at", { ascending: false })
    .limit(20);

  const chatHistory = (history || []).reverse().map((msg) => ({
    role: msg.role === "patient" ? ("user" as const) : ("assistant" as const),
    content: msg.content,
  }));

  // Stream agent response
  const openai = getOpenAI();
  const systemPrompt = getAgentSystemPrompt(agent, intervention);

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...chatHistory,
    ],
    max_tokens: 500,
    temperature: 0.4,
    stream: true,
  });

  // Create SSE response
  const encoder = new TextEncoder();
  let fullContent = "";

  const responseStream = new ReadableStream({
    async start(controller) {
      // Send agent info first
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ agent, escalated: false })}\n\n`)
      );

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullContent += delta;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
          );
        }
      }

      // Save complete AI message to DB
      await saveAIMessage(supabase, interventionId, agent, fullContent, intervention.current_day);

      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function saveAIMessage(
  supabase: ReturnType<typeof createServiceClient>,
  interventionId: string,
  agent: AgentType,
  content: string,
  dayOffset: number
) {
  await supabase.from("chat_messages").insert({
    intervention_id: interventionId,
    role: "ai_agent",
    content,
    metadata: { agent_type: agent, model: "gpt-4o" },
    day_offset: dayOffset,
  });
}
