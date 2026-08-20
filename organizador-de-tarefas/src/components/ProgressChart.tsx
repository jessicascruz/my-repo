import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { LineChart, CheckCircle2, TrendingUp } from "lucide-react";

interface ProgressChartProps {
  completedGroupedByDate: Record<string, number>;
}

export function ProgressChart({ completedGroupedByDate }: ProgressChartProps) {
  // Format and sort daily data ascending (chronologically) so the chart reads left-to-right
  const sortedData = Object.entries(completedGroupedByDate)
    .map(([dateKey, count]) => {
      // Parse YYYY-MM-DD
      const [year, month, day] = dateKey.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      
      const formattedLabel = dateObj.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
      });

      const fullWeekdayLabel = dateObj.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return {
        rawDate: dateKey,
        label: formattedLabel,
        fullLabel: fullWeekdayLabel,
        quantidade: count,
      };
    })
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

  // If there's only 1 day of data, pad the graph with a starting 0 or an extra point to render beautifully as a sequence
  const displayData = sortedData.length === 1 
    ? [
        { rawDate: "0", label: "Início", fullLabel: "Primeiro registro", quantidade: 0 },
        ...sortedData
      ]
    : sortedData;

  const totalTasksCompleted = sortedData.reduce((acc, curr) => acc + curr.quantidade, 0);
  const maxCompletedInOneDay = sortedData.length > 0 
    ? Math.max(...sortedData.map(d => d.quantidade))
    : 0;

  // Custom polished tooltip to match index.css visual guidelines (Indigo/Slate themes)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
          <p className="font-bold text-slate-300 select-none capitalize">
            {data.fullLabel}
          </p>
          <div className="flex items-center gap-1.5 font-sans font-semibold pt-0.5 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450 shrink-0" />
            <span className="text-emerald-400">
              {data.quantidade} {data.quantidade === 1 ? "tarefa concluída" : "tarefas concluídas"}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-5">
      {/* Chart Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-755 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-indigo-500" />
            Estatísticas de Desempenho Diário
          </h4>
          <p className="text-xs text-slate-400">
            Acompanhe o ritmo de tarefas concluídas ao longo dos últimos dias de produtividade
          </p>
        </div>

        {/* Quick totals summary pill */}
        <div className="flex gap-4 items-center self-start sm:self-center">
          <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Concluídas</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{totalTasksCompleted}</span>
          </div>
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 px-3 py-1 rounded-xl text-center">
            <span className="block text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Recorde Diário</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-indigo-505 inline shrink-0" />
              {maxCompletedInOneDay}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Render Container */}
      <div className="w-full h-56 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(148, 163, 184, 0.15)"
            />
            
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              stroke="#94A3B8"
              fontSize={10}
              fontWeight={600}
              dy={10}
            />
            
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#94A3B8"
              fontSize={10}
              fontWeight={600}
              allowDecimals={false}
              dx={-5}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="quantidade"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorGrad)"
              activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#4f46e5" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Visual spark legend details */}
      <div className="flex items-center gap-6 text-[10px] text-slate-450 dark:text-slate-400 pt-1 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-1.5 font-medium">
          <div className="w-2.5 h-2.5 rounded bg-indigo-600" />
          <span>Atividades concluídas no dia</span>
        </div>
        <span className="font-mono text-slate-400 dark:text-slate-500">
          *Os dados refletem o histórico de finalização de suas tarefas
        </span>
      </div>
    </div>
  );
}
