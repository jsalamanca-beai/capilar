"use client";

import type { PhotoAnalysis } from "@/lib/types/database";

const PARAM_LABELS: Record<string, string> = {
  costras: "Costras",
  enrojecimiento: "Enrojecimiento",
  infeccion: "Signos infeccion",
  injertos: "Supervivencia injertos",
  cicatrizacion_donante: "Cicatrizacion donante",
  progreso_general: "Progreso general",
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color =
    score <= 2 ? "bg-success" : score <= 3 ? "bg-gold" : "bg-danger";
  const textColor =
    score <= 2 ? "text-success" : score <= 3 ? "text-gold" : "text-danger";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-text-muted w-36 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <span className={`${textColor} font-mono w-4 text-right`}>{score}</span>
    </div>
  );
}

export default function PhotoAnalysisCard({ analysis }: { analysis: PhotoAnalysis }) {
  const assessmentColors: Record<string, string> = {
    normal: "text-success",
    monitorizar: "text-gold",
    atencion_clinica: "text-danger",
    urgente: "text-danger",
  };

  const assessmentLabels: Record<string, string> = {
    normal: "Normal",
    monitorizar: "Monitorizar",
    atencion_clinica: "Atencion clinica",
    urgente: "URGENTE",
  };

  return (
    <div className="space-y-3">
      {/* Overall assessment */}
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-xs uppercase tracking-wider">Evaluacion IA</span>
        <span className={`font-semibold text-sm ${assessmentColors[analysis.overall_assessment] || "text-text"}`}>
          {assessmentLabels[analysis.overall_assessment] || analysis.overall_assessment}
        </span>
      </div>

      {/* Score bars */}
      <div className="space-y-2">
        {Object.entries(analysis.parameters).map(([key, param]) => (
          <ScoreBar
            key={key}
            label={PARAM_LABELS[key] || key}
            score={param.score}
          />
        ))}
      </div>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="mt-3">
          <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Recomendaciones</p>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-text flex gap-1.5">
                <span className="text-gold flex-shrink-0">›</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Patient message */}
      {analysis.patient_message && (
        <div className="mt-3 p-3 bg-gold-subtle border border-gold-border rounded-lg">
          <p className="text-xs text-text leading-relaxed">{analysis.patient_message}</p>
        </div>
      )}

      {/* Clinic contact alert */}
      {analysis.requires_clinic_contact && (
        <div className="mt-3 p-3 bg-danger-bg border border-danger-border rounded-lg flex gap-2 items-start">
          <span className="text-danger">⚠️</span>
          <p className="text-xs text-danger font-medium">
            Recomendamos contactar con la clinica para una valoracion presencial.
          </p>
        </div>
      )}
    </div>
  );
}
