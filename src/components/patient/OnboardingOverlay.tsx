"use client";

import { useState, useEffect } from "react";

const STEPS = [
  { icon: "📅", title: "Tu recuperacion, dia a dia", body: "Aqui veras en que fase estas y que debes hacer hoy. Todo adaptado a tu fecha de cirugia." },
  { icon: "✅", title: "Tareas del dia", body: "Marca cada tarea completada. Es tu protocolo personalizado de Capilex Madrid." },
  { icon: "📸", title: "Fotos de seguimiento", body: "Sube fotos de tu cuero cabelludo. La IA analiza tu progreso al instante." },
  { icon: "💬", title: "3 expertos disponibles 24/7", body: "Pregunta sobre cirugia, bienestar emocional o restricciones. Siempre hay alguien para ayudarte." },
  { icon: "🆘", title: "Si algo no va bien", body: "El icono de emergencia en la esquina superior tiene contacto directo con la clinica y sintomas de alerta." },
];

export default function OnboardingOverlay({ firstName }: { firstName: string }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("capilex_onboarded");
    if (!done) setVisible(true);
  }, []);

  const finish = () => {
    localStorage.setItem("capilex_onboarded", "1");
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center px-6">
      {/* Step dots */}
      <div className="flex gap-1.5 mb-10">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === step ? "w-6 bg-gold" : "w-1.5 bg-[#333]"
            }`}
          />
        ))}
      </div>

      <span className="text-6xl mb-6">{current.icon}</span>

      <h2 className="text-gold text-xl font-light tracking-wide text-center mb-3">
        {current.title}
      </h2>
      <p className="text-text-muted text-sm text-center leading-relaxed max-w-xs">
        {current.body}
      </p>

      <div className="mt-12 w-full max-w-xs space-y-3">
        <button
          onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
          className="w-full py-3.5 bg-gold text-black font-semibold rounded-lg
            hover:opacity-90 transition-opacity text-sm"
        >
          {isLast ? `Empezar, ${firstName}` : "Siguiente"}
        </button>
        {!isLast && (
          <button
            onClick={finish}
            className="w-full py-2 text-text-muted text-xs hover:text-text transition-colors"
          >
            Saltar introduccion
          </button>
        )}
      </div>
    </div>
  );
}
