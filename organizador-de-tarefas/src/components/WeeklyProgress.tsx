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
import { CalendarRange, CheckCircle2, Flame, Award, TrendingUp, Info, FileDown } from "lucide-react";
import { Task } from "../types";
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

  // Custom tooltips to match index.css visual guidelines
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isTodayText = data.isToday ? " (Hoje)" : "";
      const goalDifference = data.completas - currentDailyGoal;
      let statusText = "";
      if (data.completas >= currentDailyGoal) {
        statusText = "🏆 Meta atingida!";
      } else {
        statusText = `Faltaram ${Math.abs(goalDifference)} para a meta`;
      }

      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1.5 min-w-[150px]">
          <p className="font-bold text-slate-300 select-none">
            {data.dayLabel} - {data.dateLabel}{isTodayText}
          </p>
          <div className="flex items-center gap-1.5 font-sans font-semibold pt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
            <span className="text-emerald-400">
              {data.completas} {data.completas === 1 ? "tarefa" : "tarefas"}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1">
            {statusText}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="weekly-progress-card"
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs transition-all flex flex-col gap-5"
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 font-display">
              Progresso nos Últimos 7 Dias
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Comparação da sua produtividade recente com a meta atual de{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {currentDailyGoal} {currentDailyGoal === 1 ? "tarefa" : "tarefas"}
              </strong>
            </p>
          </div>
        </div>

        {/* Dynamic Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
          {currentStreak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
              <span>{currentStreak}D STREAK</span>
            </div>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <Award className="w-3.5 h-3.5" />
            <span>{daysGoalMet}/7 METAS</span>
          </div>

          <button
            onClick={generatePDFReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer active:scale-95"
            title="Baixar Relatório Semanal em PDF"
          >
            <FileDown className="w-4 h-4" />
            <span>Relatório PDF</span>
          </button>
        </div>
      </div>

      {/* Grid of Mini Stats Cards prior to Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/60 dark:border-slate-850/40 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Concluído (7d)
            </span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">
              {totalCompletedLast7Days}
            </span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-indigo-500/80" />
        </div>

        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/60 dark:border-slate-850/40 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Média Diária
            </span>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">
              {averageCompleted}{" "}
              <span className="text-[10px] font-normal text-slate-400">/dia</span>
            </span>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500/80" />
        </div>

        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/60 dark:border-slate-850/40 flex items-center">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              {completedTodayCount >= currentDailyGoal ? (
                <span><strong>Excelente!</strong> Você atingiu ou superou a meta diária hoje! Mantendo esse foco, você maximiza seu progresso.</span>
              ) : (
                <span>Faltam <strong>{Math.max(0, currentDailyGoal - completedTodayCount)}</strong> concluir hoje para bater sua meta diária de <strong>{currentDailyGoal}</strong> na Fila de Atividades.</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts BarChart */}
      <div className="w-full h-56 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(148, 163, 184, 0.15)"
            />
            <XAxis
              dataKey="dayLabel"
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.04)" }} />
            
            {/* Horizontal Line displaying the Daily Goal target */}
            <ReferenceLine
              y={currentDailyGoal}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Meta: ${currentDailyGoal}`,
                position: "top",
                fill: "#f43f5e",
                fontSize: 9,
                fontWeight: "bold",
                style: { letterSpacing: "0.05em" }
              }}
            />

            <Bar
              dataKey="completas"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            >
              {chartData.map((entry, index) => {
                // Determine highlight color if it is today
                const fill = entry.isToday
                  ? entry.completas >= currentDailyGoal
                    ? "#10b981" // Emerald today if goal is hit
                    : "#6366f1" // Indigo today if active
                  : entry.completas >= currentDailyGoal
                  ? "#818cf8" // Lighter indigo for successful past days
                  : "#94a3b8"; // Slate for general days below meta

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fill}
                    className="transition-colors duration-250 cursor-pointer"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Visual map legend helper */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[10px] text-slate-450 dark:text-slate-400 pt-2 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-1.5 font-medium">
          <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
          <span>Meta diária atingida</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <div className="w-2.5 h-2.5 rounded bg-indigo-500" />
          <span>Hoje (abaixo da meta)</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <div className="w-2.5 h-2.5 rounded bg-slate-400" />
          <span>Dias anteriores (abaixo da meta)</span>
        </div>
      </div>
    </div>
  );
}
