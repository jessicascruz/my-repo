import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { FileDown } from "lucide-react";
import { Task } from "../types";
import * as ui from "../lib/ui";
import { getLocalDateString, getLocalDateStringFromISO } from "../lib/dateUtils";
import { jsPDF } from "jspdf";

interface WeeklyProgressProps {
  tasks: Task[];
}

export function WeeklyProgress({ tasks }: WeeklyProgressProps) {
  // 1. Calculate today's date string
  const todayObj = new Date();
  const todayStr = getLocalDateString(todayObj);

  // 2. Identify the dynamic daily goal
  // (Tasks completed today + active tasks remaining) - same logic as DailyGoal.tsx
  const completedTodayCount = tasks.filter(
    (t) =>
      t.completed &&
      !t.archived &&
      getLocalDateStringFromISO(t.updatedAt || t.createdAt) === todayStr
  ).length;

  const activeTodayCount = tasks.filter((t) => !t.completed && !t.archived).length;
  
  // Default to a sensible base target of 3 tasks if there's no scope created today
  const currentDailyGoal = Math.max(3, completedTodayCount + activeTodayCount);

  // 3. Generate last 7 days (including today)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(todayObj.getDate() - (6 - i));
    return d;
  });

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // 4. Populate weekly data
  const chartData = last7Days.map((dateObj) => {
    const dateStr = getLocalDateString(dateObj);
    const dayName = weekdays[dateObj.getDay()];
    const dateFormatted = `${String(dateObj.getDate()).padStart(2, "0")}/${String(
      dateObj.getMonth() + 1
    ).padStart(2, "0")}`;

    // Completed tasks on this day (excluding archived ones)
    const completedOnDay = tasks.filter(
      (t) =>
        t.completed &&
        !t.archived &&
        getLocalDateStringFromISO(t.updatedAt || t.createdAt) === dateStr
    ).length;

    const isToday = dateStr === todayStr;

    return {
      dateStr,
      dayLabel: isToday ? "Hoje" : dayName,
      dateLabel: dateFormatted,
      completas: completedOnDay,
      isToday,
    };
  });

  // Calculate statistics
  const totalCompletedLast7Days = chartData.reduce((acc, curr) => acc + curr.completas, 0);
  const averageCompleted = (totalCompletedLast7Days / 7).toFixed(1);
  const daysGoalMet = chartData.filter((d) => d.completas >= currentDailyGoal).length;

  const generatePDFReport = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Local date range formatting
      const startDayObj = last7Days[0];
      const endDayObj = last7Days[last7Days.length - 1];
      const dateRangeStr = `${String(startDayObj.getDate()).padStart(2, "0")}/${String(
        startDayObj.getMonth() + 1
      ).padStart(2, "0")} a ${String(endDayObj.getDate()).padStart(2, "0")}/${String(
        endDayObj.getMonth() + 1
      ).padStart(2, "0")}`;

      // 1. Color Palette Definitions (Deep Slate / Indigo / Gray)
      const primaryColor = { r: 79, g: 70, b: 229 }; // Indigo-600
      const secondaryColor = { r: 15, g: 23, b: 42 }; // Slate-900
      const lightBgColor = { r: 248, g: 250, b: 252 }; // Slate-50
      const borderClr = { r: 226, g: 232, b: 240 }; // Slate-200
      const textMuted = { r: 100, g: 116, b: 139 }; // Slate-500

      // Helper for drawing clean lines
      const drawDivider = (y: number) => {
        doc.setDrawColor(borderClr.r, borderClr.g, borderClr.b);
        doc.setLineWidth(0.3);
        doc.line(15, y, 195, y);
      };

      // --- PAGE HEADER ---
      // Top accent bar
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(0, 0, 210, 8, "F");

      // App Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text("Remix Organizador", 15, 23);

      // Report Title
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text(`Relatório Semanal de Produtividade  |  Período: ${dateRangeStr}`, 15, 29);

      // Date of Generation
      const now = new Date();
      const generationDateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
        now.getMonth() + 1
      ).padStart(2, "0")}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      doc.setFontSize(9);
      doc.text(`Gerado em: ${generationDateStr}`, 195, 23, { align: "right" });

      drawDivider(34);

      // --- SUMMARY CARDS (Key Metrics) ---
      // Section title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text("Resumo de Desempenho", 15, 43);

      // Draw 3 summary cards side-by-side
      const cardWidth = 53;
      const cardHeight = 22;
      const cardY = 48;
      const gap = 6;

      // Card 1: Total Completed
      doc.setFillColor(lightBgColor.r, lightBgColor.g, lightBgColor.b);
      doc.roundedRect(15, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text("TAREFAS CONCLUÍDAS", 20, cardY + 7);
      doc.setFontSize(18);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(totalCompletedLast7Days.toString(), 20, cardY + 16);

      // Card 2: Daily Average
      doc.setFillColor(lightBgColor.r, lightBgColor.g, lightBgColor.b);
      doc.roundedRect(15 + cardWidth + gap, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text("MÉDIA DIÁRIA", 15 + cardWidth + gap + 5, cardY + 7);
      doc.setFontSize(18);
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text(`${averageCompleted} /dia`, 15 + cardWidth + gap + 5, cardY + 16);

      // Card 3: Goals Hit & Streak
      doc.setFillColor(lightBgColor.r, lightBgColor.g, lightBgColor.b);
      doc.roundedRect(15 + (cardWidth + gap) * 2, cardY, cardWidth, cardHeight, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text("METAS CUMPRIDAS", 15 + (cardWidth + gap) * 2 + 5, cardY + 7);
      doc.setFontSize(18);
      doc.setTextColor(16, 185, 129); // Emerald-500
      doc.text(`${daysGoalMet} de 7 dias`, 15 + (cardWidth + gap) * 2 + 5, cardY + 16);

      drawDivider(78);

      // --- SECTION 2: VOLUME BY CATEGORY ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text("Volume de Tarefas Concluídas por Categoria", 15, 87);

      // Filter tasks completed in the last 7 days
      const last7DaysStrings = last7Days.map((d) => getLocalDateString(d));
      const completedInLast7Days = tasks.filter(
        (t) =>
          t.completed &&
          !t.archived &&
          last7DaysStrings.includes(getLocalDateStringFromISO(t.updatedAt || t.createdAt))
      );

      // Map to get unique categories and compute statistics
      const categoryStatsMap: Record<string, number> = {};
      completedInLast7Days.forEach((t) => {
        const cat = t.category || "Outros";
        categoryStatsMap[cat] = (categoryStatsMap[cat] || 0) + 1;
      });

      const categoriesSorted = Object.entries(categoryStatsMap).sort((a, b) => b[1] - a[1]);

      let nextY = 94;

      if (categoriesSorted.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
        doc.text("Nenhuma tarefa concluída no período para exibição de categorias.", 15, nextY);
        nextY += 10;
      } else {
        // Draw Table Header
        doc.setFillColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
        doc.rect(15, nextY, 180, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text("Categoria", 20, nextY + 5);
        doc.text("Quantidade Concluída", 90, nextY + 5);
        doc.text("Percentual de Contribuição", 140, nextY + 5);

        nextY += 7;

        // Draw Table Rows
        categoriesSorted.forEach(([cat, count], idx) => {
          // Zebra striping
          if (idx % 2 === 1) {
            doc.setFillColor(lightBgColor.r, lightBgColor.g, lightBgColor.b);
            doc.rect(15, nextY, 180, 8, "F");
          }
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
          doc.text(cat, 20, nextY + 5.5);
          doc.text(`${count} ${count === 1 ? 'tarefa' : 'tarefas'}`, 90, nextY + 5.5);

          const percentage = totalCompletedLast7Days > 0 ? ((count / totalCompletedLast7Days) * 100).toFixed(0) : "0";
          doc.text(`${percentage}%`, 140, nextY + 5.5);

          // Draw progress indicator bar
          const barMaxFillWidth = 15;
          const fillWidth = totalCompletedLast7Days > 0 ? Math.max(1, (count / totalCompletedLast7Days) * barMaxFillWidth) : 1;
          doc.setFillColor(borderClr.r, borderClr.g, borderClr.b);
          doc.roundedRect(165, nextY + 3.5, barMaxFillWidth, 2, 1, 1, "F");
          doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
          doc.roundedRect(165, nextY + 3.5, fillWidth, 2, 1, 1, "F");

          nextY += 8;
        });
      }

      drawDivider(nextY + 4);
      nextY += 12;

      // --- SECTION 3: DAILY DISTRIBUTION ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text("Distribuição Diária por Categoria", 15, nextY);

      nextY += 6;

      // Draw Grid Header for Days
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(15, nextY, 180, 7, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      
      const colWidth = 180 / 8; // 8 columns total
      doc.text("Categoria", 17, nextY + 5);

      chartData.forEach((day, dIdx) => {
        doc.text(day.dayLabel, 15 + colWidth * (dIdx + 1) + 2, nextY + 5, { align: "left" });
      });

      nextY += 7;

      if (categoriesSorted.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
        doc.text("Sem dados diários para exibição.", 15, nextY + 6);
        nextY += 12;
      } else {
        // Rows: unique categories, Columns: completed counts on each day
        categoriesSorted.forEach(([cat], catIdx) => {
          if (catIdx % 2 === 1) {
            doc.setFillColor(lightBgColor.r, lightBgColor.g, lightBgColor.b);
            doc.rect(15, nextY, 180, 8, "F");
          }

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
          doc.text(cat, 17, nextY + 5.5);

          chartData.forEach((day, dIdx) => {
            const countOnDay = tasks.filter(
              (t) =>
                t.completed &&
                !t.archived &&
                t.category === cat &&
                getLocalDateStringFromISO(t.updatedAt || t.createdAt) === day.dateStr
            ).length;

            if (countOnDay > 0) {
              doc.setFont("helvetica", "bold");
              doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
              doc.text(countOnDay.toString(), 15 + colWidth * (dIdx + 1) + 5, nextY + 5.5);
            } else {
              doc.setFont("helvetica", "normal");
              doc.setTextColor(borderClr.r - 50, borderClr.g - 50, borderClr.b - 50);
              doc.text("-", 15 + colWidth * (dIdx + 1) + 5, nextY + 5.5);
            }
          });

          nextY += 8;
        });
      }

      // Add simple total row
      doc.setFillColor(241, 245, 249);
      doc.rect(15, nextY, 180, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.text("Total Diário", 17, nextY + 5.5);

      chartData.forEach((day, dIdx) => {
        doc.text(day.completas.toString(), 15 + colWidth * (dIdx + 1) + 5, nextY + 5.5);
      });

      nextY += 15;

      // --- PAGE FOOTER ---
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(textMuted.r, textMuted.g, textMuted.b);
      doc.text(
        "Foco e Consistência: 'Pequenos progressos diários resultam em grandes conquistas!'",
        105,
        282,
        { align: "center" }
      );
      doc.text("Página 1 de 1", 195, 282, { align: "right" });

      // Save PDF
      doc.save(`relatorio_produtividade_semanal_${todayStr}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  // Streak logic (how many consecutive days up to today with at least 1 completed task)
  let currentStreak = 0;
  // Let's reverse to check today, yesterday, etc.
  const reversedData = [...chartData].reverse();
  for (const day of reversedData) {
    if (day.completas > 0) {
      currentStreak++;
    } else {
      // If we miss today, the streak is not broken yet if yesterday had a high score,
      // but let's strictly count consecutive active days back from today or yesterday
      if (day.isToday && completedTodayCount === 0) {
        // If today has 0 but we check yesterday...
        continue;
      }
      break;
    }
  }

  const DicaDoGrafico = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const bateu = data.completas >= currentDailyGoal;
    return (
      <div className={`${ui.superficie} min-w-36 px-3 py-2`}>
        <p className={ui.corpoSm}>
          {data.dayLabel}, {data.dateLabel}
          {data.isToday ? " (hoje)" : ""}
        </p>
        <p className={`${ui.monoNum} ${ui.suave}`}>
          {data.completas} {data.completas === 1 ? "concluída" : "concluídas"}
        </p>
        <p className={`${ui.monoNum} ${ui.fraco}`}>
          {bateu
            ? "meta batida"
            : `faltaram ${currentDailyGoal - data.completas} para a meta`}
        </p>
      </div>
    );
  };

  return (
    <div id="weekly-progress-card" className={`${ui.superficie} p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className={ui.rotulo}>últimos sete dias</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`${ui.monoNum} ${ui.suave}`}>
            {currentStreak > 0 && `${currentStreak}d seguidos · `}
            {daysGoalMet}/7 metas
          </span>
          <button onClick={generatePDFReport} className={ui.btnFantasma}>
            <FileDown className="h-4 w-4" />
            Relatório PDF
          </button>
        </div>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className={ui.rotulo}>concluídas em 7 dias</dt>
          <dd className="mt-0.5 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em]">
            {totalCompletedLast7Days}
          </dd>
        </div>
        <div className="sm:border-l sm:border-linha sm:pl-4 sm:dark:border-tinta-linha">
          <dt className={ui.rotulo}>por dia, na média</dt>
          <dd className="mt-0.5 font-display text-[32px] font-extrabold leading-none tracking-[-0.03em]">
            {averageCompleted}
          </dd>
        </div>
      </dl>

      <p className={`mt-3 ${ui.corpoSm} ${ui.suave}`}>
        {completedTodayCount >= currentDailyGoal
          ? `Meta de hoje batida: ${currentDailyGoal} ${
              currentDailyGoal === 1 ? "tarefa" : "tarefas"
            }.`
          : `Faltam ${Math.max(
              0,
              currentDailyGoal - completedTodayCount
            )} para a meta de hoje, que é ${currentDailyGoal}.`}
      </p>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 16, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={ui.CORES_GRAFICO.linha} strokeOpacity={0.5} />
            <XAxis
              dataKey="dayLabel"
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
            <Tooltip content={<DicaDoGrafico />} cursor={{ fill: "transparent" }} />

            <ReferenceLine
              y={currentDailyGoal}
              stroke={ui.CORES_GRAFICO.dial}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `meta ${currentDailyGoal}`,
                position: "top",
                fill: ui.CORES_GRAFICO.dial,
                fontSize: 11,
                fontFamily: "DM Mono, monospace",
              }}
            />

            <Bar dataKey="completas" maxBarSize={28} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.completas >= currentDailyGoal
                      ? ui.CORES_GRAFICO.fita
                      : ui.CORES_GRAFICO.fitaClara
                  }
                  fillOpacity={entry.isToday ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-linha pt-3 dark:border-tinta-linha">
        <span className={`flex items-center gap-1.5 ${ui.monoRot} ${ui.fraco}`}>
          <span className="h-2 w-2 bg-fita" />
          meta batida
        </span>
        <span className={`flex items-center gap-1.5 ${ui.monoRot} ${ui.fraco}`}>
          <span className="h-2 w-2 bg-fita-clara opacity-55" />
          abaixo da meta
        </span>
        <span className={`flex items-center gap-1.5 ${ui.monoRot} ${ui.fraco}`}>
          <span className="h-2 w-2 border border-dial border-dashed" />
          meta do dia
        </span>
      </div>
    </div>
  );
}
