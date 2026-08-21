import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Task } from "../types";
import { getLocalDateString, getLocalDateStringFromISO } from "../lib/dateUtils";
import { corDaCategoria } from "../lib/ui";
import * as ui from "../lib/ui";

interface CategoryPieChartProps {
  tasks: Task[];
}

export function CategoryPieChart({ tasks }: CategoryPieChartProps) {
  const todayStr = getLocalDateString();

  const completedToday = tasks.filter(
    (t) =>
      t.completed &&
      !t.archived &&
      getLocalDateStringFromISO(t.updatedAt || t.createdAt) === todayStr
  );

  const categoryCounts = completedToday.reduce((acc: Record<string, number>, t) => {
    const cat = t.category || "Geral";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Ordem estável: maior primeiro, e o índice na rampa vem daí. Vizinhos na
  // rosca alternam claro e escuro, então nenhuma fatia gruda na de ao lado.
  const chartData = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({ name, value, color: corDaCategoria(name, index) }));

  const totalCompletedToday = completedToday.length;

  const DicaDoGrafico = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const pct =
      totalCompletedToday > 0 ? Math.round((data.value / totalCompletedToday) * 100) : 0;
    return (
      <div className={`${ui.superficie} px-3 py-2`}>
        <p className={ui.corpoSm}>{data.name}</p>
        <p className={`${ui.monoNum} ${ui.suave}`}>
          {data.value} {data.value === 1 ? "tarefa" : "tarefas"} · {pct}%
        </p>
      </div>
    );
  };

  return (
    <div id="category-pie-chart-card" className={`${ui.superficie} p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={ui.rotulo}>concluídas hoje por categoria</span>
        <span className={`${ui.monoNum} ${ui.suave}`}>{totalCompletedToday}</span>
      </div>

      {totalCompletedToday === 0 ? (
        <p className={`mt-3 ${ui.corpoSm} ${ui.suave}`}>
          Nada concluído hoje ainda. Conclua na fila e a distribuição aparece aqui.
        </p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<DicaDoGrafico />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[26px] font-extrabold leading-none tracking-[-0.02em]">
                {totalCompletedToday}
              </span>
            </div>
          </div>

          {/* O rótulo é o rótulo: sempre escrito, nunca só a cor. */}
          <dl className="w-full flex-1 space-y-1">
            {chartData.map((data) => (
              <div key={data.name} className="flex items-baseline gap-2">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: data.color }}
                />
                <dt className={`min-w-0 flex-1 truncate ${ui.corpoSm}`}>{data.name}</dt>
                <dd className={`${ui.monoNum} ${ui.suave}`}>
                  {data.value} · {Math.round((data.value / totalCompletedToday) * 100)}%
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
