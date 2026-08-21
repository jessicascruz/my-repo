import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, ArrowRight } from "lucide-react";
import { Task, Priority } from "../types";
import { fundoPrioridade } from "../lib/ui";
import * as ui from "../lib/ui";

/** Anel vazado para concluída, igual à pauta. */
const BORDA_PONTO: Record<Priority, string> = {
  Alta: "border-gravando",
  Média: "border-dial",
  Baixa: "border-fita dark:border-fita-clara",
};

interface CalendarViewProps {
  tasks: Task[];
  categories: string[];
  onToggleComplete: (id: string) => void;
  /** Abre o dia escolhido no histórico do arquivo. */
  onOpenDate: (date: string) => void;
}

export function CalendarView({
  tasks,
  categories,
  onToggleComplete,
  onOpenDate,
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
    onOpenDate(selectedDateStr);
  };

  const totalCompletedInCurrentMonth = tasks.filter((t) => {
    if (!t.completed || t.archived) return false;
    const dateObj = new Date(t.updatedAt || t.createdAt || "");
    return dateObj.getFullYear() === currentYear && dateObj.getMonth() === currentMonth;
  }).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={ui.displayLg}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <p className={`${ui.corpoSm} ${ui.suave}`}>
            {totalCompletedInCurrentMonth}{" "}
            {totalCompletedInCurrentMonth === 1 ? "tarefa concluída" : "tarefas concluídas"} no mês.
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className={ui.btnIcone}
            title="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleJumpToToday} className={ui.btnFantasma}>
            Hoje
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className={ui.btnIcone}
            title="Mês seguinte"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Grade do mês */}
        <div className={`${ui.superficie} p-4 lg:col-span-7`}>
          <div className="grid grid-cols-7 pb-2 text-center">
            {weekdayLabelPT.map((day, idx) => (
              <span key={idx} className={`${ui.monoRot} ${ui.fraco}`}>
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === todayStr;
              const doDia = tasks.filter(
                (t) => (t.updatedAt || t.createdAt || "").slice(0, 10) === cell.dateStr && !t.archived
              );
              const concluidas = doDia.filter((t) => t.completed);
              const pendentes = doDia.filter((t) => !t.completed);

              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  type="button"
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedDateStr(cell.dateStr);
                    if (cell.monthOffset !== 0) {
                      const d = new Date(cell.dateStr + "T12:00:00");
                      setCurrentYear(d.getFullYear());
                      setCurrentMonth(d.getMonth());
                    }
                  }}
                  className={`flex h-14 flex-col items-center justify-between rounded-pauta border p-1.5 cursor-pointer transition-colors ${ui.foco} ${
                    cell.monthOffset !== 0 ? "opacity-40" : ""
                  } ${
                    isSelected
                      ? "border-fita bg-pauta-baixa dark:border-fita-clara dark:bg-tinta-linha"
                      : "border-transparent hover:bg-pauta-baixa dark:hover:bg-tinta-linha"
                  }`}
                >
                  <span
                    className={`${ui.monoNum} ${
                      isToday
                        ? "grid h-5 w-5 place-items-center rounded-full bg-tinta text-pauta-alta dark:bg-pauta dark:text-tinta"
                        : ""
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {/* Mesma marca de prioridade da pauta: ponto cheio pendente,
                      anel vazado concluída. */}
                  <span className="flex h-3 flex-wrap items-center justify-center gap-0.5 overflow-hidden">
                    {[...pendentes, ...concluidas].slice(0, 5).map((t) => (
                      <span
                        key={t.id}
                        title={`${t.title} — ${t.priority}`}
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          t.completed
                            ? `border ${BORDA_PONTO[t.priority]}`
                            : fundoPrioridade[t.priority]
                        }`}
                      />
                    ))}
                    {doDia.length > 5 && (
                      <span className={`${ui.monoRot} leading-none ${ui.fraco}`}>+</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-linha pt-3 dark:border-tinta-linha">
            {(["Alta", "Média", "Baixa"] as Priority[]).map((p) => (
              <span key={p} className={`flex items-center gap-1.5 ${ui.monoRot} ${ui.fraco}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${fundoPrioridade[p]}`} />
                {p}
              </span>
            ))}
            <span className={`flex items-center gap-1.5 ${ui.monoRot} ${ui.fraco}`}>
              <span className="h-1.5 w-1.5 rounded-full border border-linha dark:border-tinta-linha" />
              concluída
            </span>
          </div>
        </div>

        {/* Dia escolhido */}
        <div className={`${ui.superficie} flex flex-col p-4 lg:col-span-5`}>
          <div className="border-b border-linha pb-3 dark:border-tinta-linha">
            <span className={ui.rotulo}>dia escolhido</span>
            <h3 className={`${ui.displayMd} mt-0.5`}>
              {new Date(selectedDateStr + "T12:00:00").toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <p className={`mt-1 ${ui.monoNum} ${ui.suave}`}>
              {completedCountForDay} concluídas · {activeCountForDay} na fila
            </p>
          </div>

          <div className="mt-3 max-h-72 flex-1 space-y-1 overflow-y-auto">
            {filteredTasksForSelectedSelectedDay.length === 0 ? (
              <p className={`py-8 text-center ${ui.corpoSm} ${ui.suave}`}>
                Nada registrado neste dia.
              </p>
            ) : (
              filteredTasksForSelectedSelectedDay.map((task) => (
                <div key={task.id} className="flex items-start gap-2">
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    type="button"
                    aria-pressed={task.completed}
                    aria-label={task.title}
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-pauta cursor-pointer sm:h-7 sm:w-7 ${ui.foco}`}
                  >
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-full border-2 transition-colors ${
                        task.completed
                          ? "border-fita bg-fita text-pauta-alta dark:border-fita-clara dark:bg-fita-clara dark:text-tinta"
                          : "border-linha dark:border-tinta-linha"
                      }`}
                    >
                      {task.completed && <CheckCircle className="h-2.5 w-2.5" />}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1 py-1">
                    <span
                      className={`block ${ui.corpoSm} ${
                        task.completed ? `line-through ${ui.fraco}` : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className={`mt-0.5 flex items-center gap-1.5 ${ui.monoRot} ${ui.fraco}`}>
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${fundoPrioridade[task.priority]}`}
                      />
                      {task.category} · {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleViewInHistory}
            disabled={filteredTasksForSelectedSelectedDay.length === 0}
            type="button"
            className={`${ui.btnFantasma} mt-3 w-full`}
          >
            Ver no histórico
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
