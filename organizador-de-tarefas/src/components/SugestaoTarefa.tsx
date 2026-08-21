import React from "react";
import { Sparkles, Play, CheckCircle, Target, ArrowRight, Focus } from "lucide-react";
import { motion } from "motion/react";
import { Task } from "../types";

interface SugestaoTarefaProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onToggleFocus: (id: string) => void;
  focusedTaskId: string | null;
}

export function SugestaoTarefa({
  tasks,
  onToggleComplete,
  onToggleFocus,
  focusedTaskId,
}: SugestaoTarefaProps) {
  // 1. Filter only pending/active (not completed and not archived) tasks
  const pendingTasks = tasks.filter((t) => !t.completed && !t.archived);

  // If there are no pending tasks, we don't display anything to keep layout pristine
  if (pendingTasks.length === 0) return null;

  // 2. Count frequency of categories in pending tasks
  const categoryCounts: Record<string, number> = {};
  pendingTasks.forEach((t) => {
    const cat = t.category || "Sem Categoria";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Identify the most frequent category
  let mostFrequentCategory = "";
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentCategory = cat;
    }
  });

  // 3. For each pending task, calculate a heuristic score
  // Priority weights: Alta = 30, Média = 15, Baixa = 5
  // Category frequency weight: if matching mostFrequentCategory, add 10 points
  const tasksWithScores = pendingTasks.map((task) => {
    let score = 0;

    // Priority score
    if (task.priority === "Alta") score += 30;
    else if (task.priority === "Média") score += 15;
    else if (task.priority === "Baixa") score += 5;

    // Category frequency score
    if (task.category === mostFrequentCategory) {
      score += 10;
    }

    return { task, score };
  });

  // Sort by score descending (highest score first)
  tasksWithScores.sort((a, b) => b.score - a.score);

  const bestMatch = tasksWithScores[0];
  if (!bestMatch) return null;

  const { task, score } = bestMatch;
  const isCurrentlyFocused = focusedTaskId === task.id;

  // Render priority color accent
  let priorityBadgeColor = "text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700";
  if (task.priority === "Alta") {
    priorityBadgeColor = "text-red-700 bg-red-50/50 border-red-100 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/30";
  } else if (task.priority === "Média") {
    priorityBadgeColor = "text-amber-700 bg-amber-50/50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30";
  } else if (task.priority === "Baixa") {
    priorityBadgeColor = "text-emerald-800 bg-emerald-50/50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30";
  }

  return (
    <motion.div
      id="sugestao-tarefa-card"
      initial={{ opacity: 0, y: -10 }}
      animate={
        isCurrentlyFocused
          ? {
              opacity: 1,
              y: 0,
              scale: [1, 1.022, 1],
              borderColor: [
                "rgba(245, 158, 11, 0.3)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(245, 158, 11, 0.3)",
              ],
              boxShadow: [
                "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
                "0 12px 20px -3px rgba(245, 158, 11, 0.15), 0 4px 12px -4px rgba(245, 158, 11, 0.15)",
                "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
              ],
            }
          : {
              opacity: 1,
              y: 0,
              scale: 1,
              borderColor: "rgba(99, 102, 241, 0.2)",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }
      }
      transition={
        isCurrentlyFocused
          ? {
              scale: {
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              },
              borderColor: {
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              },
              boxShadow: {
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              },
            }
          : { duration: 0.2 }
      }
      exit={{ opacity: 0, y: -10 }}
      className={`border rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-200 group ${
        isCurrentlyFocused
          ? "bg-gradient-to-r from-amber-50/40 via-orange-50/20 to-amber-50/30 dark:from-amber-950/15 dark:via-orange-950/5 dark:to-amber-950/10 border-amber-500/40"
          : "bg-gradient-to-r from-indigo-50/60 to-violet-50/40 dark:from-indigo-950/20 dark:to-violet-950/10 border-indigo-100/80 dark:border-indigo-900/30"
      }`}
    >
      {/* Visual Ambient Glow Decorator */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/10 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />

      {/* Top Tagline */}
      <div className="flex items-center justify-between mb-3 text-[10px]">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
          <span>Foco Recomendado</span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 font-mono">
          Score da Heurística: {score} pts
        </span>
      </div>

      {/* Recommended Task Detail Area */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal flex flex-wrap items-center gap-1.5 font-sans">
            Com base em prioridade e foco dominante em{" "}
            <span className="font-bold text-slate-700 dark:text-slate-400 bg-white/70 dark:bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
              {mostFrequentCategory}
            </span>:
          </p>
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug tracking-tight break-words group-hover:text-indigo-950 dark:group-hover:text-indigo-300 transition-colors">
            {task.title}
          </h4>

          {/* Tags / Meta details */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {task.category && (
              <span className="text-[10px] bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/25 px-2 py-0.5 rounded-md font-medium">
                {task.category}
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${priorityBadgeColor}`}>
              {task.priority}
            </span>
            {task.subtasks && task.subtasks.length > 0 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                🧩 {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtarefas
              </span>
            )}
          </div>
        </div>

        {/* Action Controls for Recommendation */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {/* Complete Button */}
          <button
            onClick={() => onToggleComplete(task.id)}
            title="Concluir tarefa recomendada"
            type="button"
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer shadow-xs focus:ring-1 focus:ring-emerald-500"
          >
            <CheckCircle className="w-4 h-4" />
          </button>

          {/* Toggle Focus Button */}
          <button
            onClick={() => onToggleFocus(task.id)}
            type="button"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isCurrentlyFocused
                ? "bg-amber-500 hover:bg-amber-500 text-white "
                : "bg-indigo-600 hover:bg-indigo-600 text-white hover:shadow-md"
            }`}
          >
            {isCurrentlyFocused ? (
              <>
                <Target className="w-3.5 h-3.5 animate-spin [animation-duration:4s]" />
                <span>Parar Foco</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 shrink-0 fill-current" />
                <span>Focar Agora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
