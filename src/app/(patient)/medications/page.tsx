"use client";

import { usePatient } from "@/lib/hooks/usePatient";
import { MEDICATIONS } from "@/lib/constants/medications";

export default function MedicationsPage() {
  const { intervention } = usePatient();
  if (!intervention) return null;

  const currentDay = intervention.current_day;

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h1 className="text-gold text-xs uppercase tracking-[3px] font-light mb-1">
        Medicacion
      </h1>
      <p className="text-text-muted text-sm mb-4">
        Protocolo postoperatorio Capilex
      </p>

      <div className="space-y-3">
        {MEDICATIONS.map((med) => {
          const isActive =
            currentDay >= med.startDay &&
            currentDay < med.startDay + med.durationDays;
          const isFinished = currentDay >= med.startDay + med.durationDays;
          const daysLeft = med.startDay + med.durationDays - currentDay;

          return (
            <div
              key={med.name}
              className={`card p-4 border-l-2 transition-opacity
                ${isActive ? "border-l-gold" : isFinished ? "border-l-success opacity-50" : "border-l-[#333] opacity-40"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-text-white text-sm font-medium">
                  {med.name}
                </h3>
                {isActive && (
                  <span className="badge text-[9px]">ACTIVO</span>
                )}
                {isFinished && (
                  <span className="text-[9px] px-2 py-0.5 rounded bg-success-bg text-success border border-success-border uppercase">
                    Completado
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-text-muted mt-2">
                <div>
                  <span className="text-text-muted/60">Dosis:</span>{" "}
                  <span className="text-text">{med.dosage}</span>
                </div>
                <div>
                  <span className="text-text-muted/60">Frecuencia:</span>{" "}
                  <span className="text-text">{med.frequency}</span>
                </div>
                <div>
                  <span className="text-text-muted/60">Tomas:</span>{" "}
                  <span className="text-text">
                    {med.mealtimes.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted/60">Duracion:</span>{" "}
                  <span className="text-text">{med.durationDays} dias</span>
                </div>
              </div>

              {med.instructions && (
                <p className="text-xs text-text-muted mt-2 italic">
                  {med.instructions}
                </p>
              )}

              {isActive && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-text-muted mb-1">
                    <span>Progreso</span>
                    <span>{daysLeft} dias restantes</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full"
                      style={{
                        width: `${((currentDay - med.startDay + 1) / med.durationDays) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {!med.mandatory && (
                <p className="text-[10px] text-gold-dim mt-2">
                  * Recomendado (no obligatorio)
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="card p-3 mt-4 text-center">
        <p className="text-text-muted text-xs">
          Recetas:{" "}
          <a
            href="mailto:recetas@capilexmadrid.es"
            className="text-gold underline"
          >
            recetas@capilexmadrid.es
          </a>
        </p>
      </div>
    </div>
  );
}
