"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePatient } from "@/lib/hooks/usePatient";
import { getCurrentPhase } from "@/lib/timeline/compute-phase";

export default function PatientHeader() {
  const { intervention } = usePatient();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

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
            className="opacity-80 logo-dark"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-gold text-sm font-medium">{dayLabel}</p>
            {phase && (
              <span className="badge text-[9px]">{phase.badge}</span>
            )}
          </div>
          <Link
            href="/emergency"
            className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center
              text-text-muted hover:border-danger-border hover:text-danger transition-colors"
            aria-label="Ayuda"
          >
            <span className="text-[10px]">Ayuda</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center
              text-text-muted hover:border-gold-border hover:text-gold transition-colors"
            aria-label="Salir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
