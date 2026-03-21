"use client";

import { useState, useRef } from "react";
import type { PhotoZone } from "@/lib/types/database";

const ZONES: { value: PhotoZone; label: string; icon: string }[] = [
  { value: "frontal", label: "Frontal", icon: "🔲" },
  { value: "top", label: "Superior", icon: "⬆️" },
  { value: "donor", label: "Zona donante", icon: "⬇️" },
  { value: "left", label: "Lateral izq.", icon: "◀️" },
  { value: "right", label: "Lateral der.", icon: "▶️" },
  { value: "detail", label: "Detalle", icon: "🔍" },
];

interface PhotoCaptureProps {
  onUpload: (file: File, zone: PhotoZone) => Promise<void>;
  uploading: boolean;
}

async function compressImage(file: File, maxWidth = 1600, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function PhotoCapture({ onUpload, uploading }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zone, setZone] = useState<PhotoZone>("frontal");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    setSelectedFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, zone);
    setPreview(null);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Zone selector */}
      <div>
        <label className="text-text-muted text-xs uppercase tracking-wider block mb-2">
          Zona de la foto
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ZONES.map((z) => (
            <button
              key={z.value}
              onClick={() => setZone(z.value)}
              className={`p-2.5 rounded-lg border text-center text-xs transition-all
                ${zone === z.value
                  ? "border-gold bg-gold-subtle text-gold"
                  : "border-[#222] bg-bg-card text-text-muted hover:border-gold-border"
                }`}
            >
              <span className="text-lg block mb-0.5">{z.icon}</span>
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview or capture buttons */}
      {preview ? (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-gold-border">
            <img src={preview} alt="Preview" className="w-full max-h-80 object-contain bg-black" />
            <span className="absolute top-2 right-2 badge text-[9px]">
              {ZONES.find((z) => z.value === zone)?.label}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="flex-1 py-3 border border-[#333] text-text-muted rounded-lg
                hover:border-gold-border transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="flex-1 py-3 bg-gold text-black font-semibold rounded-lg
                hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Analizando...
                </>
              ) : (
                <>📤 Subir y analizar</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="card p-6 text-center hover:border-gold-border transition-colors"
          >
            <span className="text-3xl block mb-2">📸</span>
            <span className="text-sm text-text-muted">Hacer foto</span>
          </button>
          <button
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.removeAttribute("capture");
                fileRef.current.click();
              }
            }}
            className="card p-6 text-center hover:border-gold-border transition-colors"
          >
            <span className="text-3xl block mb-2">🖼️</span>
            <span className="text-sm text-text-muted">Galeria</span>
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
