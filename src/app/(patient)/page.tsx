"use client";

import { usePatient } from "@/lib/hooks/usePatient";
import DayCounter from "@/components/patient/DayCounter";
import TimelineView from "@/components/patient/TimelineView";

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

  return (
    <div className="max-w-lg mx-auto">
      <DayCounter
        currentDay={intervention.current_day}
        firstName={intervention.first_name}
      />

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
          href="/shopping"
          className="card p-3 text-center hover:border-gold-border transition-colors"
        >
          <span className="text-2xl">🛒</span>
          <p className="text-[10px] text-text-muted mt-1">Compras</p>
        </a>
      </div>

      <TimelineView currentDay={intervention.current_day} />
    </div>
  );
}
