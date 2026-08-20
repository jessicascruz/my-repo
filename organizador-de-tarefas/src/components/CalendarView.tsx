import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  ListTodo,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, Category, Priority } from "../types";

interface CalendarViewProps {
  tasks: Task[];
  categories: string[];
  onToggleComplete: (id: string) => void;
  setActiveTab: (tab: "diarias" | "historico" | "arquivadas" | "calendario") => void;
  setHistoryDate: (date: string) => void;
}

export function CalendarView({
  tasks,
  categories,
  onToggleComplete,
  setActiveTab,
  setHistoryDate,
}: CalendarViewProps) {
  const today = new Date();
  
  // Format standard date: YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateString(today);

  // Calendar focus state (starts on current month/year/selected today)
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const weekdayLabelPT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Navigate back/forward month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(todayStr);
  };

  // Build grid of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const daysGrid: {
    dayNum: number;
    monthOffset: number; // -1 for previous month, 0 for current, 1 for next
    dateStr: string;
  }[] = [];

  // 1. Prefix with previous month's trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDay = totalDaysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYearVal}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(
      prevDay
    ).padStart(2, "0")}`;

    daysGrid.push({
      dayNum: prevDay,
      monthOffset: -1,
      dateStr,
    });
  }

  // 2. Current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(
      2,
      "0"
    )}`;

    daysGrid.push({
      dayNum: i,
      monthOffset: 0,
      dateStr,
    });
  }

  // 3. Suffix with next month's starting days up to full grid lines of 7 (maximum 6 rows = 42 fields)
  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYearVal = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYearVal}-${String(nextMonthIdx + 1).padStart(2, "0")}-${String(i).padStart(
      2,
      "0"
    )}`;

    daysGrid.push({
      dayNum: i,
      monthOffset: 1,
      dateStr,
    });
  }

  // Filter tasks matching Selected Day
  const filteredTasksForSelectedSelectedDay = tasks.filter((t) => {
    const completionDate = (t.updatedAt || t.createdAt || "").slice(0, 10);
    return completionDate === selectedDateStr && !t.archived;
  });

  const completedCountForDay = filteredTasksForSelectedSelectedDay.filter((t) => t.completed).length;
  const activeCountForDay = filteredTasksForSelectedSelectedDay.filter((t) => !t.completed).length;

  // Sync to history component date handler
  const handleViewInHistory = () => {
    setHistoryDate(selectedDateStr);
    setActiveTab("historico");
  };

  // Helper colors for category dots
  const getCategoryDotClass = (cat: string) => {
    const dotColors: Record<string, string> = {
      Trabalho: "bg-blue-500 dark:bg-blue-400",
      Estudo: "bg-amber-500 dark:bg-amber-400",
      Pessoal: "bg-emerald-500 dark:bg-emerald-400",
      Saúde: "bg-rose-500 dark:bg-rose-400",
      "Bem-Estar": "bg-pink-500 dark:bg-pink-400",
      Ideia: "bg-purple-500 dark:bg-purple-400",
    };
    return dotColors[cat] || "bg-indigo-400";
  };

  // Helper Priority Badge Styling
  const getPriorityBadgeColors = (priority: Priority) => {
    switch (priority) {
      case "Alta":
        return "bg-rose-50/80 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30";
      case "Média":
        return "bg-amber-50/80 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50";
    }
  };

  // Total summary calculation for calendar monthly preview
  const totalCompletedInCurrentMonth = tasks.filter((t) => {
    if (!t.completed || t.archived) return false;
    const dateStr = (t.updatedAt || t.createdAt || "");
    const dateObj = new Date(dateStr);
    return dateObj.getFullYear() === currentYear && dateObj.getMonth() === currentMonth;
  }).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-display text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Calendário de Atividades
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-450">
            Acompanhe a constância de tarefas concluídas por dia através do mapa de bolinhas.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-indigo-50/40 dark:bg-indigo-950/20 px-4 py-2.5 rounded-xl border border-indigo-100/40 dark:border-indigo-900/10">
          <Sparkles className="w-4 h-4 text-indigo-550 dark:text-indigo-400 animate-pulse" />
          <div className="text-xs leading-none">
            <span className="block font-bold text-slate-700 dark:text-slate-300">
              Concluídas em {monthNames[currentMonth]}
            </span>
            <span className="block text-lg font-extrabold text-indigo-650 dark:text-indigo-400 mt-0.5">
              {totalCompletedInCurrentMonth} {totalCompletedInCurrentMonth === 1 ? "tarefa" : "tarefas"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:col-span-12 lg:grid-cols-12 gap-6">
        {/* Left Side: Monthly Calendar Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col h-full justify-between">
          <div>
            {/* Nav Header controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm select-none font-display">
                {monthNames[currentMonth]} {currentYear}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-150 dark:border-slate-750 rounded-lg text-xs cursor-pointer inline-flex items-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="text-[10px] font-bold px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-150 dark:border-slate-750 rounded-lg cursor-pointer transition-colors"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-150 dark:border-slate-750 rounded-lg text-xs cursor-pointer inline-flex items-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of the Week Headers */}
            <div className="grid grid-cols-7 text-center py-3 select-none">
              {weekdayLabelPT.map((day, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-bold tracking-wider uppercase font-mono ${
                    idx === 0 || idx === 6
                      ? "text-slate-400 dark:text-slate-500"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Days Calendar Grid Layout */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1.5 min-h-[300px]">
              {daysGrid.map((cell, idx) => {
                // Check if Selected
                const isSelected = cell.dateStr === selectedDateStr;
                // Check if Today
                const isToday = cell.dateStr === todayStr;

                // Completed tasks on this day
                const completedOnDay = tasks.filter((t) => {
                  const dateStr = (t.updatedAt || t.createdAt || "").slice(0, 10);
                  return dateStr === cell.dateStr && t.completed && !t.archived;
                });

                // Completed task count
                const numCompleted = completedOnDay.length;

                // Active uncompleted tasks remaining on this day
                const activeOnDay = tasks.filter((t) => {
                  const dateStr = (t.updatedAt || t.createdAt || "").slice(0, 10);
                  return dateStr === cell.dateStr && !t.completed && !t.archived;
                });

                const numActive = activeOnDay.length;

                return (
                  <button
                    key={`${cell.dateStr}-${idx}`}
                    onClick={() => {
                      setSelectedDateStr(cell.dateStr);
                      // Update year/month if clicking previous/next month overflow day
                      if (cell.monthOffset !== 0) {
                        const parsedDate = new Date(cell.dateStr + "T12:00:00");
                        setCurrentYear(parsedDate.getFullYear());
                        setCurrentMonth(parsedDate.getMonth());
                      }
                    }}
                    type="button"
                    className={`relative rounded-xl p-2.5 flex flex-col justify-between items-center transition-all h-14 min-w-0 select-none cursor-pointer border ${
                      cell.monthOffset !== 0
                        ? "text-slate-350 dark:text-slate-600 bg-slate-50/20 dark:bg-slate-950/5 border-transparent opacity-40 hover:opacity-100"
                        : "text-slate-700 dark:text-slate-200"
                    } ${
                      isToday
                        ? "bg-indigo-50/70 dark:bg-indigo-950/25 border-indigo-400/70"
                        : "border-slate-100/40 dark:border-slate-850/60"
                    } ${
                      isSelected
                        ? "ring-2 ring-indigo-550 border-indigo-500 scale-102 bg-white dark:bg-slate-900 shadow-md font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {/* Day number with ring indicator if active tasks remain */}
                    <span
                      className={`text-[12px] h-5 w-5 flex items-center justify-center font-mono ${
                        isToday
                          ? "bg-indigo-650 text-white rounded-full font-bold text-[10px]"
                          : isSelected
                          ? "text-indigo-650 dark:text-indigo-400 font-extrabold scale-110"
                          : numActive > 0
                          ? "font-semibold text-indigo-500"
                          : ""
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Quantity completed row of dots "bolinhas indicando tarefas concluídas" */}
                    <div className="flex justify-center items-center gap-0.5 h-2 w-full overflow-hidden">
                      {numCompleted > 0 &&
                        completedOnDay.slice(0, 4).map((t, dotIdx) => (
                          <div
                            key={t.id}
                            title={`${t.title} [${t.category}]`}
                            className={`w-1.5 h-1.5 rounded-full ${getCategoryDotClass(
                              t.category
                            )} shrink-0`}
                          />
                        ))}
                      
                      {/* Plus sign indicator for high volume days */}
                      {numCompleted > 4 && (
                        <span className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                          +
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color legend guide */}
          <div className="flex flex-wrap items-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 gap-x-4 gap-y-1 text-[10px] text-slate-450 dark:text-slate-400 select-none">
            <span className="font-bold uppercase tracking-wider text-[9px] mr-1 block">Legenda:</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Trabalho</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Estudo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Pessoal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Saúde</span>
            </div>
            <div className="flex items-center gap-1 flex-1 min-w-[50px] justify-end">
              <div className="w-1.5 h-1.5 rounded-full animate-ping bg-indigo-550 absolute inline-flex opacity-75" />
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-650" />
              <span className="ml-1 font-semibold text-[9px]">Hoje</span>
            </div>
          </div>
        </div>

        {/* Right Side: Day Details & Task List Context Panel */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              {/* Selected date formatted title */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Dia Selecionado
                </span>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm font-display mt-0.5">
                  {new Date(selectedDateStr + "T12:00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h4>
              </div>

              {/* Basic Stats row */}
              <div className="grid grid-cols-2 gap-3 mb-4 select-none">
                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100/50 dark:border-slate-850 p-2.5 rounded-xl text-center">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                    Concluídas
                  </span>
                  <span className="block text-lg font-extrabold text-emerald-600 dark:text-emerald-450 mt-0.5">
                    {completedCountForDay}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100/50 dark:border-slate-850 p-2.5 rounded-xl text-center">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                    Fila Ativa
                  </span>
                  <span className="block text-lg font-extrabold text-indigo-550 dark:text-indigo-400 mt-0.5">
                    {activeCountForDay}
                  </span>
                </div>
              </div>

              {/* Interactive task listing */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {filteredTasksForSelectedSelectedDay.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <ListTodo className="w-7 h-7 text-slate-300 dark:text-slate-650 mx-auto" />
                    <p className="text-xs text-slate-400 dark:text-slate-450 italic">
                      Nenhuma tarefa registrada ou concluída neste dia.
                    </p>
                  </div>
                ) : (
                  filteredTasksForSelectedSelectedDay.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 transition-colors ${
                        task.completed
                          ? "bg-emerald-50/10 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/10"
                          : "bg-slate-50/30 dark:bg-slate-950/15 border-slate-100 dark:border-slate-850"
                      }`}
                    >
                      {/* Inline trigger complete checkbox */}
                      <button
                        onClick={() => onToggleComplete(task.id)}
                        type="button"
                        className="mt-0.5 shrink-0 focus:outline-none cursor-pointer group"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950 transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-600 group-hover:border-indigo-400 transition-colors" />
                        )}
                      </button>

                      {/* Title & metadata */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`block text-xs font-semibold truncate leading-none ${
                            task.completed
                              ? "text-slate-400 dark:text-slate-500 line-through"
                              : "text-slate-750 dark:text-slate-200"
                          }`}
                        >
                          {task.title}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">
                            {task.category}
                          </span>
                          <span
                            className={`text-[8px] font-semibold px-1 rounded font-mono ${getPriorityBadgeColors(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom transition actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                onClick={handleViewInHistory}
                disabled={filteredTasksForSelectedSelectedDay.length === 0}
                type="button"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-650 hover:bg-indigo-550 hover:shadow-xs disabled:opacity-40 disabled:hover:bg-indigo-650 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <span>Explorar no Histórico Filtrado</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
