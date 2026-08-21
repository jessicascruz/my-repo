import React, { useState, useEffect } from "react";
import { Lightbulb, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";

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

  // Determine current tier
  let currentTips = NO_TASKS_TIPS;
  let statusLabel = "Nenhuma Atividade";
  let statusColor = "text-slate-500 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800";
  let statusIcon = <AlertCircle className="w-3.5 h-3.5" />;
  let progressColor = "bg-slate-300 dark:bg-slate-700";

  if (totalCount > 0) {
    if (completionRate < 35) {
      currentTips = LOW_COMPLETION_TIPS;
      statusLabel = "Foco Inicial";
      statusColor = "text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40";
      statusIcon = <AlertCircle className="w-3.5 h-3.5" />;
      progressColor = "bg-amber-500";
    } else if (completionRate < 75) {
      currentTips = MEDIUM_COMPLETION_TIPS;
      statusLabel = "Tração Saudável";
      statusColor = "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40";
      statusIcon = <TrendingUp className="w-3.5 h-3.5" />;
      progressColor = "bg-indigo-650 dark:bg-indigo-500";
    } else {
      currentTips = HIGH_COMPLETION_TIPS;
      statusLabel = "Super Produtivo";
      statusColor = "text-emerald-700 dark:text-emerald-400 bg-emerald-50/55 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-950/50";
      statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
      progressColor = "bg-emerald-500";
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
    <div
      id="dicas-hoje-container"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs transition-all relative overflow-hidden"
    >
      {/* Decorative ambient subtle lightbulb backdrop glow for nice mood */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar inside Card */}
      <div className="flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-50 dark:border-slate-900">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Lightbulb className="w-4 h-4 animate-pulse [animation-duration:3s]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm font-display flex items-center gap-1.5">
              Dicas de Hoje
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 hidden sm:block" />
            </h3>
          </div>
        </div>

        {/* Action Controls and Status Badges */}
        <div className="flex items-center space-x-2">
          {/* Completion tier badge */}
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusColor}`}>
            {statusIcon}
            <span>{statusLabel}</span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-50/50 dark:bg-slate-950/30">
            <button
              onClick={handlePrev}
              title="Dica Anterior"
              type="button"
              className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShuffle}
              title="Outra sugestão"
              type="button"
              className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            <button
              onClick={handleNext}
              title="Próxima Dica"
              type="button"
              className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tip Text Area with elegant transitions */}
      <div className="min-h-[52px] flex flex-col justify-center relative px-1 py-0.5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentTip?.id || "empty"}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-2"
          >
            {currentTip && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono tracking-wider">
                    {currentTip.tag}
                  </span>
                  {totalCount > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Progresso diário: {Math.round(completionRate)}%
                    </span>
                  )}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                  "{currentTip.text}"
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mini stateful progression bar at bottom */}
      {totalCount > 0 && (
        <div className="mt-3.5">
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`h-full rounded-full ${progressColor}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
