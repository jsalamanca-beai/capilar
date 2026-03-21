"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import PhotoAnalysisCard from "@/components/patient/PhotoAnalysisCard";
import type { Photo } from "@/lib/types/database";

type PhotoWithUrl = Photo & { image_url: string | null };

export default function AdminPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [selected, setSelected] = useState<PhotoWithUrl | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/patients/${id}/photos`);
      if (res.ok) setPhotos(await res.json());
      setLoading(false);
    }
    load();
  }, [id]);

  const saveReview = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/patients/${id}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId: selected.id, staff_review: reviewNote }),
    });
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? { ...p, staff_review: reviewNote, staff_reviewed_at: new Date().toISOString() }
          : p
      )
    );
    setSelected((prev) => prev ? { ...prev, staff_review: reviewNote, staff_reviewed_at: new Date().toISOString() } : prev);
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href={`/admin/patients/${id}`} className="text-text-muted text-xs hover:text-gold">← Volver al paciente</Link>
      <h1 className="text-gold text-xs uppercase tracking-[4px] font-light mt-3 mb-4">Fotos del paciente</h1>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Selected photo detail */}
      {selected && (
        <div className="card mb-6 overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Photo */}
            <div className="bg-black flex items-center justify-center p-4">
              {selected.image_url && (
                <img src={selected.image_url} alt={`Dia ${selected.day_offset}`} className="max-h-80 object-contain rounded" />
              )}
            </div>
            {/* Analysis + Review */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="badge text-[9px]">Dia {selected.day_offset} &mdash; {selected.zone}</span>
                  <p className="text-text-muted text-[10px] mt-1">{new Date(selected.created_at).toLocaleString("es-ES")}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-text-muted hover:text-white text-lg">✕</button>
              </div>

              {selected.ai_analysis && <PhotoAnalysisCard analysis={selected.ai_analysis} />}

              {/* Staff review */}
              <div className="border-t border-[#1a1a1a] pt-3">
                <label className="text-gold text-xs uppercase tracking-wider block mb-2">Notas del equipo clinico</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Escribir notas de revision..."
                  rows={3}
                  className="w-full bg-bg border border-[#222] rounded-lg px-3 py-2 text-sm text-text-white
                    focus:border-gold-border focus:outline-none resize-none"
                />
                <button
                  onClick={saveReview}
                  disabled={saving}
                  className="mt-2 w-full py-2 bg-gold text-black text-sm font-semibold rounded-lg
                    hover:opacity-90 disabled:opacity-40"
                >
                  {saving ? "Guardando..." : selected.staff_reviewed_at ? "Actualizar revision" : "Marcar como revisada"}
                </button>
                {selected.staff_reviewed_at && (
                  <p className="text-success text-[10px] mt-2 text-center">
                    ✓ Revisada el {new Date(selected.staff_reviewed_at).toLocaleString("es-ES")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {!loading && photos.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-muted">El paciente aun no ha subido fotos.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => { setSelected(photo); setReviewNote(photo.staff_review || ""); }}
            className={`card overflow-hidden text-left transition-all hover:opacity-90
              ${!photo.staff_reviewed_at ? "border-l-2 border-l-gold" : ""}
              ${photo.is_flagged ? "border-l-2 border-l-danger" : ""}`}
          >
            {photo.image_url ? (
              <img src={photo.image_url} alt="" className="w-full h-28 object-cover" />
            ) : (
              <div className="w-full h-28 bg-[#1a1a1a] flex items-center justify-center text-2xl">📷</div>
            )}
            <div className="p-2">
              <div className="flex items-center justify-between">
                <span className="text-text-white text-xs">Dia {photo.day_offset}</span>
                <span className="text-[9px] text-text-muted">{photo.zone}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {photo.is_flagged && <span className="text-[9px] text-danger">⚠ Riesgo</span>}
                {photo.staff_reviewed_at ? (
                  <span className="text-[9px] text-success">✓ Revisada</span>
                ) : (
                  <span className="text-[9px] text-gold">Pendiente</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
