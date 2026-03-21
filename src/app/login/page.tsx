"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [code, setCode] = useState(["", "", "", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-fill from ?code= URL parameter
  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode && urlCode.length === 8) {
      const chars = urlCode.toUpperCase().split("");
      setCode(chars);
      handleSubmit(urlCode.toUpperCase());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleChange = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);
    setError("");

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 8 filled
    if (value && index === 7 && newCode.every((c) => c !== "")) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 8);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (pasted.length === 8) {
      handleSubmit(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleSubmit = async (codeStr?: string) => {
    const fullCode = codeStr || code.join("");
    if (fullCode.length !== 8) {
      setError("Introduce el codigo completo de 8 caracteres.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Error al validar el codigo.");
        setCode(["", "", "", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(`Error de conexion: ${err instanceof Error ? err.message : "Intentalo de nuevo."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg px-4">
      <div className="w-full max-w-md text-center">
        <Image
          src="/logo-capilex.png"
          alt="Capilex Madrid"
          width={180}
          height={96}
          className="mx-auto mb-10 logo-dark"
          priority
        />

        <h1 className="text-xl font-light text-gold tracking-[3px] uppercase mb-2">
          Acceso Paciente
        </h1>
        <p className="text-text-muted text-sm mb-8">
          Introduce el codigo que te ha proporcionado la clinica
        </p>

        {/* Code input boxes */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-10 h-12 text-center text-lg font-mono rounded border
                ${error ? "border-danger" : "border-gold-border"}
                bg-bg-card text-text-white focus:border-gold focus:outline-none
                focus:ring-1 focus:ring-gold transition-colors
                ${i === 3 ? "ml-3" : ""}`}
              disabled={loading}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-danger text-sm mb-4">{error}</p>
        )}

        <button
          onClick={() => handleSubmit()}
          disabled={loading || code.some((c) => c === "")}
          className="w-full py-3 bg-gold text-black font-semibold rounded
            hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Verificando..." : "Acceder"}
        </button>

        <p className="text-text-muted text-xs mt-8">
          Si no tienes un codigo de acceso, contacta con tu clinica.
        </p>
      </div>
    </div>
  );
}
