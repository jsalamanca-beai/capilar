import { getOpenAI } from "./client";
import { getRouterPrompt } from "./prompts/router";
import { getSurgeryAgentPrompt } from "./prompts/surgery-agent";
import { getExperienceAgentPrompt } from "./prompts/experience-agent";
import { getRiskAgentPrompt } from "./prompts/risk-agent";
import { getCurrentPhase } from "@/lib/timeline/compute-phase";
import { MEDICATIONS } from "@/lib/constants/medications";
import type { InterventionTimeline } from "@/lib/types/database";

export type AgentType = "surgery_expert" | "patient_experience" | "risk_prevention";

interface RouteResult {
  agent: AgentType;
  escalate: boolean;
}

export async function routeMessage(
  message: string,
  intervention: InterventionTimeline
): Promise<RouteResult> {
  const openai = getOpenAI();
  const phase = getCurrentPhase(intervention.current_day);

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: getRouterPrompt({
          postOpDay: intervention.current_day,
          currentPhase: phase?.title || "desconocida",
        }),
      },
      { role: "user", content: message },
    ],
    max_tokens: 10,
    temperature: 0,
  });

  const classification = res.choices[0]?.message?.content?.trim().toUpperCase() || "SURGERY";

  if (classification === "ESCALATE") {
    return { agent: "surgery_expert", escalate: true };
  }

  const agentMap: Record<string, AgentType> = {
    SURGERY: "surgery_expert",
    EXPERIENCE: "patient_experience",
    RISK: "risk_prevention",
  };

  return {
    agent: agentMap[classification] || "surgery_expert",
    escalate: false,
  };
}

export function getAgentSystemPrompt(
  agent: AgentType,
  intervention: InterventionTimeline
): string {
  const phase = getCurrentPhase(intervention.current_day);
  const phaseName = phase?.title || "desconocida";
  const patientName = intervention.first_name;

  switch (agent) {
    case "surgery_expert":
      return getSurgeryAgentPrompt({
        patientName,
        postOpDay: intervention.current_day,
        currentPhase: phaseName,
        graftsCount: intervention.grafts_count,
        technique: intervention.technique,
      });

    case "patient_experience":
      return getExperienceAgentPrompt({
        patientName,
        postOpDay: intervention.current_day,
        currentPhase: phaseName,
      });

    case "risk_prevention": {
      const day = intervention.current_day;
      const activeMeds = MEDICATIONS
        .filter((m) => day >= m.startDay && day < m.startDay + m.durationDays)
        .map((m) => `${m.name} ${m.dosage} ${m.frequency}`)
        .join(", ") || "ninguna activa";

      return getRiskAgentPrompt({
        patientName,
        postOpDay: day,
        currentPhase: phaseName,
        activeMedications: activeMeds,
      });
    }
  }
}

export const AGENT_LABELS: Record<AgentType, { name: string; icon: string }> = {
  surgery_expert: { name: "Experto Quirurgico", icon: "🩺" },
  patient_experience: { name: "Companero de Experiencia", icon: "💛" },
  risk_prevention: { name: "Prevencion de Riesgos", icon: "🛡️" },
};

export const ESCALATION_MESSAGE = `Entiendo tu preocupacion. Lo que describes requiere atencion directa de nuestro equipo medico.

He notificado al equipo de Capilex Madrid para que se pongan en contacto contigo lo antes posible.

Mientras tanto:
- Si es una urgencia grave, acude a urgencias del hospital mas cercano.
- Puedes llamar a la clinica en horario de atencion.
- Para recetas: recetas@capilexmadrid.es

Un miembro del equipo te contactara pronto.`;
