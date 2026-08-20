import React from "react";
import { motion } from "motion/react";
import { Clock, Zap, TrendingUp, BarChart2 } from "lucide-react";
import { Task } from "../types";

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

  // Select dynamic productivity level details
  let levelTitle = "Sem dados";
  let levelColor = "text-slate-400 bg-slate-100 dark:bg-slate-800/80";
  let message = "Complete tarefas para ativar a análise de tempo médio de conclusão!";

  if (count > 0) {
    const mins = avgDurationMs / 60000;
    if (mins < 15) {
      levelTitle = "Ultra Sônico";
      levelColor = "text-amber-600 bg-amber-50 dark:bg-amber-955/30 border border-amber-200/50";
      message = "Você está voando! Conclusão quase instantânea das atividades. ⚡";
    } else if (mins < 120) {
      levelTitle = "Foco Produtivo";
      levelColor = "text-emerald-700 bg-emerald-50 dark:bg-emerald-955/30 border border-emerald-200/50";
      message = "Excelente ritmo de execução! Resolução dinâmica de pendências. 🚀";
    } else if (mins < 720) {
      levelTitle = "Consistente";
      levelColor = "text-indigo-650 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/40";
      message = "Bom fluxo de trabalho. Tarefas sendo entregues com qualidade e constância. 🎯";
    } else {
      levelTitle = "Longo Prazo";
      levelColor = "text-slate-700 bg-slate-100 dark:bg-slate-800 border border-slate-200/50";
      message = "Projetos de maior escopo e duração. Lembre-se de usar subtarefas se necessário! 📊";
    }
  }

  return (
    <div id="productivity-summary-card" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-all flex flex-col gap-4">
      {/* Header element */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display">
              Resumo de Produtividade
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              Com base no intervalo entre criação e finalização
            </span>
          </div>
        </div>

        {count > 0 && (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${levelColor} select-none uppercase tracking-wider`}>
            {levelTitle}
          </span>
        )}
      </div>

      {count === 0 ? (
        <div className="py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-950/30">
          <Clock className="w-8 h-8 text-slate-350 dark:text-slate-600 mx-auto mb-2 stroke-[1.5]" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-4">
            {message}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Average Duration Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/45 border border-slate-100/60 dark:border-slate-850/40 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Tempo Médio
            </span>
            <div>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight leading-none mb-1">
                {formatDurationReadable(avgDurationMs)}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Média calculada sobre {count} {count === 1 ? "tarefa" : "tarefas"}
              </p>
            </div>
          </div>

          {/* Fastest Completion Box */}
          {fastestTask && (
            <div className="p-4 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/15 border border-indigo-100/30 dark:border-indigo-900/10 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Conclusão Mais Rápida
              </span>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight mb-1 line-clamp-1">
                  &ldquo;{fastestTask.task.title}&rdquo;
                </p>
                <p className="text-[11px] font-mono font-bold text-emerald-650 dark:text-emerald-400">
                  Resolvido em {formatDurationReadable(fastestTask.duration)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Priority Comparison Card */}
      {count > 0 && (
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100/60 dark:border-slate-800/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              Foco em Alta Prioridade
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
              {highPercent}% do tempo total
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${highPercent}%` }}
                  className="h-full bg-indigo-500"
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - highPercent}%` }}
                  className="h-full bg-slate-300 dark:bg-slate-700"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Alta Prioridade</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatDurationReadable(totalHighMs)}</p>
                <p className="text-[9px] text-slate-400">{highCount} {highCount === 1 ? "tarefa" : "tarefas"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Outras</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatDurationReadable(totalOtherMs)}</p>
                <p className="text-[9px] text-slate-400">{otherCount} {otherCount === 1 ? "tarefa" : "tarefas"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Motivational / Hint Bar */}
      {count > 0 && (
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/25 p-3 rounded-xl border border-slate-100/40 dark:border-slate-850/20">
          <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
