"use client";

import { useRouter } from "next/navigation";

export default function EmergencyPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h1 className="text-gold text-xs uppercase tracking-[3px] font-light mb-1">
        Contacto de emergencia
      </h1>
      <p className="text-text-muted text-sm mb-6">
        Clinica Capilex Madrid
      </p>

      {/* Emergency call */}
      <a
        href="tel:+34XXXXXXXXX"
        className="card p-5 flex items-center gap-4 mb-3 border-l-2 border-l-danger hover:bg-danger-bg transition-colors"
      >
        <span className="text-3xl">📞</span>
        <div>
          <p className="text-text-white font-medium">Llamar a la clinica</p>
          <p className="text-text-muted text-xs">
            Horario de atencion: L-V 9:00 - 20:00
          </p>
        </div>
      </a>

      {/* Email */}
      <a
        href="mailto:recetas@capilexmadrid.es"
        className="card p-5 flex items-center gap-4 mb-3 border-l-2 border-l-gold-border hover:bg-gold-subtle transition-colors"
      >
        <span className="text-3xl">✉️</span>
        <div>
          <p className="text-text-white font-medium">Email para recetas</p>
          <p className="text-gold text-xs">recetas@capilexmadrid.es</p>
        </div>
      </a>

      {/* Chat */}
      <a
        href="/chat"
        className="card p-5 flex items-center gap-4 mb-6 border-l-2 border-l-gold-border hover:bg-gold-subtle transition-colors"
      >
        <span className="text-3xl">💬</span>
        <div>
          <p className="text-text-white font-medium">Chat con asistente IA</p>
          <p className="text-text-muted text-xs">
            Disponible 24/7 para resolver tus dudas
          </p>
        </div>
      </a>

      {/* When to call */}
      <div className="card p-4">
        <h2 className="text-danger text-xs uppercase tracking-wider font-semibold mb-3">
          Contacta con la clinica si:
        </h2>
        <ul className="space-y-2">
          {[
            "Fiebre superior a 38°C",
            "Pus o secrecion amarillo-verdosa",
            "Dolor intenso que no cede con paracetamol",
            "Sangrado abundante que no para",
            "Enrojecimiento que se extiende y empeora",
            "Hinchazon que impide abrir los ojos",
            "Reaccion alergica a medicacion",
          ].map((symptom) => (
            <li
              key={symptom}
              className="flex gap-2 items-start text-sm text-text"
            >
              <span className="text-danger text-xs mt-0.5">⚠</span>
              {symptom}
            </li>
          ))}
        </ul>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full card p-4 mt-4 text-center text-text-muted text-sm hover:text-danger hover:border-danger-border transition-colors"
      >
        Cerrar sesion
      </button>

      <p className="text-text-muted text-[10px] text-center mt-6">
        M&M Mundo Capilar &mdash; CIF: B16867491 &mdash; Madrid
      </p>
    </div>
  );
}
