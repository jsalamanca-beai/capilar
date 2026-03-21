"use client";

import { createContext, useContext } from "react";
import type { InterventionTimeline } from "@/lib/types/database";

export interface PatientContextType {
  intervention: InterventionTimeline | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const PatientContext = createContext<PatientContextType>({
  intervention: null,
  loading: true,
  error: null,
  refresh: () => {},
});

export function usePatient() {
  return useContext(PatientContext);
}
