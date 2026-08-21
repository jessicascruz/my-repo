import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";
import * as ui from "../lib/ui";

interface TipItem {
  id: number;
  text: string;
  tag: string;
}

const LOW_COMPLETION_TIPS: TipItem[] = [
  { id: 101, text: "Dê o primeiro passo com a tarefa mais simples. O impulso inicial facilita o restante!", tag: "Início Rápido" },
  { id: 102, text: "Tente a regra dos 2 minutos: resolva uma pequena pendência rápida para quebrar a procrastinação.", tag: "Impulso Rápido" },
  { id: 103, text: "Micro-objetivo: filtre sua fila pela prioridade 'Alta' e realize apenas uma tarefa principal agora.", tag: "Foco Crítico" },
  { id: 104, text: "Evite distrações silenciosas. Ligue o 'Não Perturbe' recém-adicionado para focar em paz.", tag: "Sem Distrações" },
  { id: 105, text: "A energia está baixa? Dedique só 15 minutos em foco constante na sua tarefa favorita.", tag: "Bloco Curto" }
];

const MEDIUM_COMPLETION_TIPS: TipItem[] = [
  { id: 201, text: "Ótimo ritmo! Você está evoluindo bem. Evite pegar novos itens até esgotar os atuais.", tag: "Consistência" },
  { id: 202, text: "Trabalhos contínuos pedem recargas. Faça um pequeno alongamento de 5 minutos antes da próxima tarefa.", tag: "Pausa Ativa" },
  { id: 203, text: "Foco Setorial: Se houver tarefas com etiquetas em comum, agrupe-as para economizar energia mental.", tag: "Agrupamento" },
  { id: 204, text: "Dica: Bloqueie notificações de chats pelos próximos 30 minutos para concluir o próximo grande bloco.", tag: "Foco Profundo" },
  { id: 205, text: "Você está quase na metade da sua fila de hoje! Sinta a tração e mantenha o ritmo positivo.", tag: "Determinação" }
];

const HIGH_COMPLETION_TIPS: TipItem[] = [
  { id: 301, text: "Excelente rendimento! Você entrou em estado de fluxo. Falta muito pouco para finalizar o dia.", tag: "Alta Performance" },
  { id: 302, text: "Reta final: priorize riscar as últimas tarefas pendentes para descansar livre de preocupações.", tag: "Encerramento" },
  { id: 303, text: "Comemore pequenas vitórias! Cada marcação de tarefa completa gera satisfação e reduz o estresse.", tag: "Dopamina" },
  { id: 304, text: "Momento de refinamento: revise as notas anexadas para ver se falta algum detalhe nos itens prontos.", tag: "Qualidade" },
  { id: 305, text: "Aproveite a alta clareza mental agora para planejar os três primeiros objetivos da sua manhã de amanhã.", tag: "Próximo Passo" }
];

const NO_TASKS_TIPS: TipItem[] = [
  { id: 401, text: "Sua fila de atividades está vazia! Crie alguns objetivos para organizar seu dia.", tag: "Planejamento" },
  { id: 402, text: "Use o microfone da barra de busca para falar comandos rápidos de filtragem ou buscar pendências antigas.", tag: "Acesso por Voz" },
  { id: 403, text: "Defina pelo menos três metas diárias realistas. Isso reduz a sobrecarga e foca sua intenção.", tag: "Priorização" }
];

interface DicasHojeProps {
  tasks: Task[];
}

export function DicasHoje({ tasks }: DicasHojeProps) {
  // Filter non-archived tasks to calculate daily progress
  const activeList = tasks.filter((t) => !t.archived);
  const totalCount = activeList.length;
  const completedCount = activeList.filter((t) => t.completed).length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Faixa de progresso do dia: muda o conjunto de dicas e o rótulo.
  let currentTips = NO_TASKS_TIPS;
  let statusLabel = "sem atividade";

  if (totalCount > 0) {
    if (completionRate < 35) {
      currentTips = LOW_COMPLETION_TIPS;
      statusLabel = "começando";
    } else if (completionRate < 75) {
      currentTips = MEDIUM_COMPLETION_TIPS;
      statusLabel = "em ritmo";
    } else {
      currentTips = HIGH_COMPLETION_TIPS;
      statusLabel = "quase fechando";
    }
  }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Reset index to 0 if the tips tier changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [totalCount, completionRate < 35, completionRate >= 75]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % currentTips.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + currentTips.length) % currentTips.length);
  };

  const handleShuffle = () => {
    setDirection(1);
    const availableIndices = Array.from({ length: currentTips.length }, (_, i) => i)
      .filter((i) => i !== currentIndex);
    if (availableIndices.length > 0) {
      const randomInd = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setCurrentIndex(randomInd);
    } else {
      setCurrentIndex((prev) => (prev + 1) % currentTips.length);
    }
  };

  const currentTip = currentTips[currentIndex] || currentTips[0];

  // Slide translation values
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
    }),
  };

  return (
    <div id="dicas-hoje-container" className={`${ui.superficie} p-5`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={ui.rotulo}>dica de hoje</span>
        <div className="flex items-center gap-2">
          <span className={`${ui.monoRot} ${ui.suave}`}>{statusLabel}</span>
          <span className="flex items-center">
            <button onClick={handlePrev} title="Dica anterior" type="button" className={ui.btnIcone}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={handleShuffle} title="Sortear" type="button" className={ui.btnIcone}>
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleNext} title="Próxima dica" type="button" className={ui.btnIcone}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </span>
        </div>
      </div>

      <div className="mt-2 min-h-14">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentTip?.id || "empty"}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            {currentTip && (
              <>
                <span className={`${ui.monoRot} ${ui.fraco}`}>
                  {currentTip.tag}
                  {totalCount > 0 && ` · ${Math.round(completionRate)}% do dia`}
                </span>
                <p className={`mt-1 ${ui.corpo}`}>{currentTip.text}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {totalCount > 0 && (
        <div className="mt-4 h-[3px] w-full bg-pauta-baixa dark:bg-tinta-fundo">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full bg-fita dark:bg-fita-clara"
          />
        </div>
      )}
    </div>
  );
}
