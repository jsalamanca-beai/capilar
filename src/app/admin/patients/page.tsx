"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { InterventionTimeline } from "@/lib/types/database";

type EnrichedIntervention = InterventionTimeline & {
  pending_photos: number;
  pending_escalations: number;
};

export default function PatientsListPage() {
  const [patients, setPatients] = useState<EnrichedIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pre_op" | "post_op" | "critical">("all");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/patients");
      if (res.ok) setPatients(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  const filtered = patients.filter((p) => {
    if (filter === "pre_op") return p.current_day < 0;
    if (filter === "post_op") return p.current_day >= 0;
    if (filter === "critical") return p.current_day >= 1 && p.current_day <= 7;
    return true;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-gold text-xs uppercase tracking-[4px] font-light">Pacientes</h1>
        <Link
          href="/admin/codes"
          className="px-4 py-2 bg-gold text-black text-sm font-semibold rounded hover:opacity-90 transition-opacity"
        >
          + Nuevo paciente
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {([
          ["all", "Todos"],
          ["pre_op", "Pre-op"],
          ["post_op", "Post-op"],
          ["critical", "Criticos (dia 1-7)"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded text-xs transition-colors
              ${filter === key
                ? "bg-gold text-black"
                : "bg-bg-card border border-[#222] text-text-muted hover:border-gold-border"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-muted">No hay pacientes en esta categoria.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((p) => {
          const hasPending = p.pending_photos > 0 || p.pending_escalations > 0;
          const isCritical = p.current_day >= 1 && p.current_day <= 7;
          const dayLabel = p.current_day < 0
            ? `Cirugia en ${Math.abs(p.current_day)} dias`
            : p.current_day === 0
              ? "HOY cirugia"
              : `Dia ${p.current_day} post-op`;

          return (
            <Link
              key={p.id}
              href={`/admin/patients/${p.id}`}
              className={`card p-4 flex items-center gap-4 hover:border-gold-border transition-colors
                ${isCritical ? "border-l-2 border-l-danger" : hasPending ? "border-l-2 border-l-gold" : ""}`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gold-light flex items-center justify-center text-gold text-sm font-semibold flex-shrink-0">
                {p.first_name[0]}{p.last_name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-text-white text-sm font-medium truncate">
                    {p.first_name} {p.last_name}
                  </p>
                  {p.pending_escalations > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger-bg text-danger border border-danger-border">
                      {p.pending_escalations} escalado{p.pending_escalations > 1 ? "s" : ""}
                    </span>
                  )}
                  {p.pending_photos > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-light text-gold border border-gold-border">
                      {p.pending_photos} foto{p.pending_photos > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-text-muted text-xs">
                  {dayLabel} &mdash; {p.technique || "FUE"} {p.grafts_count ? `(${p.grafts_count} UF)` : ""}
                </p>
              </div>

              {/* Status */}
              <div className="text-right flex-shrink-0">
                <span className={`text-xs font-medium ${
                  p.current_day < 0 ? "text-blue" : isCritical ? "text-danger" : "text-gold"
                }`}>
                  {dayLabel}
                </span>
                <p className="text-text-muted text-[10px]">
                  {new Date(p.surgery_date).toLocaleDateString("es-ES")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
