"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PatientContext } from "@/lib/hooks/usePatient";
import type { InterventionTimeline } from "@/lib/types/database";

export default function PatientProvider({ children }: { children: ReactNode }) {
  const [intervention, setIntervention] =
    useState<InterventionTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/patient/profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setError("Error al cargar datos");
        return;
      }
      const data = await res.json();
      setIntervention(data);
      setError(null);
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <PatientContext.Provider
      value={{ intervention, loading, error, refresh: fetchProfile }}
    >
      {children}
    </PatientContext.Provider>
  );
}
