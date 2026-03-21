"use client";

import { useState, useEffect } from "react";
import { PHASES, type TimelinePhase } from "@/lib/timeline/compute-phase";
import type { ProtocolTaskItem } from "@/lib/types/database";

interface TimelineViewProps {
  currentDay: number;
  protocolId?: string;
}

function TaskItem({ task, isCurrent }: { task: ProtocolTaskItem; isCurrent: boolean }) {
  const isRestriction = task.category === "restriction";
  const isCritical = task.priority === "critical";

  return (
    <div
      className={`flex gap-2.5 items-start py-2 px-3 rounded-lg text-xs
        ${isRestriction ? "border-l-2 border-l-danger/40" : "border-l-2 border-l-gold-border"}
        ${isCurrent ? "bg-black/20" : "bg-black/10"}`}
    >
      <span className="text-sm flex-shrink-0 mt-0.5">{task.icon || (isRestriction ? "🚫" : "📋")}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${isCurrent ? "text-text-white" : "text-text-muted"}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-text-muted mt-0.5 line-clamp-2">{task.description}</p>
        )}
        <div className="flex gap-1.5 mt-1">
          {isCritical && (
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-danger-bg text-danger uppercase">Critico</span>
          )}
          {task.frequency !== "once" && (
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-gold-subtle text-gold-dim uppercase">
              {task.frequency === "every_30min" ? "Cada 30min"
                : task.frequency === "twice_daily" ? "2x dia"
                : task.frequency === "daily" ? "Diario"
                : task.frequency}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  currentDay,
  isExpanded,
  onToggle,
  tasks,
  loadingTasks,
}: {
  phase: TimelinePhase;
  currentDay: number;
  isExpanded: boolean;
  onToggle: () => void;
  tasks: ProtocolTaskItem[];
  loadingTasks: boolean;
}) {
  const isCurrent = currentDay >= phase.dayStart && currentDay <= phase.dayEnd;
  const isPast = currentDay > phase.dayEnd;
  const isFuture = currentDay < phase.dayStart;

  const restrictions = tasks.filter((t) => t.category === "restriction");
  const actions = tasks.filter((t) => t.category !== "restriction");

  return (
    <div className="flex gap-3 relative">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={`rounded-full flex-shrink-0 mt-1 ${
            isCurrent
              ? "w-3.5 h-3.5 bg-gold gold-glow"
              : isPast
                ? "w-2.5 h-2.5 bg-gold opacity-50"
                : "w-2.5 h-2.5 bg-[#333] border border-[#555]"
          }`}
        />
        <div
          className={`w-0.5 flex-1 min-h-[20px] ${isPast ? "bg-gold/30" : "bg-[#222]"}`}
        />
      </div>

      {/* Card */}
      <div className="flex-1 mb-3">
        <button
          onClick={onToggle}
          className={`w-full text-left p-3.5 rounded-lg border transition-all ${
            isCurrent
              ? "bg-gold-subtle border-gold-border"
              : isPast
                ? "bg-bg-card border-[#1a1a1a] opacity-60 hover:opacity-80"
                : "bg-bg-card border-[#1a1a1a] opacity-40 hover:opacity-60"
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
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-semibold ${
                  isCurrent
                    ? "bg-gold-light text-gold border border-gold-border"
                    : isPast
                      ? "bg-[#1a1a1a] text-text-muted"
                      : "bg-[#111] text-[#444]"
                }`}
              >
                {isPast ? "COMPLETADO" : phase.badge}
              </span>
              <span className={`text-xs transition-transform ${isExpanded ? "rotate-180" : ""} ${isCurrent ? "text-gold" : "text-text-muted"}`}>
                ▼
              </span>
            </div>
          </div>
          <p className={`text-xs ${isCurrent ? "text-text" : "text-text-muted"}`}>
            {phase.subtitle}
          </p>
          {isCurrent && (
            <div className="mt-2 h-1 bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((currentDay - phase.dayStart + 1) /
                      (phase.dayEnd - phase.dayStart + 1)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          )}
          {!isExpanded && tasks.length > 0 && (
            <p className={`text-[10px] mt-1.5 ${isCurrent ? "text-gold-dim" : "text-text-muted"}`}>
              {tasks.length} tarea{tasks.length !== 1 ? "s" : ""} — toca para ver
            </p>
          )}
        </button>

        {/* Expanded tasks */}
        {isExpanded && (
          <div className="mt-2 space-y-1.5 animate-in slide-in-from-top-2">
            {loadingTasks ? (
              <div className="flex justify-center py-4">
                <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-text-muted text-xs text-center py-3">
                {isFuture ? "Las tareas se mostraran cuando llegue esta fase." : "Sin tareas en esta fase."}
              </p>
            ) : (
              <>
                {/* Actions first */}
                {actions.length > 0 && (
                  <div>
                    <p className="text-gold text-[9px] uppercase tracking-wider mb-1 px-1">Que hacer</p>
                    <div className="space-y-1">
                      {actions.map((task) => (
                        <TaskItem key={task.id} task={task} isCurrent={isCurrent} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Restrictions */}
                {restrictions.length > 0 && (
                  <div className={actions.length > 0 ? "mt-3" : ""}>
                    <p className="text-danger text-[9px] uppercase tracking-wider mb-1 px-1">Prohibido / Restricciones</p>
                    <div className="space-y-1">
                      {restrictions.map((task) => (
                        <TaskItem key={task.id} task={task} isCurrent={isCurrent} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimelineView({ currentDay }: TimelineViewProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [tasksByPhase, setTasksByPhase] = useState<Record<string, ProtocolTaskItem[]>>({});
  const [loadingPhase, setLoadingPhase] = useState<string | null>(null);

  // Auto-expand current phase
  useEffect(() => {
    const currentPhase = PHASES.find(
      (p) => currentDay >= p.dayStart && currentDay <= p.dayEnd
    );
    if (currentPhase) {
      setExpandedPhase(currentPhase.key);
      loadTasksForPhase(currentPhase);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay]);

  const loadTasksForPhase = async (phase: TimelinePhase) => {
    if (tasksByPhase[phase.key]) return; // Already loaded

    setLoadingPhase(phase.key);
    try {
      // Use a representative day from this phase to fetch tasks
      const targetDay = Math.max(phase.dayStart, Math.min(currentDay, phase.dayEnd));
      const res = await fetch(`/api/patient/timeline?day=${targetDay}`);
      if (res.ok) {
        const data = await res.json();
        // Filter tasks that belong to this phase
        const phaseTasks = (data.tasks as ProtocolTaskItem[]).filter((t) => {
          const taskEnd = t.day_offset_end ?? t.day_offset;
          // Task overlaps with this phase
          return t.day_offset <= phase.dayEnd && taskEnd >= phase.dayStart;
        });
        setTasksByPhase((prev) => ({ ...prev, [phase.key]: phaseTasks }));
      }
    } catch {
      // Silently fail
    }
    setLoadingPhase(null);
  };

  const handleToggle = (phase: TimelinePhase) => {
    if (expandedPhase === phase.key) {
      setExpandedPhase(null);
    } else {
      setExpandedPhase(phase.key);
      loadTasksForPhase(phase);
    }
  };

  // Show relevant phases
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
          <PhaseCard
            key={phase.key}
            phase={phase}
            currentDay={currentDay}
            isExpanded={expandedPhase === phase.key}
            onToggle={() => handleToggle(phase)}
            tasks={tasksByPhase[phase.key] || []}
            loadingTasks={loadingPhase === phase.key}
          />
        ))}
      </div>
    </div>
  );
}
