import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieIcon, CheckCircle2, Award } from "lucide-react";
import { Task } from "../types";
import { getLocalDateString, getLocalDateStringFromISO } from "../lib/dateUtils";

interface CategoryPieChartProps {
  tasks: Task[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Trabalho: "#6366f1", // Indigo 500
  Estudos: "#a855f7",  // Purple 500
  Pessoal: "#10b981",  // Emerald 500
  Saúde: "#f43f5e",    // Rose 500
  Finanças: "#06b6d4", // Cyan 500
  Casa: "#f59e0b",     // Amber 500
  Geral: "#64748b",    // Slate 500
  Outros: "#14b8a6",   // Teal 500
};

const DEFAULT_COLOR = "#818cf8"; // Indigo 400

export function CategoryPieChart({ tasks }: CategoryPieChartProps) {
  // Get today's local date YYYY-MM-DD
  const todayStr = getLocalDateString();

  // Filter tasks completed today
  const completedToday = tasks.filter(
    (t) => t.completed && !t.archived && getLocalDateStringFromISO(t.updatedAt || t.createdAt) === todayStr
  );

  // Group by category
  const categoryCounts = completedToday.reduce((acc: Record<string, number>, t) => {
    const cat = t.category || "Geral";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Parse into Recharts format
  const chartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || DEFAULT_COLOR,
  }));

  const totalCompletedToday = completedToday.length;

  // Custom tooltips to present polished dark labels
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalCompletedToday > 0 ? ((data.value / totalCompletedToday) * 100).toFixed(0) : "0";
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg border border-slate-800 text-xs space-y-0.5">
          <p className="font-bold text-slate-200 select-none">{data.name}</p>
          <div className="flex items-center gap-1.5 font-sans font-semibold pt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-300">
              {data.value} {data.value === 1 ? "tarefa" : "tarefas"} ({percentage}%)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="category-pie-chart-card"
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-all flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display">
              Categorias Concluídas Hoje
            </h4>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              Distribuição percentual por área de foco
            </span>
          </div>
        </div>

        {totalCompletedToday > 0 && (
          <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full select-none uppercase tracking-wider">
            <Award className="w-3 h-3" />
            <span>{totalCompletedToday} feitas</span>
          </div>
        )}
      </div>

      {totalCompletedToday === 0 ? (
        <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-950/30 flex flex-col items-center justify-center min-h-[140px]">
          <CheckCircle2 className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2 stroke-[1.5]" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-4">
            Nenhuma tarefa concluída hoje ainda para gerar a proporção por categorias.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Complete suas tarefas na Fila de Atividades para ver o gráfico de pizza!
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Pie Chart Section */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Absolute Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">
                {totalCompletedToday}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Feitas
              </span>
            </div>
          </div>

          {/* Categories Legend List */}
          <div className="flex-1 w-full grid grid-cols-2 gap-2 text-xs">
            {chartData.map((data, index) => {
              const pct = ((data.value / totalCompletedToday) * 100).toFixed(0);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/60 dark:border-slate-900/40"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: data.color }}
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-400 truncate pr-1">
                      {data.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                    <span>{data.value}</span>
                    <span className="text-slate-400 dark:text-slate-700">|</span>
                    <span className="text-indigo-650 dark:text-indigo-400 pr-1">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
