"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePatient } from "@/lib/hooks/usePatient";
import PhotoAnalysisCard from "@/components/patient/PhotoAnalysisCard";
import type { Photo } from "@/lib/types/database";

type PhotoWithUrl = Photo & { image_url: string | null };

const ZONE_LABELS: Record<string, string> = {
  frontal: "Frontal",
  top: "Superior",
  donor: "Donante",
  left: "Lateral izq.",
  right: "Lateral der.",
  detail: "Detalle",
};

export default function PhotoGalleryPage() {
  const { intervention } = usePatient();
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithUrl | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/patient/photos");
      if (res.ok) {
        setPhotos(await res.json());
      }
      setLoading(false);
    }
    load();
  }, []);

  if (!intervention) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-gold text-xs uppercase tracking-[3px] font-light mb-1">
            Mis fotos
          </h1>
          <p className="text-text-muted text-sm">
            {photos.length} foto{photos.length !== 1 ? "s" : ""} subida{photos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => router.push("/photos/upload")}
          className="px-4 py-2 bg-gold text-black text-sm font-semibold rounded
            hover:opacity-90 transition-opacity"
        >
          + Subir foto
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && photos.length === 0 && (
        <div className="card p-8 text-center">
          <span className="text-4xl block mb-3">📸</span>
          <p className="text-text-muted mb-4">Aun no has subido fotos</p>
          <button
            onClick={() => router.push("/photos/upload")}
            className="px-6 py-2.5 bg-gold text-black text-sm font-semibold rounded
              hover:opacity-90 transition-opacity"
          >
            Subir primera foto
          </button>
        </div>
      )}

      {/* Photo modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="flex justify-between items-center p-4">
            <div>
              <span className="badge text-[9px]">
                Dia {selectedPhoto.day_offset} &mdash; {ZONE_LABELS[selectedPhoto.zone]}
              </span>
            </div>
            <button className="text-text-muted text-2xl hover:text-white">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.image_url || ""}
              alt={`Dia ${selectedPhoto.day_offset}`}
              className="max-w-full max-h-[50vh] object-contain rounded-lg"
            />
          </div>
          {selectedPhoto.ai_analysis && (
            <div className="p-4 max-h-[35vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="card p-4 max-w-lg mx-auto">
                <PhotoAnalysisCard analysis={selectedPhoto.ai_analysis} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo) => {
          const assessmentColor =
            photo.ai_analysis?.overall_assessment === "normal"
              ? "border-success"
              : photo.ai_analysis?.overall_assessment === "monitorizar"
                ? "border-gold"
                : photo.ai_analysis?.overall_assessment === "atencion_clinica" ||
                    photo.ai_analysis?.overall_assessment === "urgente"
                  ? "border-danger"
                  : "border-[#222]";

          return (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className={`card overflow-hidden text-left border-t-2 ${assessmentColor} hover:opacity-90 transition-opacity`}
            >
              {photo.image_url ? (
                <img
                  src={photo.image_url}
                  alt={`Dia ${photo.day_offset}`}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-[#1a1a1a] flex items-center justify-center text-2xl">📷</div>
              )}
              <div className="p-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-text-white text-xs font-medium">
                    Dia {photo.day_offset}
                  </span>
                  <span className="text-[9px] text-text-muted">
                    {ZONE_LABELS[photo.zone]}
                  </span>
                </div>
                {photo.ai_analysis && (
                  <span className={`text-[9px] ${
                    photo.ai_analysis.overall_assessment === "normal"
                      ? "text-success"
                      : photo.ai_analysis.overall_assessment === "monitorizar"
                        ? "text-gold"
                        : "text-danger"
                  }`}>
                    {photo.ai_analysis.overall_assessment === "normal"
                      ? "✓ Normal"
                      : photo.ai_analysis.overall_assessment === "monitorizar"
                        ? "⚠ Monitorizar"
                        : "⚠ Atencion"}
                  </span>
                )}
                {photo.staff_reviewed_at && (
                  <span className="text-[9px] text-success ml-2">✓ Revisada</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
