"use client";

import { useState } from "react";

export default function CodesPage() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    surgery_date: "", grafts_count: "", technique: "FUE", surgeon_name: "",
  });
  const [result, setResult] = useState<{ access_code: string; access_link: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          grafts_count: form.grafts_count ? parseInt(form.grafts_count) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ access_code: data.access_code, access_link: data.access_link });
      } else {
        setError(data.error);
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!result) return;
    const fullLink = `${window.location.origin}${result.access_link}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-gold text-xs uppercase tracking-[4px] font-light mb-6">Nuevo paciente</h1>

      {result ? (
        <div className="card p-6 text-center">
          <span className="text-4xl block mb-3">✅</span>
          <p className="text-text-white text-lg mb-1">Paciente creado</p>
          <p className="text-text-muted text-sm mb-6">{form.first_name} {form.last_name}</p>

          <div className="bg-bg rounded-lg p-4 mb-4">
            <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Codigo de acceso</p>
            <p className="text-gold text-3xl font-mono tracking-[8px]">{result.access_code}</p>
          </div>

          <button
            onClick={copyLink}
            className="w-full py-3 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity mb-3"
          >
            {copied ? "✓ Copiado!" : "Copiar enlace para el paciente"}
          </button>

          <p className="text-text-muted text-xs">
            Envia este codigo o enlace al paciente por WhatsApp, email o en persona.
          </p>

          <button
            onClick={() => {
              setResult(null);
              setForm({ first_name: "", last_name: "", email: "", phone: "", surgery_date: "", grafts_count: "", technique: "FUE", surgeon_name: "" });
            }}
            className="mt-4 text-gold text-sm hover:underline"
          >
            Crear otro paciente
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Nombre *</label>
              <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required
                className="w-full bg-bg border border-[#222] rounded-lg px-3 py-2 text-sm text-text-white focus:border-gold-border focus:outline-none" />
            </div>
            <div>
              <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Apellidos *</label>
              <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required
                className="w-full bg-bg border border-[#222] rounded-lg px-3 py-2 text-sm text-text-white focus:border-gold-border focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Fecha de cirugia *</label>
            <input type="date" value={form.surgery_date} onChange={(e) => setForm({ ...form, surgery_date: e.target.value })} required
              className="w-full bg-bg border border-[#222] rounded-lg px-3 py-2 text-sm text-text-white focus:border-gold-border focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-bg border border-[#222] rounded-lg px-3 py-2 text-sm text-text-white focus:border-gold-border focus:outline-none" />
            </div>
            <div>
              <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Telefono</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-bg border border-[#222] rounded-lg px-3 py-2 text-sm text-text-white focus:border-gold-border focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Injertos</label>
              <input type="number" value={form.grafts_count} onChange={(e) => setForm({ ...form, grafts_count: e.target.value })} placeholder="2500"
                className="w-full bg-bg border border-[#222] rounded-lg px-3 py-2 text-sm text-text-white focus:border-gold-border focus:outline-none" />
            </div>
            <div>
              <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Tecnica</label>
              <select value={form.technique} onChange={(e) => setForm({ ...form, technique: e.target.value })}
                className="w-full bg-bg border border-[#222] rounded-lg px-3 py-2 text-sm text-text-white focus:border-gold-border focus:outline-none">
                <option value="FUE">FUE</option>
                <option value="DHI">DHI</option>
                <option value="FUT">FUT</option>
              </select>
            </div>
            <div>
              <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Cirujano</label>
              <input type="text" value={form.surgeon_name} onChange={(e) => setForm({ ...form, surgeon_name: e.target.value })}
                className="w-full bg-bg border border-[#222] rounded-lg px-3 py-2 text-sm text-text-white focus:border-gold-border focus:outline-none" />
            </div>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gold text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
            {loading ? "Creando..." : "Crear paciente y generar codigo"}
          </button>
        </form>
      )}
    </div>
  );
}
