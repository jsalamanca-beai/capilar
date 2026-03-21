"use client";

import { usePatient } from "@/lib/hooks/usePatient";
import DayCounter from "@/components/patient/DayCounter";
import TimelineView from "@/components/patient/TimelineView";
import { DAY_SPECIFIC_MESSAGES, PHASE_REASSURANCE } from "@/lib/content/phase-reassurance";
import { getCurrentPhase } from "@/lib/timeline/compute-phase";
import OnboardingOverlay from "@/components/patient/OnboardingOverlay";

export default function PatientDashboard() {
  const { intervention, loading, error } = usePatient();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !intervention) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="card p-6 text-center max-w-sm">
          <p className="text-danger mb-2">{error || "Error desconocido"}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-gold text-sm underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const currentDay = intervention.current_day;
  const phase = getCurrentPhase(currentDay);
  const dayMessage = DAY_SPECIFIC_MESSAGES[currentDay];
  const phaseMessage = phase ? PHASE_REASSURANCE[phase.key] : null;
  const motivationalMessage = dayMessage || phaseMessage;

  return (
    <div className="max-w-lg mx-auto">
      <OnboardingOverlay firstName={intervention.first_name} />
      <DayCounter
        currentDay={currentDay}
        firstName={intervention.first_name}
      />

      {/* Day-specific banner */}
      {(currentDay === 0 || currentDay === 1) && (
        <div className={`mx-4 mb-4 p-4 rounded-xl border text-center ${
          currentDay === 0
            ? "border-gold bg-gold-subtle"
            : "border-[#1a1a1a] bg-bg-card"
        }`}>
          <p className={`text-sm font-medium mb-1 ${currentDay === 0 ? "text-gold" : "text-gold"}`}>
            {currentDay === 0 ? "Hoy es el gran dia" : "Las primeras 24 horas"}
          </p>
          <p className="text-text-muted text-xs leading-relaxed">
            {dayMessage}
          </p>
        </div>
      )}

      {/* Motivational message (not on day 0 or 1, they have banners) */}
      {motivationalMessage && currentDay !== 0 && currentDay !== 1 && (
        <div className="mx-4 mb-3 px-4 py-3 rounded-lg bg-gold-subtle border border-gold-border">
          <p className="text-gold text-xs leading-relaxed">{motivationalMessage}</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 px-4 mb-4">
        <a
          href="/checklist"
          className="card p-3 text-center hover:border-gold-border transition-colors"
        >
          <span className="text-2xl">✅</span>
          <p className="text-[10px] text-text-muted mt-1">Tareas hoy</p>
        </a>
        <a
          href="/medications"
          className="card p-3 text-center hover:border-gold-border transition-colors"
        >
          <span className="text-2xl">💊</span>
          <p className="text-[10px] text-text-muted mt-1">Medicacion</p>
        </a>
        <a
          href={currentDay < 0 ? "/shopping" : "/photos"}
          className="card p-3 text-center hover:border-gold-border transition-colors"
        >
          <span className="text-2xl">{currentDay < 0 ? "🛒" : "📸"}</span>
          <p className="text-[10px] text-text-muted mt-1">
            {currentDay < 0 ? "Compras" : "Fotos"}
          </p>
        </a>
      </div>

      <TimelineView currentDay={currentDay} />
    </div>
  );
}
