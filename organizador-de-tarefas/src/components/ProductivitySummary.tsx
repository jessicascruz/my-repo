import React from "react";
import { Task } from "../types";
import * as ui from "../lib/ui";

interface ProductivitySummaryProps {
  tasks: Task[];
}

export function ProductivitySummary({ tasks }: ProductivitySummaryProps) {
  // Filter tasks that are completed and have valid timestamps
  const completedWithTime = tasks.filter((t) => {
    if (!t.completed || !t.createdAt || !t.updatedAt) return false;
    const cTime = new Date(t.createdAt).getTime();
    const uTime = new Date(t.updatedAt).getTime();
    return uTime > cTime; // must be positive duration
  });

  // Calculate durations in ms
  const durations = completedWithTime.map((t) => {
    const cTime = new Date(t.createdAt).getTime();
    const uTime = new Date(t.updatedAt).getTime();
    return {
      task: t,
      duration: uTime - cTime,
    };
  });

  // Total completed tasks with duration
  const count = durations.length;

  // Average duration
  const avgDurationMs = count > 0 ? durations.reduce((acc, curr) => acc + curr.duration, 0) / count : 0;

  // Fastest completed task
  const fastestTask = count > 0 ? durations.reduce((prev, curr) => (curr.duration < prev.duration ? curr : prev), durations[0]) : null;

  // Slowest completed task (optional extra stat for depth)
  const slowestTask = count > 0 ? durations.reduce((prev, curr) => (curr.duration > prev.duration ? curr : prev), durations[0]) : null;

  // High Priority vs Others
  const highPriorityTasks = durations.filter(d => d.task.priority === "Alta");
  const otherPriorityTasks = durations.filter(d => d.task.priority !== "Alta");

  const totalHighMs = highPriorityTasks.reduce((acc, curr) => acc + curr.duration, 0);
  const totalOtherMs = otherPriorityTasks.reduce((acc, curr) => acc + curr.duration, 0);

  const highCount = highPriorityTasks.length;
  const otherCount = otherPriorityTasks.length;

  const totalMs = totalHighMs + totalOtherMs;
  const highPercent = totalMs > 0 ? Math.round((totalHighMs / totalMs) * 100) : 0;

  // Helper to format ms to readable Portuguese text
  const formatDurationReadable = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      return `${days}d e ${remainingHours}h`;
    }
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h e ${remainingMinutes}min`;
    }
    if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}min e ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  // Uma leitura por faixa de tempo médio. Sem emoji, sem exclamação.
  let levelTitle = "sem dados";
  let message = "Conclua tarefas para o app medir o tempo entre criar e concluir.";

  if (count > 0) {
    const mins = avgDurationMs / 60000;
    if (mins < 15) {
      levelTitle = "quase imediato";
      message = "Você resolve o que entra na pauta quase na hora.";
    } else if (mins < 120) {
      levelTitle = "no mesmo dia";
      message = "Ritmo bom: a tarefa não fica esperando.";
    } else if (mins < 720) {
      levelTitle = "algumas horas";
      message = "Fluxo constante, com folga entre criar e concluir.";
    } else {
      levelTitle = "de escopo longo";
      message = "As tarefas duram mais de meio dia. Quebrar em subtarefas ajuda a ver o avanço.";
    }
  }

  return (
    <div id="productivity-summary-card" className={`${ui.superficie} p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={ui.rotulo}>tempo entre criar e concluir</span>
        {count > 0 && <span className={`${ui.monoRot} ${ui.suave}`}>{levelTitle}</span>}
      </div>

      {count === 0 ? (
        <p className={`mt-3 ${ui.corpoSm} ${ui.suave}`}>{message}</p>
      ) : (
        <>
          {/* O número grande se justifica aqui: ele é o conteúdo. */}
          <p className="mt-2 font-display text-[clamp(30px,6vw,44px)] font-extrabold leading-none tracking-[-0.03em]">
            {formatDurationReadable(avgDurationMs)}
          </p>
          <p className={`mt-1 ${ui.corpoSm} ${ui.suave}`}>
            média de {count} {count === 1 ? "tarefa" : "tarefas"} · {message}
          </p>

          <dl className="mt-4 grid gap-4 border-t border-linha pt-4 dark:border-tinta-linha sm:grid-cols-2">
            {fastestTask && (
              <div className="min-w-0">
                <dt className={ui.rotulo}>a mais rápida</dt>
                <dd className={`mt-0.5 truncate ${ui.corpoSm}`}>{fastestTask.task.title}</dd>
                <dd className={`${ui.monoNum} ${ui.suave}`}>
                  {formatDurationReadable(fastestTask.duration)}
                </dd>
              </div>
            )}
            {slowestTask && (
              <div className="min-w-0 sm:border-l sm:border-linha sm:pl-4 sm:dark:border-tinta-linha">
                <dt className={ui.rotulo}>a mais demorada</dt>
                <dd className={`mt-0.5 truncate ${ui.corpoSm}`}>{slowestTask.task.title}</dd>
                <dd className={`${ui.monoNum} ${ui.suave}`}>
                  {formatDurationReadable(slowestTask.duration)}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4 border-t border-linha pt-4 dark:border-tinta-linha">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className={ui.rotulo}>fatia em alta prioridade</span>
              <span className={`${ui.monoNum} ${ui.suave}`}>{highPercent}% do tempo</span>
            </div>
            <div
              className="mt-2 h-[3px] w-full bg-pauta-baixa dark:bg-tinta-fundo"
              role="img"
              aria-label={`${highPercent} por cento do tempo em prioridade Alta`}
            >
              <div className="h-full bg-gravando" style={{ width: `${highPercent}%` }} />
            </div>
            <p className={`mt-2 ${ui.monoNum} ${ui.suave}`}>
              {highCount} {highCount === 1 ? "Alta" : "Altas"} · {otherCount}{" "}
              {otherCount === 1 ? "outra" : "outras"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
