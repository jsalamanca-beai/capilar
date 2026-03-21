"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("staff_user", JSON.stringify(data.user));
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Error al iniciar sesion");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo-capilex.png" alt="Capilex" width={150} height={80} className="mx-auto mb-6 logo-dark" priority />
          <h1 className="text-lg font-light text-gold tracking-[3px] uppercase">Panel Clinica</h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg border border-[#222] rounded-lg px-4 py-2.5 text-sm text-text-white
                focus:border-gold-border focus:outline-none focus:ring-1 focus:ring-gold/30"
              required
            />
          </div>
          <div>
            <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Contrasena</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg border border-[#222] rounded-lg px-4 py-2.5 pr-10 text-sm text-text-white
                  focus:border-gold-border focus:outline-none focus:ring-1 focus:ring-gold/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gold transition-colors"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gold text-black font-semibold rounded-lg
              hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
