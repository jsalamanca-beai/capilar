import { getOpenAI } from "./client";
import { getPhotoAnalysisPrompt } from "./prompts/photo-analysis";
import type { PhotoAnalysis } from "@/lib/types/database";

export async function analyzePhoto(params: {
  imageBase64: string;
  mimeType: string;
  postOpDay: number;
  zone: string;
  graftsCount: number | null;
  technique: string | null;
}): Promise<PhotoAnalysis> {
  const openai = getOpenAI();

  const systemPrompt = getPhotoAnalysisPrompt({
    postOpDay: params.postOpDay,
    zone: params.zone,
    graftsCount: params.graftsCount,
    technique: params.technique,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${params.mimeType};base64,${params.imageBase64}`,
              detail: "high",
            },
          },
          {
            type: "text",
            text: `Analiza esta foto del cuero cabelludo. Zona indicada por el paciente: ${params.zone}. Dia postoperatorio: ${params.postOpDay}.`,
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from GPT-4o Vision");
  }

  return JSON.parse(content) as PhotoAnalysis;
}
