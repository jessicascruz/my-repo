import React from "react";
import { motion } from "motion/react";
import { Task } from "../types";
import * as ui from "../lib/ui";
import { getLocalDateString, getLocalDateStringFromISO } from "../lib/dateUtils";

interface DailyGoalProps {
  tasks: Task[];
}

export function DailyGoal({ tasks }: DailyGoalProps) {
  const todayStr = getLocalDateString();

  // 1. Completed tasks today (excluding archived ones)
  const completedTodayCount = tasks.filter(
    (t) =>
      t.completed &&
      !t.archived &&
      getLocalDateStringFromISO(t.updatedAt || t.createdAt) === todayStr
  ).length;

  // 2. Total active tasks today (non-completed, non-archived)
  const activeTodayCount = tasks.filter((t) => !t.completed && !t.archived).length;

  // 3. Total scope for today = completed today + active today
  const totalTasksToday = completedTodayCount + activeTodayCount;

  // 4. Percentage progress
  const dailyGoalPercentage =
    totalTasksToday > 0 ? (completedTodayCount / totalTasksToday) * 100 : 0;

  // Uma frase por faixa de progresso. Voz ativa, sem exclamação — a única
  // permitida é a comemoração do dia 100%, uma por dia.
  let motivationalMessage = "";
  if (totalTasksToday === 0) {
    motivationalMessage = "Pauta vazia. Toque em gravar e fale o seu dia.";
  } else if (dailyGoalPercentage === 100) {
    motivationalMessage = "Dia fechado. Tudo o que entrou na pauta saiu!";
  } else if (dailyGoalPercentage >= 75) {
    motivationalMessage = "Falta pouco para fechar o dia.";
  } else if (dailyGoalPercentage >= 50) {
    motivationalMessage = "Metade do dia resolvida.";
  } else if (dailyGoalPercentage > 0) {
    motivationalMessage = "A primeira já saiu. O resto vem no mesmo ritmo.";
  } else {
    motivationalMessage = "Nada concluído ainda. Comece pela primeira da fila.";
  }

  const restam = totalTasksToday - completedTodayCount;

  return (
    <div id="daily-goal-card" className={`${ui.superficie} p-5`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className={ui.rotulo}>meta do dia</span>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-[44px] font-extrabold leading-none tracking-[-0.03em]">
              {completedTodayCount}
            </span>
            <span className={`${ui.monoNumLg} ${ui.suave}`}>de {totalTasksToday}</span>
          </p>
        </div>
        <span className={`${ui.monoNumLg} ${ui.suave}`}>
          {Math.round(dailyGoalPercentage)}%
        </span>
      </div>

      <div
        className="mt-4 h-[3px] w-full bg-pauta-baixa dark:bg-tinta-fundo"
        role="progressbar"
        aria-valuenow={completedTodayCount}
        aria-valuemax={totalTasksToday}
        aria-label={`${completedTodayCount} de ${totalTasksToday} concluídas`}
      >
        <motion.div
          className="h-full bg-fita dark:bg-fita-clara"
          initial={{ width: 0 }}
          animate={{ width: `${dailyGoalPercentage}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <p className={`mt-3 ${ui.corpoSm} ${ui.suave}`}>
        {motivationalMessage}
        {restam > 0 && totalTasksToday > 0 && (
          <span className={ui.monoNum}> · faltam {restam}</span>
        )}
      </p>
    </div>
  );
}
