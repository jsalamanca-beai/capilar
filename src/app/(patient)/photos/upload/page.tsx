"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePatient } from "@/lib/hooks/usePatient";
import PhotoCapture from "@/components/patient/PhotoCapture";
import PhotoAnalysisCard from "@/components/patient/PhotoAnalysisCard";
import type { PhotoZone, PhotoAnalysis } from "@/lib/types/database";

export default function PhotoUploadPage() {
  const { intervention } = usePatient();
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (file: File, zone: PhotoZone) => {
    setUploading(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("zone", zone);

      const res = await fetch("/api/patient/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al subir la foto");
        return;
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setError("Error de conexion. Intentalo de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  if (!intervention) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-gold text-xs uppercase tracking-[3px] font-light mb-1">
            Subir foto
          </h1>
          <p className="text-text-muted text-sm">
            Dia {intervention.current_day} postoperatorio
          </p>
        </div>
        <button
          onClick={() => router.push("/photos")}
          className="text-text-muted text-sm hover:text-gold transition-colors"
        >
          Ver galeria →
        </button>
      </div>

      {error && (
        <div className="card p-3 mb-4 border-l-2 border-l-danger">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <PhotoCapture onUpload={handleUpload} uploading={uploading} />

      {/* Analysis result */}
      {analysis && (
        <div className="mt-6">
          <div className="card p-4">
            <h2 className="text-gold text-xs uppercase tracking-wider mb-3">
              Resultado del analisis
            </h2>
            <PhotoAnalysisCard analysis={analysis} />

            <button
              onClick={() => {
                setAnalysis(null);
              }}
              className="w-full mt-4 py-2.5 border border-gold-border text-gold rounded-lg
                hover:bg-gold-subtle transition-colors text-sm"
            >
              Subir otra foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
