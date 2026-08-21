import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Category, Priority, Task } from "../types";
import * as ui from "../lib/ui";

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
    <form id="manual-task-form" onSubmit={handleSubmit} className={`${ui.superficie} p-5`}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className={ui.displayMd}>Nova tarefa</h2>
        <kbd className={`${ui.monoRot} ${ui.fraco}`}>Ctrl + N</kbd>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`${ui.rotulo} mb-1`} htmlFor="new-task-title-input">
            título
          </label>
          <input
            id="new-task-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: pagar a conta de energia"
            className={ui.campo}
          />
        </div>

        <div>
          <label className={`${ui.rotulo} mb-1`} htmlFor="new-task-notes">
            descrição
          </label>
          <textarea
            id="new-task-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional: detalhes, metas, referências."
            rows={2}
            className={`${ui.campo} resize-none`}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={`${ui.rotulo} mb-1`} htmlFor="new-task-category">
              categoria
            </label>
            <select
              id="new-task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={ui.campo}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`${ui.rotulo} mb-1`} htmlFor="new-task-priority">
              prioridade
            </label>
            <select
              id="new-task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={ui.campo}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={`${ui.rotulo} mb-1`} htmlFor="new-task-tag">
            tags — Enter ou vírgula cadastra
          </label>
          <input
            id="new-task-tag"
            type="text"
            value={tagInput}
            onChange={(e) => {
              const val = e.target.value;
              if (val.endsWith(",")) {
                const limpa = val.slice(0, -1).trim();
                if (limpa && !tags.includes(limpa)) setTags([...tags, limpa]);
                setTagInput("");
              } else {
                setTagInput(val);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTag(e);
            }}
            placeholder="Opcional"
            className={ui.campo}
          />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tg, idx) => (
                <span key={tg} className={ui.chip}>
                  #{tg}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    aria-label={`Remover tag ${tg}`}
                    className={`cursor-pointer hover:text-gravando dark:hover:text-gravando-clara ${ui.foco}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-linha pt-3 dark:border-tinta-linha">
          <div className="flex flex-wrap items-center gap-3">
            <label className={`flex cursor-pointer items-center gap-2 ${ui.corpoSm}`}>
              <input
                type="checkbox"
                checked={hasReminder}
                onChange={(e) => setHasReminder(e.target.checked)}
                className={`h-4 w-4 accent-fita ${ui.foco}`}
              />
              <span>Lembrete</span>
            </label>
            {hasReminder && (
              <input
                type="time"
                aria-label="Horário do lembrete"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className={`${ui.campo} ${ui.monoNum} w-auto`}
              />
            )}
            <button type="button" onClick={handleQuickReminder} className={ui.btnFantasma}>
              Daqui a 1 hora
            </button>
          </div>

          {hasReminder && (
            <div>
              <span className={`${ui.rotulo} mb-1`}>dias de repetição</span>
              <div className="flex flex-wrap gap-1">
                {WEEK_DAYS.map((dia) => {
                  const marcado = reminderDays.includes(dia.value);
                  return (
                    <button
                      key={dia.value}
                      type="button"
                      aria-pressed={marcado}
                      aria-label={dia.fullName}
                      onClick={() =>
                        setReminderDays((prev) =>
                          prev.includes(dia.value)
                            ? prev.filter((d) => d !== dia.value)
                            : [...prev, dia.value]
                        )
                      }
                      className={`h-8 w-8 cursor-pointer rounded-pauta border font-mono text-[12px] ${ui.foco} ${
                        marcado
                          ? "border-fita bg-fita text-pauta-alta dark:border-fita-clara dark:bg-fita-clara dark:text-tinta"
                          : "border-linha dark:border-tinta-linha"
                      }`}
                    >
                      {dia.label}
                    </button>
                  );
                })}
              </div>
              <p className={`mt-1 ${ui.corpoSm} ${ui.suave}`}>
                {reminderDays.length === 0 ? "Todos os dias." : "Só nos dias marcados."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-linha pt-3 dark:border-tinta-linha">
          <label className={`flex cursor-pointer items-center gap-2 ${ui.corpoSm}`}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className={`h-4 w-4 accent-fita ${ui.foco}`}
            />
            <span>Recorrente</span>
          </label>
          {isRecurring && (
            <select
              aria-label="Frequência da recorrência"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as any)}
              className={`${ui.campo} w-auto`}
            >
              <option value="diario">Diário</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
            </select>
          )}
        </div>

        <button type="submit" className={`${ui.btnPrimario} w-full`}>
          <Plus className="h-4 w-4" />
          Salvar tarefa
        </button>
      </div>
    </form>
  );
}
