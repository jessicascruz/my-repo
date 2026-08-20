import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Timer, ClipboardCheck, ArrowRight, RefreshCw, Zap, Lightbulb } from "lucide-react";

interface Tip {
  title: string;
  methodology: "Pomodoro" | "GTD" | "Eisenhower" | "Time Blocking" | "Geral";
  text: string;
}

const PRODUCTIVITY_TIPS: Tip[] = [
  {
    title: "Esvazie sua mente",
    methodology: "GTD",
    text: "Tire tudo da cabeça e registre imediatamente. Seu cérebro serve para ter ideias, não para armazená-las.",
  },
  {
    title: "Regra dos Dois Minutos",
    methodology: "GTD",
    text: "Se uma nova tarefa ou ação pendente leva menos de 2 minutos para ser concluída, faça-a imediatamente sem adiar.",
  },
  {
    title: "O Primeiro Pomodoro",
    methodology: "Pomodoro",
    text: "Comece com 25 minutos de foco total e sem interrupções, seguido por uma pausa restauradora de 5 minutos.",
  },
  {
    title: "Ciclo de Foco Completo",
    methodology: "Pomodoro",
    text: "A cada quatro blocos Pomodoro realizados, recompense-se com uma pausa longa de 15 a 30 minutos.",
  },
  {
    title: "Matriz de Eisenhower",
    methodology: "Eisenhower",
    text: "Separe o urgente do importante. Foque nas tarefas importantes que não são urgentes para evitar o estresse de última hora.",
  },
  {
    title: "Defina a Próxima Ação",
    methodology: "GTD",
    text: "Para cada projeto ou meta, determine qual é o primeiríssimo passo físico concreto. Isso quebra a inércia da procrastinação.",
  },
  {
    title: "Time Blocking",
    methodology: "Time Blocking",
    text: "Agende blocos de tempo fixos e exclusivos na sua agenda para focar em tarefas de alta concentração.",
  },
  {
    title: "Engula o Sapo (Eat the Frog)",
    methodology: "Geral",
    text: "Realize a tarefa mais complexa e que exige mais energia logo no início do seu dia. O restante fluirá com leveza.",
  },
  {
    title: "Revisão Semanal",
    methodology: "GTD",
    text: "Reserve um tempo no fim de semana ou na sexta para revisar todas as listas de projetos, limpar pendências e planejar o próximo ciclo.",
  },
  {
    title: "Regra do 1-3-5",
    methodology: "Geral",
    text: "Defina metas diárias claras: 1 grande objetivo, 3 tarefas médias e 5 pequenas para manter um dia equilibrado e produtivo.",
  }
];

export function EmptyStateProductivityTip() {
  const [currentTip, setCurrentTip] = useState<Tip>(PRODUCTIVITY_TIPS[0]);
  const [animateKey, setAnimateKey] = useState(0);

  const selectRandomTip = () => {
    const availableTips = PRODUCTIVITY_TIPS.filter(t => t.text !== currentTip.text);
    const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
    setCurrentTip(randomTip || PRODUCTIVITY_TIPS[0]);
    setAnimateKey(prev => prev + 1);
  };

  useEffect(() => {
    // Select random on mount
    const randomTip = PRODUCTIVITY_TIPS[Math.floor(Math.random() * PRODUCTIVITY_TIPS.length)];
    setCurrentTip(randomTip);
  }, []);

  const getMethodologyBadgeColor = (methodology: string) => {
    switch (methodology) {
      case "Pomodoro":
        return "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50";
      case "GTD":
        return "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50";
      case "Eisenhower":
        return "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50";
      case "Time Blocking":
        return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const getMethodologyIcon = (methodology: string) => {
    switch (methodology) {
      case "Pomodoro":
        return <Timer className="w-4 h-4 text-rose-500" />;
      case "GTD":
        return <ClipboardCheck className="w-4 h-4 text-indigo-500" />;
      case "Eisenhower":
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-slate-50/55 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto my-6 shadow-sm">
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-md animate-pulse duration-3000" />
        <div className="relative p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm text-indigo-500">
          <Sparkles className="w-6 h-6 animate-bounce [animation-duration:4s]" />
        </div>
      </div>

      <div className="space-y-1.5 mb-2">
        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Parabéns! Fila Organizada</span>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base font-display">
          Você não tem tarefas pendentes hoje!
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
          Que tal aproveitar o momento de clareza mental para se inspirar com uma dica de produtividade?
        </p>
      </div>

      <div className="w-full my-4 border-t border-dashed border-slate-200 dark:border-slate-800" />

      <AnimatePresence mode="wait">
        <motion.div
          key={animateKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full space-y-3.5"
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getMethodologyBadgeColor(currentTip.methodology)}`}>
              {getMethodologyIcon(currentTip.methodology)}
              <span>{currentTip.methodology}</span>
            </span>
          </div>

          <div className="space-y-1 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-xs max-w-md mx-auto">
            <h4 className="font-bold text-sm text-slate-750 dark:text-slate-250 flex items-center justify-center gap-1.5">
              <span>{currentTip.title}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-350 italic leading-relaxed">
              "{currentTip.text}"
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={selectRandomTip}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Outra Dica</span>
        </button>
      </div>
    </div>
  );
}
