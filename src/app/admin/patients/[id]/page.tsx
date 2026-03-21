"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import type { InterventionTimeline } from "@/lib/types/database";
import { getCurrentPhase, PHASES } from "@/lib/timeline/compute-phase";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [intervention, setIntervention] = useState<InterventionTimeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/patients/${id}`);
      if (res.ok) setIntervention(await res.json());
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!intervention) {
    return <div className="p-6 text-danger">Paciente no encontrado</div>;
  }

  const phase = getCurrentPhase(intervention.current_day);
  const dayLabel = intervention.current_day < 0
    ? `Cirugia en ${Math.abs(intervention.current_day)} dias`
    : intervention.current_day === 0
      ? "HOY es la cirugia"
      : `Dia ${intervention.current_day} postoperatorio`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/admin/patients" className="text-text-muted text-xs hover:text-gold transition-colors">
        ← Volver a pacientes
      </Link>

      {/* Patient header */}
      <div className="card p-5 mt-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold-light flex items-center justify-center text-gold text-xl font-semibold">
            {intervention.first_name[0]}{intervention.last_name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-text-white text-lg font-medium">
              {intervention.first_name} {intervention.last_name}
            </h1>
            <p className="text-gold text-sm">{dayLabel}</p>
            <p className="text-text-muted text-xs mt-0.5">
              {intervention.technique || "FUE"} &mdash; {intervention.grafts_count || "?"} UF
              {intervention.surgeon_name && ` &mdash; ${intervention.surgeon_name}`}
            </p>
          </div>
          <div className="text-right">
            {phase && <span className="badge text-[9px]">{phase.badge}</span>}
            <p className="text-text-muted text-[10px] mt-1">
              Cirugia: {new Date(intervention.surgery_date).toLocaleDateString("es-ES")}
            </p>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex gap-4 mt-4 pt-3 border-t border-[#1a1a1a]">
          {intervention.patient_phone && (
            <a href={`tel:${intervention.patient_phone}`} className="text-gold text-xs hover:underline">
              📞 {intervention.patient_phone}
            </a>
          )}
          {intervention.patient_email && (
            <a href={`mailto:${intervention.patient_email}`} className="text-gold text-xs hover:underline">
              ✉️ {intervention.patient_email}
            </a>
          )}
          <span className="text-text-muted text-xs ml-auto">
            Codigo: <span className="font-mono text-gold">{intervention.access_code}</span>
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href={`/admin/patients/${id}/photos`}
          className="card p-4 text-center hover:border-gold-border transition-colors">
          <span className="text-2xl block mb-1">📸</span>
          <span className="text-xs text-text-muted">Fotos</span>
        </Link>
        <Link href={`/admin/patients/${id}/chat`}
          className="card p-4 text-center hover:border-gold-border transition-colors">
          <span className="text-2xl block mb-1">💬</span>
          <span className="text-xs text-text-muted">Chat</span>
        </Link>
        <div className="card p-4 text-center">
          <span className="text-2xl block mb-1">📋</span>
          <span className="text-xs text-text-muted">Timeline</span>
        </div>
      </div>

      {/* Mini timeline */}
      <div className="card p-5">
        <h2 className="text-gold text-xs uppercase tracking-wider mb-3">Timeline del paciente</h2>
        <div className="space-y-2">
          {PHASES.slice(0, 9).map((p) => {
            const isCurrent = intervention.current_day >= p.dayStart && intervention.current_day <= p.dayEnd;
            const isPast = intervention.current_day > p.dayEnd;
            return (
              <div key={p.key} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs
                ${isCurrent ? "bg-gold-subtle border border-gold-border" : isPast ? "opacity-40" : "opacity-25"}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isCurrent ? "bg-gold gold-glow" : isPast ? "bg-gold/50" : "bg-[#333]"}`} />
                <span className={isCurrent ? "text-gold font-medium" : "text-text-muted"}>{p.title}</span>
                <span className="text-text-muted ml-auto">{p.badge}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
