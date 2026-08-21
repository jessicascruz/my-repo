import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw } from "lucide-react";
import * as ui from "../lib/ui";

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

  return (
    <div className={`${ui.superficie} p-6`}>
      <span className={ui.rotulo}>fila vazia</span>
      <h3 className={`${ui.displayMd} mt-1`}>Nada pendente hoje.</h3>
      <p className={`mt-1 ${ui.corpoSm} ${ui.suave}`}>
        Toque em gravar e fale o seu dia, ou leia uma ideia de método enquanto pensa.
      </p>

      <div className="mt-5 border-l-[3px] border-l-dial pl-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={animateKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <span className={`${ui.monoRot} ${ui.fraco}`}>{currentTip.methodology}</span>
            <p className={`mt-0.5 ${ui.corpo} font-medium`}>{currentTip.title}</p>
            <p className={`mt-0.5 ${ui.corpoSm} ${ui.suave}`}>{currentTip.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={selectRandomTip}
        className={`${ui.monoRot} ${ui.suave} mt-4 flex cursor-pointer items-center gap-1.5 rounded-pauta px-2 py-1 hover:bg-pauta-baixa dark:hover:bg-tinta-linha ${ui.foco}`}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        outra ideia
      </button>
    </div>
  );
}
