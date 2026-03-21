"use client";

import { useState, useEffect, useCallback } from "react";
import { usePatient } from "@/lib/hooks/usePatient";
import { getCurrentPhase } from "@/lib/timeline/compute-phase";
import { PHASE_REASSURANCE } from "@/lib/content/phase-reassurance";
import type { ProtocolTaskItem, TaskCompletion } from "@/lib/types/database";

export default function ChecklistPage() {
  const { intervention } = usePatient();
  const [tasks, setTasks] = useState<ProtocolTaskItem[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/patient/timeline");
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks);
      setCompletions(data.completions);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTask = async (taskId: string) => {
    if (!intervention) return;
    const isCompleted = completions.some(
      (c) => c.protocol_task_item_id === taskId && c.completed_at
    );

    // Optimistic update
    if (isCompleted) {
      setCompletions((prev) =>
        prev.filter((c) => c.protocol_task_item_id !== taskId)
      );
    } else {
      setCompletions((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          intervention_id: intervention.id,
          protocol_task_item_id: taskId,
          day_offset: intervention.current_day,
          completed_at: new Date().toISOString(),
          skipped: false,
          notes: null,
        },
      ]);
    }

    await fetch("/api/patient/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId,
        dayOffset: intervention.current_day,
        undo: isCompleted,
      }),
    });
  };

  if (!intervention) return null;

  const currentDay = intervention.current_day;
  const phase = getCurrentPhase(currentDay);
  const completedCount = completions.filter((c) => c.completed_at).length;
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

  const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
  const sortedTasks = [...tasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-gold text-xs uppercase tracking-[3px] font-light mb-1">
          Tareas del dia
        </h1>
        <p className="text-text-muted text-sm">
          {phase?.title} &mdash; Dia {currentDay < 0 ? currentDay : `+${currentDay}`}
        </p>
        {phase && PHASE_REASSURANCE[phase.key] && (
          <p className="text-gold-dim text-[11px] leading-relaxed mt-1">
            {PHASE_REASSURANCE[phase.key]}
          </p>
        )}
      </div>

      {/* Progress bar / Completion celebration */}
      {progress === 1 && tasks.length > 0 ? (
        <div className="card p-3 mb-4 border-gold-border bg-gold-subtle text-center">
          <p className="text-gold text-sm font-medium">Dia completado</p>
          <p className="text-text-muted text-xs mt-0.5">
            Has seguido el protocolo al 100%. Eso marca la diferencia.
          </p>
        </div>
      ) : (
        <div className="card p-3 mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-text-muted">Progreso del dia</span>
            <span className="text-gold">
              {completedCount}/{tasks.length}
            </span>
          </div>
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Tasks */}
      {!loading && sortedTasks.length === 0 && (
        <div className="card p-6 text-center">
          <p className="text-text-muted">No hay tareas programadas para hoy.</p>
        </div>
      )}

      <div className="space-y-2">
        {sortedTasks.map((task) => {
          const isCompleted = completions.some(
            (c) =>
              c.protocol_task_item_id === task.id && c.completed_at
          );
          const isRestriction = task.category === "restriction";

          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full text-left card p-3.5 flex gap-3 items-start transition-all
                ${isCompleted ? "opacity-50" : ""}
                ${isRestriction ? "border-l-2 border-l-danger" : "border-l-2 border-l-gold-border"}
              `}
            >
              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors
                  ${isCompleted
                    ? "bg-gold border-gold"
                    : isRestriction
                      ? "border-danger/40"
                      : "border-gold-border"
                  }`}
              >
                {isCompleted && (
                  <span className="text-black text-xs font-bold">✓</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {task.icon && <span className="text-sm">{task.icon}</span>}
                  <span
                    className={`text-sm font-medium ${
                      isCompleted
                        ? "line-through text-text-muted"
                        : "text-text-white"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex gap-2 mt-1.5">
                  {task.priority === "critical" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger-bg text-danger border border-danger-border uppercase">
                      Critico
                    </span>
                  )}
                  {task.frequency !== "once" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-subtle text-gold-dim uppercase">
                      {task.frequency === "every_30min"
                        ? "Cada 30 min"
                        : task.frequency === "twice_daily"
                          ? "2x dia"
                          : task.frequency === "daily"
                            ? "Diario"
                            : task.frequency}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
