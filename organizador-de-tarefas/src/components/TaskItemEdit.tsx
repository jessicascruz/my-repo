import { useState } from "react";
import { Save, Tag, X } from "lucide-react";
import { Category, Priority, Task } from "../types";
import * as ui from "../lib/ui";

interface TaskItemEditProps {
  task: Task;
  categories: string[];
  onUpdate: (id: string, updatedFields: Partial<Task>) => void;
  onClose: () => void;
}

const DIAS_DA_SEMANA = [
  { value: 1, label: "S", fullName: "Segunda-feira" },
  { value: 2, label: "T", fullName: "Terça-feira" },
  { value: 3, label: "Q", fullName: "Quarta-feira" },
  { value: 4, label: "Q", fullName: "Quinta-feira" },
  { value: 5, label: "S", fullName: "Sexta-feira" },
  { value: 6, label: "S", fullName: "Sábado" },
  { value: 0, label: "D", fullName: "Domingo" },
];

/**
 * Formulário de edição de tarefa, aberto no lugar da linha. Todo o estado de
 * rascunho mora aqui: enquanto o formulário está fechado, ele não existe.
 */
export function TaskItemEdit({ task, categories, onUpdate, onClose }: TaskItemEditProps) {
  const [titulo, setTitulo] = useState(task.title);
  const [categoria, setCategoria] = useState<Category>(task.category);
  const [prioridade, setPrioridade] = useState<Priority>(task.priority);
  const [temLembrete, setTemLembrete] = useState(!!task.reminderTime);
  const [horario, setHorario] = useState(task.reminderTime || "");
  const [dias, setDias] = useState<number[]>(task.reminderDays || []);
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [tagEmDigitacao, setTagEmDigitacao] = useState("");
  const [recorrente, setRecorrente] = useState(!!task.isRecurring);
  const [recorrencia, setRecorrencia] = useState<"diario" | "semanal" | "mensal">(
    task.recurrence || "diario"
  );

  const adicionarTag = (bruta: string) => {
    const limpa = bruta.trim();
    if (limpa && !tags.includes(limpa)) setTags([...tags, limpa]);
    setTagEmDigitacao("");
  };

  const salvar = () => {
    if (!titulo.trim()) return;
    onUpdate(task.id, {
      title: titulo.trim(),
      category: categoria,
      priority: prioridade,
      reminderTime: temLembrete && horario ? horario : null,
      reminderDays: temLembrete && horario && dias.length > 0 ? dias : undefined,
      tags,
      isRecurring: recorrente,
      recurrence: recorrente ? recorrencia : null,
      updatedAt: new Date().toISOString(),
      reminderTriggered:
        temLembrete && horario === task.reminderTime ? task.reminderTriggered : false,
    });
    onClose();
  };

  return (
    <div
      className="space-y-4"
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          salvar();
        }
      }}
    >
      <div>
        <label className={`${ui.rotulo} mb-1`} htmlFor={`titulo-${task.id}`}>
          título
        </label>
        <input
          id={`titulo-${task.id}`}
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className={ui.campo}
          autoFocus
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={`${ui.rotulo} mb-1`} htmlFor={`categoria-${task.id}`}>
            categoria
          </label>
          <select
            id={`categoria-${task.id}`}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Category)}
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
          <label className={`${ui.rotulo} mb-1`} htmlFor={`prioridade-${task.id}`}>
            prioridade
          </label>
          <select
            id={`prioridade-${task.id}`}
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Priority)}
            className={ui.campo}
          >
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </div>
      </div>

      <div className="border-t border-linha pt-3 dark:border-tinta-linha">
        <label className={`${ui.rotulo} mb-1 flex items-center gap-1.5`} htmlFor={`tag-${task.id}`}>
          <Tag className="h-3.5 w-3.5" />
          tags — Enter ou vírgula para cadastrar
        </label>
        <input
          id={`tag-${task.id}`}
          type="text"
          value={tagEmDigitacao}
          onChange={(e) => {
            const val = e.target.value;
            if (val.endsWith(",")) adicionarTag(val.slice(0, -1));
            else setTagEmDigitacao(val);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionarTag(tagEmDigitacao);
            }
          }}
          placeholder="Nova tag"
          className={ui.campo}
        />
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tg) => (
              <span key={tg} className={ui.chip}>
                #{tg}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((t) => t !== tg))}
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
              checked={temLembrete}
              onChange={(e) => setTemLembrete(e.target.checked)}
              className={`h-4 w-4 accent-fita ${ui.foco}`}
            />
            <span>Lembrete</span>
          </label>
          {temLembrete && (
            <input
              type="time"
              aria-label="Horário do lembrete"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className={`${ui.campo} ${ui.monoNum} w-auto`}
            />
          )}
        </div>

        {temLembrete && (
          <div className="space-y-1.5">
            <span className={ui.rotulo}>dias de repetição</span>
            <div className="flex flex-wrap gap-1">
              {DIAS_DA_SEMANA.map((dia) => {
                const marcado = dias.includes(dia.value);
                return (
                  <button
                    key={dia.value}
                    type="button"
                    aria-pressed={marcado}
                    onClick={() =>
                      setDias((prev) =>
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
                    title={dia.fullName}
                  >
                    {dia.label}
                  </button>
                );
              })}
            </div>
            <p className={`${ui.corpoSm} ${ui.suave}`}>
              {dias.length === 0
                ? "Todos os dias."
                : `Só ${dias
                    .map((v) => DIAS_DA_SEMANA.find((d) => d.value === v)?.fullName.split("-")[0])
                    .join(", ")}.`}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-linha pt-3 dark:border-tinta-linha">
        <label className={`flex cursor-pointer items-center gap-2 ${ui.corpoSm}`}>
          <input
            type="checkbox"
            checked={recorrente}
            onChange={(e) => setRecorrente(e.target.checked)}
            className={`h-4 w-4 accent-fita ${ui.foco}`}
          />
          <span>Recorrente</span>
        </label>
        {recorrente && (
          <select
            aria-label="Frequência da recorrência"
            value={recorrencia}
            onChange={(e) => setRecorrencia(e.target.value as any)}
            className={`${ui.campo} w-auto`}
          >
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
          </select>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onClose} className={ui.btnFantasma}>
          Cancelar
        </button>
        <button onClick={salvar} className={ui.btnPrimario} title="Ctrl + Enter salva">
          <Save className="h-4 w-4" />
          Salvar tarefa
        </button>
      </div>
    </div>
  );
}
