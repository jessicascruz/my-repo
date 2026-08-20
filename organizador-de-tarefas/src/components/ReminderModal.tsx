import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Clock, Check, X, BellOff } from "lucide-react";
import { Task } from "../types";

interface ReminderModalProps {
  activeReminders: Task[];
  onDismiss: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string, minutes: number) => void;
}

export function ReminderModal({
  activeReminders,
  onDismiss,
  onComplete,
  onSnooze,
}: ReminderModalProps) {
  const [currentReminder, setCurrentReminder] = useState<Task | null>(null);

  useEffect(() => {
    if (activeReminders.length > 0) {
      setCurrentReminder(activeReminders[0]);
      // Play a subtle notification audio alert
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);

        // Second beep
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(1046.5, audioContext.currentTime); // C6 note
          gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
          osc2.start();
          osc2.stop(audioContext.currentTime + 0.3);
        }, 200);
      } catch (e) {
        console.log("Audio notification omitted due to browser autoplay policies.");
      }
    } else {
      setCurrentReminder(null);
    }
  }, [activeReminders]);

  if (!currentReminder) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-100 dark:border-rose-950/40 max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-rose-500 p-6 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg animate-bounce">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display">Lembrete Ativo!</h3>
                <p className="text-xs text-rose-100">Horário agendado chegou</p>
              </div>
            </div>
            <span className="text-xl font-mono bg-rose-600/40 px-3 py-1 rounded-md">
              {currentReminder.reminderTime}
            </span>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-6">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-855 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {currentReminder.category}
              </span>
              <h4 className="mt-3 text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {currentReminder.title}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center">
                <Clock className="w-4 h-4 mr-1 text-slate-400" /> Prioridade:{" "}
                <span
                  className={`ml-1 font-semibold ${
                    currentReminder.priority === "Alta"
                      ? "text-red-500"
                      : currentReminder.priority === "Média"
                      ? "text-amber-500"
                      : "text-blue-500"
                  }`}
                >
                  {currentReminder.priority}
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => onComplete(currentReminder.id)}
                className="flex items-center justify-center px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4 mr-1.5" /> Concluir Tarefa
              </button>
              <button
                onClick={() => onSnooze(currentReminder.id, 5)}
                className="flex items-center justify-center px-4 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-sm"
              >
                <Clock className="w-4 h-4 mr-1.5" /> Adiar 5 min
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSnooze(currentReminder.id, 15)}
                className="flex items-center justify-center px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Adiar 15 min
              </button>
              <button
                onClick={() => onDismiss(currentReminder.id)}
                className="flex items-center justify-center px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 text-rose-600 dark:text-rose-450 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <BellOff className="w-3.5 h-3.5 mr-1" /> Silenciar hoje
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
