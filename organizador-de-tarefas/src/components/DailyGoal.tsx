import React from "react";
import { motion } from "motion/react";
import { Target, CheckCircle2, ListTodo } from "lucide-react";
import { Task } from "../types";
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

  // Dynamic motivational quote in Portuguese based on progress
  let motivationalMessage = "";
  if (totalTasksToday === 0) {
    motivationalMessage = "Nenhuma tarefa para hoje ainda. Comece criando algo incrível! 🎯";
  } else if (dailyGoalPercentage === 100) {
    motivationalMessage = "Meta atingida! Dia extraordinário concluído com sucesso! 🏆✨";
  } else if (dailyGoalPercentage >= 75) {
    motivationalMessage = "Quase lá! Só mais um último sprint para fechar com chave de ouro! 💪";
  } else if (dailyGoalPercentage >= 50) {
    motivationalMessage = "Metade do caminho superada! Mantenha a consistência! 🚀";
  } else if (dailyGoalPercentage > 0) {
    motivationalMessage = "Excelente começo! Cada pequena vitória te aproxima da meta! 📈";
  } else {
    motivationalMessage = "Foco total hoje! Complete sua primeira tarefa para virar a chave! 🔥";
  }

  return (
    <div id="daily-goal-card" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden">
      {/* Dynamic light ambient glow inside card in high-completion state */}
      {dailyGoalPercentage === 100 && (
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none transition-all animate-pulse" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Target className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display">
              Meta Diária • Daily Goal
            </h4>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {completedTodayCount} concluídas hoje
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <ListTodo className="w-3 h-3 text-indigo-400" />
                {activeTodayCount} pendentes
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50 px-3 py-1 rounded-full leading-none">
            {completedTodayCount} / {totalTasksToday} tarefas ({Math.round(dailyGoalPercentage)}%)
          </span>
        </div>
      </div>

      {/* Modern, high contrast progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800/70 h-3 rounded-full overflow-hidden relative">
        <motion.div
          className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${dailyGoalPercentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between items-center mt-3 gap-2">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {motivationalMessage}
        </span>
        {totalTasksToday > 0 && dailyGoalPercentage < 100 && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 select-none">
            Faltam {(totalTasksToday - completedTodayCount)}
          </span>
        )}
      </div>
    </div>
  );
}
