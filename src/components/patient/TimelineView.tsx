"use client";

import { PHASES, type TimelinePhase } from "@/lib/timeline/compute-phase";

interface TimelineViewProps {
  currentDay: number;
}

function PhaseCard({
  phase,
  currentDay,
}: {
  phase: TimelinePhase;
  currentDay: number;
}) {
  const isCurrent = currentDay >= phase.dayStart && currentDay <= phase.dayEnd;
  const isPast = currentDay > phase.dayEnd;
  const isFuture = currentDay < phase.dayStart;

  return (
    <div className="flex gap-3 relative">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={`rounded-full flex-shrink-0 ${
            isCurrent
              ? "w-3.5 h-3.5 bg-gold gold-glow"
              : isPast
                ? "w-2.5 h-2.5 bg-gold opacity-50"
                : "w-2.5 h-2.5 bg-[#333] border border-[#555]"
          }`}
        />
        <div
          className={`w-0.5 flex-1 min-h-[20px] ${
            isPast ? "bg-gold/30" : "bg-[#222]"
          }`}
        />
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-3 p-3.5 rounded-lg border transition-all ${
          isCurrent
            ? "bg-gold-subtle border-gold-border"
            : isPast
              ? "bg-bg-card border-[#1a1a1a] opacity-60"
              : "bg-bg-card border-[#1a1a1a] opacity-40"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <h3
            className={`text-sm font-medium ${
              isCurrent ? "text-gold" : isPast ? "text-text-muted" : "text-[#555]"
            }`}
          >
            {phase.title}
          </h3>
          <span
            className={`text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-semibold ${
              isCurrent
                ? "bg-gold-light text-gold border border-gold-border"
                : isPast
                  ? "bg-[#1a1a1a] text-text-muted"
                  : "bg-[#111] text-[#444]"
            }`}
          >
            {isPast ? "COMPLETADO" : isFuture ? phase.badge : phase.badge}
          </span>
        </div>
        <p
          className={`text-xs ${
            isCurrent ? "text-text" : "text-text-muted"
          }`}
        >
          {phase.subtitle}
        </p>
        {isCurrent && (
          <div className="mt-2 h-1 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{
                width: `${Math.min(
                  ((currentDay - phase.dayStart + 1) /
                    (phase.dayEnd - phase.dayStart + 1)) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimelineView({ currentDay }: TimelineViewProps) {
  // Only show relevant phases (not all 13 at once)
  const currentPhaseIndex = PHASES.findIndex(
    (p) => currentDay >= p.dayStart && currentDay <= p.dayEnd
  );
  const startIdx = Math.max(0, currentPhaseIndex - 2);
  const endIdx = Math.min(PHASES.length, currentPhaseIndex + 4);
  const visiblePhases = PHASES.slice(startIdx, endIdx);

  return (
    <div className="px-4 py-2">
      <h2 className="text-gold text-xs uppercase tracking-[3px] font-light mb-4">
        Tu timeline
      </h2>
      <div>
        {visiblePhases.map((phase) => (
          <PhaseCard key={phase.key} phase={phase} currentDay={currentDay} />
        ))}
      </div>
    </div>
  );
}
