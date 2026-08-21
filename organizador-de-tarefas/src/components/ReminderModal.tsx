import { useEffect, useState } from "react";
import { Clock, Check, BellOff } from "lucide-react";
import { Task } from "../types";
import { Modal } from "./Modal";
import { fundoPrioridade } from "../lib/ui";
import * as ui from "../lib/ui";

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
    <Modal
      aberto={!!currentReminder}
      onFechar={() => currentReminder && onDismiss(currentReminder.id)}
      titulo="Lembrete"
      descricao={`${currentReminder.reminderTime} · ${currentReminder.category}`}
      largura="sm:max-w-md"
    >
      <h3 className={`${ui.displayLg} leading-tight`}>{currentReminder.title}</h3>

      <p className={`mt-2 flex items-center gap-2 ${ui.corpoSm} ${ui.suave}`}>
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${fundoPrioridade[currentReminder.priority]}`}
        />
        prioridade {currentReminder.priority}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={() => onComplete(currentReminder.id)} className={ui.btnPrimario}>
          <Check className="h-4 w-4" />
          Concluir tarefa
        </button>
        <button onClick={() => onSnooze(currentReminder.id, 5)} className={ui.btnFantasma}>
          <Clock className="h-4 w-4" />
          Adiar 5 min
        </button>
        <button onClick={() => onSnooze(currentReminder.id, 15)} className={ui.btnFantasma}>
          Adiar 15 min
        </button>
        <button onClick={() => onDismiss(currentReminder.id)} className={ui.btnFantasma}>
          <BellOff className="h-4 w-4" />
          Silenciar hoje
        </button>
      </div>
    </Modal>
  );
}
