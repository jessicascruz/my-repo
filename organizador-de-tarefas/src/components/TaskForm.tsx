import React, { useState } from "react";
import { Plus, Bell, Clock, Tag, X, Zap, RefreshCw } from "lucide-react";
import { Category, Priority, Task } from "../types";
import { Tooltip } from "./Tooltip";

interface TaskFormProps {
  onAddTask: (task: Omit<Task, "id" | "completed" | "reminderTriggered" | "createdAt" | "updatedAt">) => void;
  categories: string[];
}

const PRIORITIES: Priority[] = ["Alta", "Média", "Baixa"];

const WEEK_DAYS = [
  { value: 1, label: "S", fullName: "Segunda-feira" },
  { value: 2, label: "T", fullName: "Terça-feira" },
  { value: 3, label: "Q", fullName: "Quarta-feira" },
  { value: 4, label: "Q", fullName: "Quinta-feira" },
  { value: 5, label: "S", fullName: "Sexta-feira" },
  { value: 6, label: "S", fullName: "Sábado" },
  { value: 0, label: "D", fullName: "Domingo" },
];

export function TaskForm({ onAddTask, categories }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<Category>("Geral");
  const [priority, setPriority] = useState<Priority>("Média");
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("");
  const [reminderDays, setReminderDays] = useState<number[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<"diario" | "semanal" | "mensal">("diario");

  const handleAddTag = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const cleaned = tagInput.trim().replace(/,$/, "");
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleQuickReminder = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    setHasReminder(true);
    setReminderTime(timeString);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      notes: notes.trim() || undefined,
      category: categories.includes(category) ? category : (categories[0] || "Geral"),
      priority,
      reminderTime: hasReminder && reminderTime ? reminderTime : null,
      reminderDays: hasReminder && reminderTime && reminderDays.length > 0 ? reminderDays : undefined,
      tags: tags.length > 0 ? tags : undefined,
      isRecurring,
      recurrence: isRecurring ? recurrence : null,
    });

    // Reset Form
    setTitle("");
    setNotes("");
    setCategory("Geral");
    setPriority("Média");
    setHasReminder(false);
    setReminderTime("");
    setTags([]);
    setTagInput("");
    setReminderDays([]);
    setIsRecurring(false);
    setRecurrence("diario");
  };

  return (
    <form
      id="manual-task-form"
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5"
    >
      <h3 className="font-bold text-slate-800 dark:text-slate-100 font-display text-base mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <Plus className="w-5 h-5 text-indigo-500 mr-2" />
          Adicionar Tarefa Manualmente
        </span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60 rounded-md">
          Ctrl+N
        </kbd>
      </h3>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Título da Tarefa
          </label>
          <input
            id="new-task-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Pagar conta de energia"
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Notas / Descrição (Opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações ou detalhes extras sobre a atividade..."
            rows={2.5}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-y"
          />
        </div>

        {/* Row 1: Category & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Categoria
            </label>
            <select
              value={categories.includes(category) ? category : "Geral"}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
            >
              {PRIORITIES.map((prio) => (
                <option key={prio} value={prio}>
                  {prio}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags / Labels */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            Tags / Marcadores (Opcional)
          </label>
          <div className="flex border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl px-3 py-1.5 items-center focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val.endsWith(",")) {
                  const cleaned = val.slice(0, -1).trim();
                  if (cleaned && !tags.includes(cleaned)) {
                    setTags([...tags, cleaned]);
                  }
                  setTagInput("");
                } else {
                  setTagInput(val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Digite e tecle Enter ou vírgula..."
              className="w-full text-xs bg-transparent border-none p-1 focus:outline-none focus:ring-0 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            {tagInput.trim() && (
              <button
                type="button"
                onClick={handleAddTag}
                className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-650 font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer select-none shrink-0"
              >
                Adicionar
              </button>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tg) => (
                <span
                  key={tg}
                  className="inline-flex items-center text-[10px] font-bold bg-indigo-50/70 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 rounded-full px-2 py-0.5"
                >
                  #{tg}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((tKey) => tKey !== tg))}
                    className="ml-1 text-indigo-400 hover:text-indigo-650 dark:hover:text-indigo-200 transition-colors focus:outline-none"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reminder config */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <label className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasReminder}
                onChange={(e) => setHasReminder(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Bell className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Configurar Horário / Lembrete
              </span>
            </label>

            <button
              type="button"
              onClick={handleQuickReminder}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all cursor-pointer"
            >
              <Zap className="w-2.5 h-2.5" />
              Lembrete Rápido (+1h)
            </button>
          </div>

          {hasReminder && (
            <div className="mt-2 pl-6 animate-fadeIn space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  required={hasReminder}
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                />
                <span className="text-xs text-slate-400">
                  (Notificar às {reminderTime || "--:--"})
                </span>
              </div>

              {/* Specific days option */}
              <div className="space-y-1.5 pt-1">
                <span className="block text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                  Repetir nos dias:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {WEEK_DAYS.map((day) => {
                    const isSelected = reminderDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          setReminderDays((prev) =>
                            prev.includes(day.value)
                              ? prev.filter((d) => d !== day.value)
                              : [...prev, day.value]
                          );
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer select-none border ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                        title={day.fullName}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 italic mt-1 font-mono">
                  {reminderDays.length === 0
                    ? "✓ Todos os dias"
                    : `✓ Apenas: ${reminderDays
                        .map((dayVal) => WEEK_DAYS.find((d) => d.value === dayVal)?.fullName.split("-")[0])
                        .join(", ")}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recurrence config */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2.5 text-slate-600 dark:text-slate-300 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <RefreshCw className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Definir como Recorrente
              </span>
            </label>

            {isRecurring && (
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
              </select>
            )}
          </div>
        </div>

        {/* Submit */}
        <Tooltip
          content="Cria a tarefa informada manualmente e adiciona à Fila de Atividades."
          shortcut={["Enter"]}
          position="top"
          className="w-full"
        >
          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer shadow-sm text-center"
          >
            Criar Tarefa
          </button>
        </Tooltip>
      </div>
    </form>
  );
}
