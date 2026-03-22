"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePatient } from "@/lib/hooks/usePatient";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { getCurrentPhase } from "@/lib/timeline/compute-phase";

export default function PatientHeader() {
  const { intervention } = usePatient();
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
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
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center
              text-text-muted hover:border-gold-border hover:text-gold transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
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
