import React from "react";
import { motion } from "motion/react";
import { AlertCircle, Clock, Info } from "lucide-react";
import { Task } from "../types";
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
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Foco em Alta Prioridade
          </h4>
        </div>
        <div className="group relative">
          <Info className="w-4 h-4 text-slate-300 dark:text-slate-600 cursor-help" />
          <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
            Tempo total acumulado desde a criação até a conclusão (ou agora, se ativa).
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Distribuição</span>
          <span className="text-[10px] font-bold text-rose-500 font-mono">{Math.round(highPercentage)}% Crítico</span>
        </div>
        
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${highPercentage}%` }}
            className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
          />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${100 - highPercentage}%` }}
            className="h-full bg-slate-200 dark:bg-slate-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Alta Prioridade</p>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 font-sans">{formatDuration(highPriorityTime)}</p>
            </div>
          </div>
          <div className="space-y-1 border-l border-slate-100 dark:border-slate-800 pl-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Outros</p>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 font-sans">{formatDuration(otherTime)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
