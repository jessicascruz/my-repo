import React from "react";
import { motion } from "motion/react";
import { Task } from "../types";
import * as ui from "../lib/ui";
import { getLocalDateString, getLocalDateStringFromISO } from "../lib/dateUtils";

interface PriorityDurationCardProps {
  tasks: Task[];
}

export function PriorityDurationCard({ tasks }: PriorityDurationCardProps) {
  const now = new Date().getTime();
  const todayStr = getLocalDateString();

  const calculateDuration = (task: Task) => {
    if (!task.createdAt) return 0;
    const start = new Date(task.createdAt).getTime();
    if (isNaN(start)) return 0;

    let end = now;
    if (task.completed) {
      if (task.updatedAt) {
        const uTime = new Date(task.updatedAt).getTime();
        end = !isNaN(uTime) ? uTime : start;
      } else {
        end = start;
      }
    }
    return Math.max(0, end - start);
  };

  // Only consider non-archived tasks created today to align with "Fila de Atividades" tab context
  const todayTasks = tasks.filter(
    (t) => !t.archived && getLocalDateStringFromISO(t.createdAt) === todayStr
  );

  const highPriorityTasks = todayTasks.filter((t) => t.priority === "Alta");
  const otherTasks = todayTasks.filter((t) => t.priority !== "Alta");

  const highPriorityTime = highPriorityTasks.reduce((acc, t) => acc + calculateDuration(t), 0);
  const otherTime = otherTasks.reduce((acc, t) => acc + calculateDuration(t), 0);

  const formatDuration = (ms: number) => {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}min`;
  };

  const totalTime = highPriorityTime + otherTime;
  const highPercentage = totalTime > 0 ? (highPriorityTime / totalTime) * 100 : 0;

  if (todayTasks.length === 0) return null;

  return (
    <div className={`${ui.superficie} p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={ui.rotulo}>tempo em alta prioridade</span>
        <span className={`${ui.monoNum} ${ui.suave}`}>{Math.round(highPercentage)}% do total</span>
      </div>

      <div
        className="mt-3 flex h-[3px] w-full bg-pauta-baixa dark:bg-tinta-fundo"
        role="img"
        aria-label={`${Math.round(highPercentage)} por cento do tempo em tarefas de prioridade Alta`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${highPercentage}%` }}
          transition={{ duration: 0.4 }}
          className="h-full bg-gravando"
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className={ui.rotulo}>alta</dt>
          <dd className={`mt-0.5 ${ui.monoNumLg}`}>{formatDuration(highPriorityTime)}</dd>
        </div>
        <div className="border-l border-linha pl-4 dark:border-tinta-linha">
          <dt className={ui.rotulo}>o resto</dt>
          <dd className={`mt-0.5 ${ui.monoNumLg}`}>{formatDuration(otherTime)}</dd>
        </div>
      </dl>

      <p className={`mt-3 ${ui.corpoSm} ${ui.suave}`}>
        Tempo acumulado da criação até a conclusão — ou até agora, quando a tarefa segue na fila.
      </p>
    </div>
  );
}
