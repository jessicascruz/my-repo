import React from "react";
import { Task } from "../types";
import { fundoPrioridade } from "../lib/ui";
import * as ui from "../lib/ui";

interface SugestaoTarefaProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onToggleFocus: (id: string) => void;
  focusedTaskId: string | null;
}

export function SugestaoTarefa({
  tasks,
  onToggleComplete,
  onToggleFocus,
  focusedTaskId,
}: SugestaoTarefaProps) {
  // 1. Filter only pending/active (not completed and not archived) tasks
  const pendingTasks = tasks.filter((t) => !t.completed && !t.archived);

  // If there are no pending tasks, we don't display anything to keep layout pristine
  if (pendingTasks.length === 0) return null;

  // 2. Count frequency of categories in pending tasks
  const categoryCounts: Record<string, number> = {};
  pendingTasks.forEach((t) => {
    const cat = t.category || "Sem Categoria";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Identify the most frequent category
  let mostFrequentCategory = "";
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentCategory = cat;
    }
  });

  // 3. For each pending task, calculate a heuristic score
  // Priority weights: Alta = 30, Média = 15, Baixa = 5
  // Category frequency weight: if matching mostFrequentCategory, add 10 points
  const tasksWithScores = pendingTasks.map((task) => {
    let score = 0;

    // Priority score
    if (task.priority === "Alta") score += 30;
    else if (task.priority === "Média") score += 15;
    else if (task.priority === "Baixa") score += 5;

    // Category frequency score
    if (task.category === mostFrequentCategory) {
      score += 10;
    }

    return { task, score };
  });

  // Sort by score descending (highest score first)
  tasksWithScores.sort((a, b) => b.score - a.score);

  const bestMatch = tasksWithScores[0];
  if (!bestMatch) return null;

  const { task, score } = bestMatch;
  const isCurrentlyFocused = focusedTaskId === task.id;

  return (
    <div
      id="sugestao-tarefa-card"
      className={`${ui.superficie} relative overflow-hidden p-4`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${
          isCurrentlyFocused ? "bg-dial" : fundoPrioridade[task.priority]
        }`}
      />

      <div className="pl-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className={ui.rotulo}>a próxima</span>
          <span className={`${ui.monoRot} ${ui.fraco}`}>
            {mostFrequentCategory} · {score} pts
          </span>
        </div>

        <h3 className={`${ui.displayMd} mt-1 break-words`}>{task.title}</h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {task.category && <span className={ui.chip}>{task.category}</span>}
          <span className={ui.chip}>
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${fundoPrioridade[task.priority]}`}
            />
            {task.priority}
          </span>
          {task.subtasks && task.subtasks.length > 0 && (
            <span className={`${ui.monoNum} ${ui.fraco}`}>
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtarefas
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={() => onToggleFocus(task.id)} type="button" className={ui.btnPrimario}>
            {isCurrentlyFocused ? "Sair do foco" : "Focar nesta"}
          </button>
          <button
            onClick={() => onToggleComplete(task.id)}
            title="Concluir esta tarefa"
            type="button"
            className={ui.btnFantasma}
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
