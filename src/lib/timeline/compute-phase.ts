export interface TimelinePhase {
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  dayStart: number;
  dayEnd: number;
}

export const PHASES: TimelinePhase[] = [
  { key: "pre_15", title: "15 dias antes", subtitle: "Preparacion inicial", badge: "PRE-OP", dayStart: -15, dayEnd: -8 },
  { key: "pre_7", title: "7 dias antes", subtitle: "Restricciones importantes", badge: "PRE-OP", dayStart: -7, dayEnd: -3 },
  { key: "pre_2", title: "2 dias antes", subtitle: "Ultimos preparativos", badge: "PRE-OP", dayStart: -2, dayEnd: -1 },
  { key: "surgery_day", title: "Dia de la intervencion", subtitle: "El dia de tu cirugia", badge: "DIA D", dayStart: 0, dayEnd: 0 },
  { key: "post_1_2", title: "Dias 1 y 2", subtitle: "Solo hidratar", badge: "POST-OP", dayStart: 1, dayEnd: 2 },
  { key: "post_3_4", title: "Dias 3 y 4", subtitle: "Primer lavado zona donante", badge: "POST-OP", dayStart: 3, dayEnd: 4 },
  { key: "post_5_7", title: "Dias 5 a 7", subtitle: "Comienza lavado zona receptora", badge: "POST-OP", dayStart: 5, dayEnd: 7 },
  { key: "post_8_15", title: "Dias 8 a 15", subtitle: "Lavado con masaje suave", badge: "POST-OP", dayStart: 8, dayEnd: 15 },
  { key: "post_15_30", title: "Dias 15 a 30", subtitle: "Vuelta progresiva", badge: "RECUPERACION", dayStart: 16, dayEnd: 30 },
  { key: "post_30_90", title: "Mes 1 a 3", subtitle: "Shedding y paciencia", badge: "RECUPERACION", dayStart: 31, dayEnd: 90 },
  { key: "post_90_180", title: "Mes 3 a 6", subtitle: "Primeros resultados", badge: "CRECIMIENTO", dayStart: 91, dayEnd: 180 },
  { key: "post_180_365", title: "Mes 6 a 12", subtitle: "Crecimiento significativo", badge: "CRECIMIENTO", dayStart: 181, dayEnd: 365 },
  { key: "post_365_plus", title: "Mas de 12 meses", subtitle: "Resultado final", badge: "RESULTADO", dayStart: 366, dayEnd: 9999 },
];

export function computeCurrentDay(surgeryDate: Date): number {
  const today = new Date();
  const surgery = new Date(surgeryDate);
  today.setHours(0, 0, 0, 0);
  surgery.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - surgery.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getCurrentPhase(currentDay: number): TimelinePhase | undefined {
  return PHASES.find((p) => currentDay >= p.dayStart && currentDay <= p.dayEnd);
}

export function getPhaseProgress(currentDay: number, phase: TimelinePhase): number {
  const total = phase.dayEnd - phase.dayStart + 1;
  const elapsed = currentDay - phase.dayStart + 1;
  return Math.min(Math.max(elapsed / total, 0), 1);
}
