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
import * as ui from "../lib/ui";

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

  const DicaDoGrafico = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className={`${ui.superficie} px-3 py-2`}>
        <p className={`${ui.corpoSm} capitalize`}>{data.fullLabel}</p>
        <p className={`${ui.monoNum} ${ui.suave}`}>
          {data.quantidade} {data.quantidade === 1 ? "concluída" : "concluídas"}
        </p>
      </div>
    );
  };

  return (
    <div className={`${ui.superficie} p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <span className={ui.rotulo}>concluídas por dia</span>
        <span className={`${ui.monoNum} ${ui.suave}`}>
          {totalTasksCompleted} no total · recorde {maxCompletedInOneDay} num dia
        </span>
      </div>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={ui.CORES_GRAFICO.linha} strokeOpacity={0.5} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontFamily: "DM Mono, monospace", fontSize: 11, fill: "currentColor" }}
              className={ui.fraco}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fontFamily: "DM Mono, monospace", fontSize: 11, fill: "currentColor" }}
              className={ui.fraco}
            />
            <Tooltip content={<DicaDoGrafico />} />
            <Area
              type="monotone"
              dataKey="quantidade"
              stroke={ui.CORES_GRAFICO.fitaClara}
              strokeWidth={2}
              fill={ui.CORES_GRAFICO.fitaClara}
              fillOpacity={0.12}
              activeDot={{ r: 4, fill: ui.CORES_GRAFICO.fitaClara, stroke: "none" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
