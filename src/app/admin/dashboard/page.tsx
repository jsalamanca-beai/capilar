"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Alerts {
  counts: { photos: number; escalations: number; upcoming: number };
  unreviewed_photos: Array<{ id: string; intervention_id: string; day_offset: number; zone: string; is_flagged: boolean; created_at: string }>;
  pending_escalations: Array<{ id: string; intervention_id: string; content: string; day_offset: number; created_at: string }>;
  upcoming_surgeries: Array<{ id: string; first_name: string; last_name: string; surgery_date: string; current_day: number }>;
}

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState<Alerts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/alerts");
      if (res.ok) setAlerts(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-gold text-xs uppercase tracking-[4px] font-light mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl font-light text-gold">{alerts?.counts.photos || 0}</p>
          <p className="text-text-muted text-xs mt-1">Fotos sin revisar</p>
        </div>
        <div className={`card p-5 text-center ${(alerts?.counts.escalations || 0) > 0 ? "border-danger" : ""}`}>
          <p className={`text-3xl font-light ${(alerts?.counts.escalations || 0) > 0 ? "text-danger" : "text-gold"}`}>
            {alerts?.counts.escalations || 0}
          </p>
          <p className="text-text-muted text-xs mt-1">Escalados pendientes</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-light text-gold">{alerts?.counts.upcoming || 0}</p>
          <p className="text-text-muted text-xs mt-1">Cirugias esta semana</p>
        </div>
      </div>

      {/* Pending escalations */}
      {alerts && alerts.pending_escalations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-danger text-xs uppercase tracking-wider font-semibold mb-3">
            ⚠️ Escalados sin resolver
          </h2>
          <div className="space-y-2">
            {alerts.pending_escalations.map((esc) => (
              <Link
                key={esc.id}
                href={`/admin/patients/${esc.intervention_id}/chat`}
                className="card p-4 block border-l-2 border-l-danger hover:bg-danger-bg transition-colors"
              >
                <p className="text-text-white text-sm line-clamp-2">{esc.content}</p>
                <p className="text-text-muted text-xs mt-1">
                  Dia {esc.day_offset} &mdash; {new Date(esc.created_at).toLocaleString("es-ES")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming surgeries */}
      {alerts && alerts.upcoming_surgeries.length > 0 && (
        <div className="mb-6">
          <h2 className="text-gold text-xs uppercase tracking-wider mb-3">
            🗓 Proximas cirugias
          </h2>
          <div className="space-y-2">
            {alerts.upcoming_surgeries.map((inv) => (
              <Link
                key={inv.id}
                href={`/admin/patients/${inv.id}`}
                className="card p-4 block border-l-2 border-l-gold-border hover:border-l-gold transition-colors"
              >
                <div className="flex justify-between items-center">
                  <p className="text-text-white text-sm font-medium">
                    {inv.first_name} {inv.last_name}
                  </p>
                  <span className="badge text-[9px]">en {Math.abs(inv.current_day)} dias</span>
                </div>
                <p className="text-text-muted text-xs mt-1">
                  Cirugia: {new Date(inv.surgery_date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Unreviewed photos */}
      {alerts && alerts.unreviewed_photos.length > 0 && (
        <div>
          <h2 className="text-gold text-xs uppercase tracking-wider mb-3">
            📸 Fotos pendientes de revision
          </h2>
          <div className="space-y-2">
            {alerts.unreviewed_photos.slice(0, 5).map((photo) => (
              <Link
                key={photo.id}
                href={`/admin/patients/${photo.intervention_id}/photos`}
                className={`card p-4 block border-l-2 hover:bg-gold-subtle transition-colors
                  ${photo.is_flagged ? "border-l-danger" : "border-l-gold-border"}`}
              >
                <div className="flex justify-between items-center">
                  <p className="text-text-white text-sm">
                    {photo.is_flagged && <span className="text-danger mr-1">⚠</span>}
                    Dia {photo.day_offset} &mdash; Zona {photo.zone}
                  </p>
                  <span className="text-text-muted text-xs">
                    {new Date(photo.created_at).toLocaleString("es-ES")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All quiet */}
      {alerts && alerts.counts.photos === 0 && alerts.counts.escalations === 0 && alerts.counts.upcoming === 0 && (
        <div className="card p-8 text-center">
          <span className="text-4xl block mb-3">✅</span>
          <p className="text-text-muted">Todo en orden. Sin alertas pendientes.</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/admin/patients" className="text-gold text-sm hover:underline">
          Ver todos los pacientes →
        </Link>
      </div>
    </div>
  );
}
