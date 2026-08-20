import React, { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const TIPS = [
  "Experimente a técnica Pomodoro: 25 minutos de foco total seguidos por 5 de pausa.",
  "Divida tarefas complexas em pequenas subtarefas acionáveis.",
  "Identifique a tarefa mais difícil e realize-a logo no início do dia.",
  "Mantenha seu espaço de trabalho organizado para uma mente organizada.",
  "Reveja sua lista de tarefas ao final do dia para planejar o amanhã."
];

export const ProductivityTip: React.FC = () => {
  const [tip, setTip] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastShown = localStorage.getItem("productivity_tip_date");

    if (lastShown !== today) {
      const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
      setTip(randomTip);
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("productivity_tip_date", today);
    setIsVisible(false);
  };

  if (!isVisible || !tip) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex items-start gap-3"
      >
        <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Dica de Produtividade do Dia</h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">{tip}</p>
        </div>
        <button onClick={dismiss} className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
