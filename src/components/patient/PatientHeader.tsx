"use client";

import Image from "next/image";
import { usePatient } from "@/lib/hooks/usePatient";
import { getCurrentPhase } from "@/lib/timeline/compute-phase";

export default function PatientHeader() {
  const { intervention } = usePatient();

  if (!intervention) return null;

  const currentDay = intervention.current_day;
  const phase = getCurrentPhase(currentDay);

  const dayLabel =
    currentDay < 0
      ? `${Math.abs(currentDay)} dias para la cirugia`
      : currentDay === 0
        ? "Hoy es tu cirugia"
        : `Dia ${currentDay} postoperatorio`;

  return (
    <header className="bg-black border-b border-[#1a1a1a] px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-capilex.png"
            alt="Capilex"
            width={80}
            height={43}
            className="opacity-80"
          />
        </div>
        <div className="text-right">
          <p className="text-gold text-sm font-medium">{dayLabel}</p>
          {phase && (
            <span className="badge text-[9px]">{phase.badge}</span>
          )}
        </div>
      </div>
    </header>
  );
}
