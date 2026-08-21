import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Settings,
  Printer,
  FileDown,
  Upload,
  Download,
  Sun,
  Moon,
  FileSpreadsheet,
  Menu,
  LogOut,
} from "lucide-react";
import { Task, Category, Priority, DndSettings, VisibleCards, Note, List } from "./types";
import * as ui from "./lib/ui";
import { AudioRecorder } from "./components/AudioRecorder";
import { TaskForm } from "./components/TaskForm";
import { TaskItem } from "./components/TaskItem";
import { TaskFilter } from "./components/TaskFilter";
import { ReminderModal } from "./components/ReminderModal";
import { CategoryManagerModal } from "./components/CategoryManagerModal";
import { SettingsModal } from "./components/SettingsModal";
import { ProgressChart } from "./components/ProgressChart";
import { DailyGoal } from "./components/DailyGoal";
import { WeeklyProgress } from "./components/WeeklyProgress";
import { CategoryPieChart } from "./components/CategoryPieChart";
import { ProductivitySummary } from "./components/ProductivitySummary";
import { DicasHoje } from "./components/DicasHoje";
import { SugestaoTarefa } from "./components/SugestaoTarefa";
import { PriorityDurationCard } from "./components/PriorityDurationCard";
import { EmptyStateProductivityTip } from "./components/EmptyStateProductivityTip";
import { CalendarView } from "./components/CalendarView";
import { ConfettiEffect } from "./components/ConfettiEffect";
import { NotesView } from "./components/NotesView";
import { Pauta } from "./components/Pauta";
import { ListView } from "./components/ListView";
import { useBackupScheduler } from "./hooks/useBackupScheduler";
import { useDataStore } from "./hooks/useDataStore";
import { getLocalDateString, getLocalDateStringFromISO } from "./lib/dateUtils";
import { Login } from "./components/Login";
import { logout } from "./lib/session";

/** Quatro lugares. Tudo que é ação vive no menu do topo, não aqui. */
const ABAS = [
  { id: "diarias", rotulo: "diárias" },
  { id: "notas", rotulo: "notas" },
  { id: "listas", rotulo: "listas" },
  { id: "arquivo", rotulo: "arquivo" },
] as const;

type Aba = (typeof ABAS)[number]["id"];

/** Dentro de "arquivo": histórico, arquivadas e calendário. */
const MODOS_ARQUIVO = [
  { id: "concluidas", rotulo: "histórico" },
  { id: "arquivadas", rotulo: "arquivadas" },
  { id: "calendario", rotulo: "calendário" },
] as const;

type ModoArquivo = (typeof MODOS_ARQUIVO)[number]["id"];

const LOCAL_STORAGE_KEY = "audio_organizer_tasks_v1";
const LOCAL_STORAGE_CATEGORIES_KEY = "audio_organizer_categories_v1";

const DEFAULT_CATEGORIES = [
  "Trabalho",
  "Pessoal",
  "Estudos",
  "Saúde",
  "Finanças",
  "Casa",
  "Geral",
  "Outros",
];

const SAMPLE_TASKS: Omit<Task, "id" | "completed" | "reminderTriggered" | "createdAt">[] = [
  {
    title: "Reunião de alinhamento com equipe de marketing",
    category: "Trabalho",
    priority: "Alta",
    reminderTime: "11:00",
  },
  {
    title: "Comprar ingredientes do jantar saudável",
    category: "Saúde",
    priority: "Média",
    reminderTime: "18:30",
  },
  {
    title: "Resolver boleto de luz no internet banking",
    category: "Finanças",
    priority: "Alta",
    reminderTime: "14:00",
  },
  {
    title: "Leitura de capítulos extras para faculdade",
    category: "Estudos",
    priority: "Baixa",
    reminderTime: null,
  },
  {
    title: "Passear 20 minutos com o cachorro",
    category: "Pessoal",
    priority: "Baixa",
    reminderTime: "19:15",
  },
];

// Helper function to automatically move "Alta" (High) priority active tasks to the top
const sortAltaToTop = (list: Task[]): Task[] => {
  const active = list.filter((t) => !t.completed);
  const completed = list.filter((t) => t.completed);

  const altaActive = active.filter((t) => t.priority === "Alta");
  const otherActive = active.filter((t) => t.priority !== "Alta");

  return [...altaActive, ...otherActive, ...completed];
};

export default function App() {
  const { 
    user, 
    loading, 
    tasks: firestoreTasks, 
    notes,
    lists,
    userPrefs, 
    addTask, 
    updateTask, 
    deleteTask, 
    addNote,
    updateNote,
    deleteNote,
    addList,
    updateList,
    deleteList,
    updateUserPrefs 
  } = useDataStore();

  // Categories fallback
  const categories = userPrefs?.categories || DEFAULT_CATEGORIES;
  const dndSettings = userPrefs?.dndSettings || {
    enabled: false,
    startTime: "22:00",
    endTime: "07:00",
    muteLowPriority: false,
    activeRemindersEnabled: false,
    activeRemindersStartTime: "08:00",
    activeRemindersEndTime: "18:00",
    activeRemindersDays: [1, 2, 3, 4, 5],
  };
  const visibleCards = userPrefs?.visibleCards || {
    pauta: true,
    categoryPieChart: true,
    dicasHoje: true,
    dailyGoal: true,
    weeklyProgress: true,
    productivitySummary: true,
    sugestaoTarefa: true,
  };
  const darkMode = userPrefs?.darkMode ?? false;

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedPriority, setSelectedPriority] = useState("Todas");

  // Local helper to match the existing code's expected behavior
  const tasks = sortAltaToTop(firestoreTasks);

  const setCategories = (newCats: string[] | ((prev: string[]) => string[])) => {
    const next = typeof newCats === 'function' ? newCats(categories) : newCats;
    updateUserPrefs({ categories: next });
  };
  const setDndSettings = (newDnd: DndSettings | ((prev: DndSettings) => DndSettings)) => {
    const next = typeof newDnd === 'function' ? newDnd(dndSettings) : newDnd;
    updateUserPrefs({ dndSettings: next });
  };
  const setVisibleCards = (newCards: VisibleCards | ((prev: VisibleCards) => VisibleCards)) => {
    const next = typeof newCards === 'function' ? newCards(visibleCards) : newCards;
    updateUserPrefs({ visibleCards: next });
  };
  const setDarkMode = (newMode: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof newMode === 'function' ? newMode(darkMode) : newMode;
    updateUserPrefs({ darkMode: next });
  };

  // Historic, active, and archived tabs configuration
  const [activeTab, setActiveTab] = useState<Aba>("diarias");
  const [arquivoModo, setArquivoModo] = useState<ModoArquivo>("concluidas");
  const [historyDate, setHistoryDate] = useState("");

  // Categories Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAcoesOpen, setIsAcoesOpen] = useState(false);
  const backupAlert = useBackupScheduler(tasks, categories);

  // Notifications
  const [activeReminders, setActiveReminders] = useState<Task[]>([]);
  const [alertBanner, setAlertBanner] = useState<{
    message: string;
    type: "error" | "success" | "info";
  } | null>(null);

  // Audio transcription preview (from last audio parsed)
  const [recentTranscription, setRecentTranscription] = useState<string | null>(null);

  // File input ref for backup import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus Mode state
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

  // Confetti active state
  const [isConfettiActive, setIsConfettiActive] = useState<boolean>(false);

  // Minutos desde 00:00. Alimenta o cursor da pauta a partir do mesmo
  // setInterval de 1s dos lembretes — nenhum timer novo.
  const [minutoAtual, setMinutoAtual] = useState(() => {
    const agora = new Date();
    return agora.getHours() * 60 + agora.getMinutes();
  });

  // Tarefa aberta a partir de um ponto da pauta: sobe para o topo da fila.
  const [destaqueId, setDestaqueId] = useState<string | null>(null);

  // Dark mode mora no <html>: é o que faz `html.dark body` e o color-scheme nativo valerem
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + N or Cmd + N (creates / focuses manual task input)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        
        // Switch to "diarias" tab so user can see task addition context
        setActiveTab("diarias");

        setTimeout(() => {
          const inputEl = document.getElementById("new-task-title-input");
          if (inputEl) {
            inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
            (inputEl as HTMLInputElement).focus();
            triggerBanner("Campo de título pronto.", "info");
          }
        }, 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Live timer interval to check for match in notifications (every 1 second)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMin = now.getMinutes().toString().padStart(2, "0");
      const currentTimeString = `${currentHour}:${currentMin}`;
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Cursor da pauta. Mesmo valor a cada tick dentro do minuto: o React
      // descarta o set quando o número não muda, então não há re-render extra.
      setMinutoAtual(now.getHours() * 60 + now.getMinutes());

      // Automatically reset reminderTriggered for tasks that fired previously when the minute passes
      firestoreTasks.forEach((t) => {
        if (t.reminderTriggered && t.reminderTime && t.reminderTime !== currentTimeString) {
          updateTask(t.id, { reminderTriggered: false });
        }
      });

      // Calculate DND status
      let isWithinDnd = false;
      if (dndSettings.enabled && dndSettings.startTime && dndSettings.endTime) {
        const start = dndSettings.startTime;
        const end = dndSettings.endTime;
        const t = currentTimeString;
        if (start <= end) {
          isWithinDnd = t >= start && t <= end;
        } else {
          isWithinDnd = t >= start || t <= end;
        }
      }

      // Check Active Reminders Period restriction
      let isOutsideActivePeriod = false;
      if (dndSettings.activeRemindersEnabled) {
        const start = dndSettings.activeRemindersStartTime || "08:00";
        const end = dndSettings.activeRemindersEndTime || "18:00";
        const t = currentTimeString;
        
        let isTimeActive = true;
        if (start <= end) {
          isTimeActive = t >= start && t <= end;
        } else {
          isTimeActive = t >= start || t <= end;
        }

        const activeDays = dndSettings.activeRemindersDays ?? [1, 2, 3, 4, 5];
        const isDayActive = activeDays.includes(currentDay);

        isOutsideActivePeriod = !isTimeActive || !isDayActive;
      }

      // Find tasks matching the current HH:MM, scheduled for today, which are set to trigger and not yet completed
      const matching = (isWithinDnd || isOutsideActivePeriod)
        ? []
        : tasks.filter((task) => {
            const isScheduledToday = !task.reminderDays || task.reminderDays.length === 0 || task.reminderDays.includes(currentDay);
            const isLowMuted = dndSettings.muteLowPriority && task.priority === "Baixa";
            return (
              task.reminderTime === currentTimeString &&
              isScheduledToday &&
              !task.completed &&
              !task.reminderTriggered &&
              !isLowMuted
            );
          });

      if (matching.length > 0) {
        // Trigger OS level push notification if allowed
        matching.forEach((task) => {
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`Lembrete: ${task.title}`, {
                body: `Categoria: ${task.category} | Prioridade: ${task.priority}`,
                icon: "/favicon.ico",
              });
            } catch (err) {
              console.log("Push notification failed to load.");
            }
          }
        });

        // Set matching tasks as triggered
        matching.forEach((t) => {
          updateTask(t.id, { reminderTriggered: true });
        });

        // Add to active modal reminders
        setActiveReminders((prev) => {
          // Prevent duplicates in current modal trigger
          const existingIds = prev.map((item) => item.id);
          const uniqueNew = matching.filter((item) => !existingIds.includes(item.id));
          return [...prev, ...uniqueNew];
        });
      }
    };

    const interval = setInterval(checkReminders, 1000);
    return () => clearInterval(interval);
  }, [tasks, dndSettings]);

  // Generates and downloads a beautifully styled printable paper planner image based on active filtered tasks
  const generatePlannerImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1700;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Helper to draw rounded rectangles
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, strokeWidth = 1) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    };

    // Text wrapping helper
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
      const words = text.split(" ");
      let line = "";
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        ctx.font = "bold 19px 'Instrument Sans', system-ui, sans-serif";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY;
    };

    // Helper to calculate exact title line wrapping count for dynamic height sizing
    const getWrappedLinesCount = (text: string, maxWidth: number): number => {
      const words = text.split(" ");
      let line = "";
      let linesCount = 1;
      ctx.font = "bold 19px 'Instrument Sans', system-ui, sans-serif";
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && n > 0) {
          line = words[n] + " ";
          linesCount++;
        } else {
          line = testLine;
        }
      }
      return linesCount;
    };

    // 1. Fill base clean background
    ctx.fillStyle = "#F4F2EC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic dotted bullet-journal grid background
    ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
    for (let x = 40; x < canvas.width; x += 40) {
      for (let y = 40; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Double Decorative Border
    ctx.strokeStyle = "#4A4E57"; // slate-600 border
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = "rgba(79, 70, 229, 0.18)"; // subtle inside offset border
    ctx.lineWidth = 1;
    ctx.strokeRect(41, 41, canvas.width - 82, canvas.height - 82);

    // 3. Main Header Banner with Indigo-to-Violet Linear Gradient
    const gradient = ctx.createLinearGradient(55, 55, canvas.width - 55, 55);
    gradient.addColorStop(0, "#0A4438");
    gradient.addColorStop(0.5, "#0E5C4A");
    gradient.addColorStop(1, "#0E5C4A");
    drawRoundRect(55, 55, canvas.width - 110, 180, 20, gradient as any);

    // Sound waves graphic representing the audio helper
    ctx.fillStyle = "rgba(165, 180, 252, 0.65)";
    const waveHeights = [20, 38, 55, 70, 48, 25, 30, 60, 80, 72, 45, 18, 35, 50, 40, 15];
    waveHeights.forEach((h, idx) => {
      ctx.fillRect(95 + idx * 7, 145 - h / 2, 4, h);
    });

    // Brand and logo markup
    ctx.fillStyle = "#F4F2EC";
    ctx.font = "bold 36px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText("EchoPlan", 225, 120);

    ctx.fillStyle = "#8AD4C0";
    ctx.font = "bold 13px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText("ORGANIZAÇÃO DIÁRIA INTEGRADA POR ÁUDIO", 225, 150);

    ctx.fillStyle = "#DCD8CC";
    ctx.font = "italic 11px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText("Acompanhe fisicamente sua jornada diária riscada no papel", 225, 175);

    // Right header metadata card
    const metaBoxW = 340;
    const metaBoxX = canvas.width - metaBoxW - 80;
    drawRoundRect(metaBoxX, 75, metaBoxW, 140, 12, "rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.15)", 1);

    ctx.fillStyle = "#F4F2EC";
    ctx.font = "bold 13px 'Instrument Sans', system-ui, sans-serif";
    const todayStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const timeStr = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
    ctx.fillText(`📅 EMISSÃO: ${todayStr} às ${timeStr}`, metaBoxX + 20, 105);

    ctx.fillStyle = "#B5E3D6";
    ctx.font = "bold 11px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText(`🏷️ CATEGORIA: ${selectedCategory.toUpperCase()}`, metaBoxX + 20, 135);
    ctx.fillText(`PRIORIDADE: ${selectedPriority.toUpperCase()}`, metaBoxX + 20, 155);

    ctx.fillStyle = "#34A98B";
    ctx.fillText(`🔍 TAREFAS FILTRADAS: ${filteredTasks.length}`, metaBoxX + 20, 185);

    // 4. Section Title
    ctx.fillStyle = "#16181D";
    ctx.font = "bold 23px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText("📋 SEUS COMPROMISSOS EM ANDAMENTO", 75, 280);

    ctx.fillStyle = "#767A84";
    ctx.font = "italic 13px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText("Foque nas tarefas digitais enviadas para esta folha. Risque à medida que realiza!", 75, 305);

    // Decorative line
    ctx.strokeStyle = "#0E5C4A";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(75, 318);
    ctx.lineTo(390, 318);
    ctx.stroke();

    // 5. Draw the Tasks
    let currentY = 350;
    const cardW = canvas.width - 150;

    if (filteredTasks.length === 0) {
      drawRoundRect(75, currentY, cardW, 150, 16, "#F4F2EC", "#DCD8CC", 1);
      ctx.fillStyle = "#4A4E57";
      ctx.font = "bold 17px 'Instrument Sans', system-ui, sans-serif";
      ctx.fillText("Nenhuma tarefa ativa neste filtro!", 120, currentY + 65);
      ctx.font = "14px 'Instrument Sans', system-ui, sans-serif";
      ctx.fillStyle = "#C6C1B3";
      ctx.fillText("Utilize a seção pautada abaixo para planejar manualmente com sua melhor caligrafia.", 120, currentY + 95);
      currentY += 180;
    } else {
      // Draw up to 8 tasks (leaving room for annotations at the bottom)
      const visibleTasks = filteredTasks.slice(0, 8);
      
      visibleTasks.forEach((task) => {
        // Compute dynamically how high the card should be
        const subtasksToDraw = task.subtasks ? task.subtasks.slice(0, 3) : [];
        const hasNotes = !!task.notes;
        
        // Calculate title line wrap count to size card height precisely
        const titleLinesCount = getWrappedLinesCount(task.title, 680);
        const titleHeight = (titleLinesCount - 1) * 26;
        
        let cardH = 95 + titleHeight;
        if (subtasksToDraw.length > 0) {
          cardH += subtasksToDraw.length * 28 + 10;
        }
        if (hasNotes) {
          cardH += 34;
        }

        // Clip card if it goes past the footer safety limit
        if (currentY + cardH > 1320) {
          return;
        }

        // Highlight Priority Colors elegantly
        const bCol = task.priority === "Alta" ? "#F3B9B4" : task.priority === "Média" ? "#F8DCA6" : "#DCD8CC";
        const bgCol = task.priority === "Alta" ? "#FBF1F0" : task.priority === "Média" ? "#FBF6EA" : "#F4F2EC";
        drawRoundRect(75, currentY, cardW, cardH, 16, bgCol, bCol, 1.5);

        // Solid accent strip
        const accentCol = task.priority === "Alta" ? "#E2453A" : task.priority === "Média" ? "#F0A828" : "#0E5C4A";
        ctx.fillStyle = accentCol;
        drawRoundRect(77, currentY + 10, 6, cardH - 20, 3, accentCol);

        // Checkbox circle - perfectly aligned with the priority colors and vertically centered to the first text line
        ctx.strokeStyle = accentCol;
        ctx.lineWidth = 2.5;
        ctx.fillStyle = "#F4F2EC";
        ctx.beginPath();
        ctx.arc(120, currentY + 34, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Title and notes wrapping
        ctx.fillStyle = "#16181D";
        ctx.font = "bold 19px 'Instrument Sans', system-ui, sans-serif";
        const titleEndY = wrapText(task.title, 160, currentY + 42, 680, 26);

        // Pills rendered securely on the right-hand margin preventing any card or layout overflow
        const pillY = currentY + 22;

        // Priority pill
        const prioBg = task.priority === "Alta" ? "#FBF1F0" : task.priority === "Média" ? "#FBF6EA" : "#EAF5F1";
        const prioText = task.priority === "Alta" ? "#E2453A" : task.priority === "Média" ? "#B87A12" : "#0E5C4A";
        drawRoundRect(990, pillY, 110, 26, 6, prioBg);
        
        ctx.fillStyle = prioText;
        ctx.font = "bold 11px 'Instrument Sans', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Prio: ${task.priority}`, 990 + 55, pillY + 17);
        ctx.textAlign = "left"; // reset

        // Category pill
        drawRoundRect(860, pillY, 120, 26, 6, "#DCD8CC");
        ctx.fillStyle = "#4A4E57";
        ctx.font = "bold 11px 'Instrument Sans', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(task.category.substring(0, 14), 860 + 60, pillY + 17);
        ctx.textAlign = "left"; // reset

        // Reminder Time pill if useful
        if (task.reminderTime) {
          const remY = currentY + 54;
          drawRoundRect(990, remY, 110, 22, 6, "#E3F0EB");
          ctx.fillStyle = "#0E5C4A";
          ctx.font = "bold 10px 'Instrument Sans', system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`⏰ ${task.reminderTime}`, 990 + 55, remY + 15);
          ctx.textAlign = "left"; // reset
        }

        // Draw description text (Notes)
        let itemY = Math.max(titleEndY + 23, currentY + 70);
        if (hasNotes) {
          drawRoundRect(160, itemY - 14, 680, 26, 8, "#F4F2EC", "#DCD8CC", 1);
          ctx.fillStyle = "#767A84";
          ctx.font = "italic 11px 'Instrument Sans', system-ui, sans-serif";
          const descVal = task.notes!.length > 95 ? task.notes!.substring(0, 92) + "..." : task.notes!;
          ctx.fillText(`Nota: "${descVal}"`, 178, itemY + 4);
          itemY += 32;
        }

        // Draw subtasks
        if (subtasksToDraw.length > 0) {
          subtasksToDraw.forEach((sub, sIdx) => {
            const subY = itemY + sIdx * 28;
            ctx.strokeStyle = "#C6C1B3";
            ctx.lineWidth = 1.5;
            ctx.fillStyle = "#F4F2EC";
            ctx.beginPath();
            ctx.arc(180, subY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#4A4E57";
            ctx.font = "14px 'Instrument Sans', system-ui, sans-serif";
            ctx.fillText(sub.title.substring(0, 85), 205, subY + 5);
          });
        }

        currentY += cardH + 20;
      });

      if (filteredTasks.length > 8) {
        ctx.fillStyle = "#767A84";
        ctx.font = "bold 13px 'Instrument Sans', system-ui, sans-serif";
        ctx.fillText(`+ ${filteredTasks.length - 8} outras atividades listadas no dispositivo digital`, 75, currentY - 5);
      }
    }

    // 6. Dotted Line Pannels (Writing room)
    const writeSectY = Math.max(currentY + 10, 860);
    drawRoundRect(75, writeSectY, cardW, 48, 10, "#DCD8CC");
    ctx.fillStyle = "#16181D";
    ctx.font = "bold 13px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText("📝 COMPROMISSOS EXTRAS (ESCREVA COM SUA CANETA OU ADICIONE IDEIAS)", 100, writeSectY + 29);

    let drawingLinesY = writeSectY + 74;
    const canvasLimitY = canvas.height - 180;
    
    while (drawingLinesY < canvasLimitY) {
      // Small manual checkbox
      ctx.strokeStyle = "#C6C1B3";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(120, drawingLinesY - 6, 11, 0, Math.PI * 2);
      ctx.stroke();

      // Dotted line
      ctx.strokeStyle = "#C6C1B3";
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(150, drawingLinesY);
      ctx.lineTo(canvas.width - 100, drawingLinesY);
      ctx.stroke();
      ctx.setLineDash([]);

      drawingLinesY += 45;
    }

    // 7. Footer metadata
    const bSeparationY = canvas.height - 90;
    ctx.strokeStyle = "#DCD8CC";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(55, bSeparationY);
    ctx.lineTo(canvas.width - 55, bSeparationY);
    ctx.stroke();

    ctx.fillStyle = "#767A84";
    ctx.font = "bold 12px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText("EchoPlan 🎙️", 75, bSeparationY + 35);
    
    ctx.font = "11px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText("A pauta do dia no papel. Risque à mão.", 75, bSeparationY + 54);

    ctx.fillStyle = "#0E5C4A";
    ctx.font = "bold 11px 'Instrument Sans', system-ui, sans-serif";
    ctx.fillText("Deixe esta folha no seu campo de visão.", canvas.width - 450, bSeparationY + 45);

    // 8. Trigger PNG browser download
    try {
      const imgUrl = canvas.toDataURL("image/png");
      const downLink = document.createElement("a");
      downLink.download = `echoplan-planner-${selectedCategory.toLowerCase()}-${todayStr.replace(/\//g, "-")}.png`;
      downLink.href = imgUrl;
      document.body.appendChild(downLink);
      downLink.click();
      document.body.removeChild(downLink);

      triggerBanner("Planner baixado, pronto para imprimir.", "success");
    } catch (e) {
      console.error(e);
      triggerBanner("O navegador não deixou gerar a imagem. Tente em outra aba ou navegador.", "error");
    }
  };

  // Handle task actions
  const handleAddNewTask = async (newFields: Omit<Task, "id" | "completed" | "reminderTriggered" | "createdAt" | "updatedAt">) => {
    await addTask({
      ...newFields,
      completed: false,
      reminderTriggered: false,
    });
    triggerBanner("Tarefa na pauta.", "success");
  };

  const handleToggleComplete = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    if (id === focusedTaskId) {
      setFocusedTaskId(null);
    }

    const isNowCompleted = !target.completed;
    const isAltaPriority = target.priority === "Alta";

    await updateTask(id, { completed: isNowCompleted });

    if (isNowCompleted && target.title) {
      triggerBanner(`"${target.title}" foi para o histórico.`, "success");

      // Haptic feedback using browser's Vibration API for mobile devices
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        if (isAltaPriority) {
          // Distinct pattern for important tasks (Double pulse: Vibrate 120ms, pause 60ms, vibrate 120ms)
          navigator.vibrate([120, 60, 120]);
        } else {
          // Subtle single tap for regular tasks (vibrate 50ms)
          navigator.vibrate(50);
        }
      }

      // Confete só no dia 100% concluído. Comemoração que acontece sempre não
      // é comemoração. O estado ainda não chegou do banco, então a conta é
      // feita descontando esta tarefa das pendentes.
      const aindaPendentes = firestoreTasks.filter(
        (t) => t.id !== id && !t.completed && !t.archived
      ).length;
      if (aindaPendentes === 0 && !target.isRecurring) {
        setIsConfettiActive(true);
      }
      if (target.isRecurring) {
        await addTask({
          title: target.title,
          category: target.category,
          priority: target.priority,
          reminderTime: target.reminderTime || null,
          reminderDays: target.reminderDays || undefined,
          tags: target.tags || [],
          notes: target.notes || "",
          isRecurring: true,
          recurrence: target.recurrence,
          completed: false,
          reminderTriggered: false,
        });
        triggerBanner("A próxima repetição já está na fila.", "info");
      }
    } else if (!isNowCompleted && target.title) {
      triggerBanner(`"${target.title}" voltou para a fila.`, "info");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (id === focusedTaskId) {
      setFocusedTaskId(null);
    }
    await deleteTask(id);
    setActiveReminders((prev) => prev.filter((task) => task.id !== id));
    triggerBanner("Tarefa excluída.", "info");
  };

  const handleToggleArchive = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    if (id === focusedTaskId) {
      setFocusedTaskId(null);
    }

    const newArchived = !target.archived;
    await updateTask(id, { archived: newArchived });

    if (newArchived) {
      triggerBanner(`"${target.title}" foi arquivada.`, "success");
    } else {
      triggerBanner(`"${target.title}" voltou para a fila.`, "info");
    }
  };

  const handleUpdateTask = async (id: string, updatedFields: Partial<Task>) => {
    await updateTask(id, updatedFields);
  };

  // Categories custom configurations
  const handleAddCategory = (name: string) => {
    setCategories([...categories, name]);
    triggerBanner(`Categoria "${name}" criada.`, "success");
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    setCategories(categories.map((c) => (c === oldName ? newName : c)));
    tasks.forEach((t) => {
      if (t.category === oldName) {
        updateTask(t.id, { category: newName });
      }
    });

    if (selectedCategory === oldName) {
      setSelectedCategory(newName);
    }
    triggerBanner("Categoria renomeada. As tarefas acompanharam.", "success");
  };

  const handleDeleteCategory = (name: string) => {
    setCategories(categories.filter((c) => c !== name));
    tasks.forEach((t) => {
      if (t.category === name) {
        updateTask(t.id, { category: "Geral" });
      }
    });

    if (selectedCategory === name) {
      setSelectedCategory("Todas");
    }
    triggerBanner(`Categoria excluída. As tarefas dela passaram para Geral.`, "info");
  };

  // Handle audio/text extraction response from server
  const handleAIRecovery = (
    extractedTasks: Omit<Task, "id" | "completed" | "reminderTriggered" | "createdAt" | "updatedAt">[],
    transcription?: string,
    isLocalFallback?: boolean
  ) => {
    if (extractedTasks.length === 0) {
      triggerBanner(
        "Não deu para identificar tarefas no relato. Diga ações com verbo e hora, como \"fechar a planilha às 15h\".",
        "error"
      );
      return;
    }

    extractedTasks.forEach((fields: any) => {
      // If AI provides category that was deleted or unknown, fallback to Geral
      const safeCategory = categories.some((c) => c.toLowerCase() === fields.category.toLowerCase())
        ? categories.find((c) => c.toLowerCase() === fields.category.toLowerCase()) || "Geral"
        : "Geral";

      const safeSubtasks = fields.subtasks
        ? fields.subtasks.map((s: any) => ({
            id: Math.random().toString(36).substring(2, 9),
            title: typeof s === "string" ? s : (s.title || ""),
            completed: typeof s === "string" ? false : !!s.completed,
          }))
        : [];

      addTask({
        ...fields,
        category: safeCategory,
        completed: false,
        reminderTriggered: false,
        subtasks: safeSubtasks,
      });
    });

    if (transcription) {
      setRecentTranscription(transcription);
    }

    if (isLocalFallback) {
      triggerBanner(
        `Sem chave do Gemini: ${extractedTasks.length === 1 ? "1 tarefa saiu" : `${extractedTasks.length} tarefas saíram`} do texto, sem áudio.`,
        "info"
      );
    } else {
      triggerBanner(
        `${extractedTasks.length === 1 ? "1 tarefa" : `${extractedTasks.length} tarefas`} na pauta.`,
        "success"
      );
    }
  };

  // Reminder alert actions
  const handleDismissReminder = (taskId: string) => {
    setActiveReminders((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleCompleteReminder = (taskId: string) => {
    handleToggleComplete(taskId);
    setActiveReminders((prev) => prev.filter((t) => t.id !== taskId));
    triggerBanner("Tarefa concluída.", "success");
  };

  const handleSnoozeReminder = (taskId: string, minutes: number) => {
    const originalTask = tasks.find((t) => t.id === taskId);
    if (originalTask) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + minutes);
      const snoozeHour = now.getHours().toString().padStart(2, "0");
      const snoozeMin = now.getMinutes().toString().padStart(2, "0");
      const snoozedTime = `${snoozeHour}:${snoozeMin}`;

      handleUpdateTask(taskId, {
        reminderTime: snoozedTime,
        reminderTriggered: false, // Reset trigger flag to fire again!
      });

      triggerBanner(`Adiado para as ${snoozedTime}.`, "info");
    }
    setActiveReminders((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Banner dispatcher
  const triggerBanner = (message: string, type: "error" | "success" | "info") => {
    setAlertBanner({ message, type });
    // Auto collapse after 4s
    setTimeout(() => {
      setAlertBanner((prev) => {
        if (prev?.message === message) return null;
        return prev;
      });
    }, 4000);
  };

  // Load sample static templates
  const handleLoadSamples = () => {
    SAMPLE_TASKS.forEach((f) => {
      addTask({
        ...f,
        completed: false,
        reminderTriggered: false,
      });
    });
    triggerBanner("Exemplos carregados.", "success");
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.tasks && content.categories) {
          // This is harder with Firebase as we need to batch add tasks
          // For simplicity, we'll just add them one by one or warn the user
          content.tasks.forEach((t: any) => {
            const { id, ...fields } = t;
            addTask(fields);
          });
          setCategories(content.categories);
          triggerBanner("Backup importado.", "success");
        } else {
          triggerBanner("Esse arquivo não é um backup do EchoPlan. Escolha o JSON exportado pelo app.", "error");
        }
      } catch (err) {
        triggerBanner("O arquivo não pôde ser lido. Confira se é o JSON exportado pelo app.", "error");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        tasks,
        categories,
      };
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const todayStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `echoplan-backup-${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerBanner("Backup baixado.", "success");
    } catch (err) {
      triggerBanner("O backup não foi gerado. Tente de novo em alguns segundos.", "error");
    }
  };

  const handleExportCompletedCSV = () => {
    try {
      const completedTasks = tasks.filter((t) => t.completed);
      if (completedTasks.length === 0) {
        triggerBanner("Nada concluído no histórico para exportar.", "info");
        return;
      }

      const headers = [
        "Título",
        "Categoria",
        "Prioridade",
        "Notas/Descrição",
        "Subtarefas (Concluídas/Total)",
        "Criado Em",
        "Concluído Em",
        "Tags"
      ];

      const escapeCsv = (val: string) => {
        if (val === undefined || val === null) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = completedTasks.map((t) => {
        const subtasksCount = t.subtasks && t.subtasks.length > 0
          ? `${t.subtasks.filter(s => s.completed).length}/${t.subtasks.length}`
          : "0/0";
        const tagsStr = t.tags ? t.tags.join(", ") : "";
        const createdStr = t.createdAt ? new Date(t.createdAt).toLocaleString("pt-BR") : "";
        const completedStr = t.updatedAt ? new Date(t.updatedAt).toLocaleString("pt-BR") : "";
        
        return [
          escapeCsv(t.title),
          escapeCsv(t.category),
          escapeCsv(t.priority),
          escapeCsv(t.notes || ""),
          escapeCsv(subtasksCount),
          escapeCsv(createdStr),
          escapeCsv(completedStr),
          escapeCsv(tagsStr)
        ].join(",");
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const todayStr = new Date().toISOString().split("T")[0];
      
      link.href = url;
      link.download = `historico-tarefas-concluidas-${todayStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      triggerBanner("Histórico baixado em CSV.", "success");
    } catch (err) {
      console.error(err);
      triggerBanner("O CSV não foi gerado. Tente de novo em alguns segundos.", "error");
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Você tem certeza que deseja excluir todas as tarefas registradas hoje?")) {
      const todayStr = getLocalDateString();
      tasks.forEach(t => {
        if (getLocalDateStringFromISO(t.createdAt) === todayStr) {
          deleteTask(t.id);
        }
      });
      setRecentTranscription(null);
      setActiveReminders([]);
      triggerBanner("Tarefas de hoje apagadas.", "info");
    }
  };

  // Drag & drop state for manual task reordering
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedOverTaskId, setDraggedOverTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedTaskId !== id && draggedOverTaskId !== id) {
      setDraggedOverTaskId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDraggedOverTaskId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedTaskId && draggedTaskId !== targetId) {
      handleReorderTasks(draggedTaskId, targetId);
    }
    setDraggedTaskId(null);
    setDraggedOverTaskId(null);
  };

  const handleReorderTasks = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    
    // Firestore doesn't have a built-in reorder for random IDs without a position field.
    // For now, we'll just trigger a banner informing that reordering is local-only or limited.
    // To support reordering properly, we'd need a 'position' field.
    triggerBanner("Reordenar ainda não guarda a ordem entre sessões.", "info");
  };

  // Computed Values for filtration
  const filteredTasks = tasks.filter((task) => {
    // Only active (uncompleted) tasks belong to Fila de Atividades. Completed tasks are in history.
    if (task.completed) return false;

    // Filter out archived tasks from active list
    if (task.archived) return false;

    // If focus mode is active, hide all other tasks
    if (focusedTaskId && task.id !== focusedTaskId) return false;

    // Title, Category, Tag, Notes, or Subtask Search Matches
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query) ||
      (task.tags && task.tags.some((t) => t.toLowerCase().includes(query))) ||
      (task.notes && task.notes.toLowerCase().includes(query)) ||
      (task.subtasks && task.subtasks.some((st) => st.title.toLowerCase().includes(query)));

    // Category drop matches
    const matchesCategory =
      selectedCategory === "Todas" || task.category === selectedCategory;

    // Priority drop matches
    const matchesPriority =
      selectedPriority === "Todas" || task.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const todayStr = getLocalDateString();
  const hasNoPendingTasksToday = tasks.filter(
    (task) => !task.completed && !task.archived
  ).length === 0;

  // Filter tasks historically (active or completed, excluding archived ones)
  const completedHistoryFiltered = tasks.filter((task) => {
    if (task.archived) return false;
    if (historyDate) {
      // check local date matching
      const taskDate = getLocalDateStringFromISO(task.updatedAt || task.createdAt);
      return taskDate === historyDate;
    }
    return true;
  });

  // Filter archived tasks for the Task Bank
  const archivedTasks = tasks.filter((task) => {
    if (!task.archived) return false;

    // Title, Category, Tag, Notes, or Subtask Search Matches
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query) ||
      (task.tags && task.tags.some((t) => t.toLowerCase().includes(query))) ||
      (task.notes && task.notes.toLowerCase().includes(query)) ||
      (task.subtasks && task.subtasks.some((st) => st.title.toLowerCase().includes(query)));

    // Category drop matches
    const matchesCategory =
      selectedCategory === "Todas" || task.category === selectedCategory;

    // Priority drop matches
    const matchesPriority =
      selectedPriority === "Todas" || task.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Metrics summary (restricted to current day for active/completed stats)
  const todayStrMetrics = getLocalDateString();
  const totalCount = tasks.filter(t => !t.archived && getLocalDateStringFromISO(t.createdAt) === todayStrMetrics).length;
  const completedCount = tasks.filter((t) => t.completed && !t.archived && getLocalDateStringFromISO(t.updatedAt || t.createdAt) === todayStrMetrics).length;
  const highPriorityCount = tasks.filter((t) => t.priority === "Alta" && !t.completed && !t.archived && getLocalDateStringFromISO(t.createdAt) === todayStrMetrics).length;
  // Group completed tasks by completion date for progress visual sparkline
  const completedGroupedByDate = tasks.reduce((acc: Record<string, number>, t) => {
    if (t.completed) {
      const dateStr = getLocalDateStringFromISO(t.updatedAt || t.createdAt);
      if (dateStr) {
        acc[dateStr] = (acc[dateStr] || 0) + 1;
      }
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pauta dark:bg-tinta-fundo font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-fita dark:border-fita-clara border-t-transparent rounded-full animate-spin" />
          <p className={`${ui.monoRot} ${ui.suave}`}>carregando a sua pauta</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const hoje = new Date();
  const diaDaSemana = hoje
    .toLocaleDateString("pt-BR", { weekday: "long" })
    .replace("-feira", "");
  const tituloDoDia = `${diaDaSemana.charAt(0).toUpperCase()}${diaDaSemana.slice(1)}, ${hoje.getDate()} de ${hoje.toLocaleDateString(
    "pt-BR",
    { month: "long" }
  )}`;
  const tituloCurtoDoDia = hoje
    .toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
    .replace(/\.$/, "");

  const abaAtiva = (id: (typeof ABAS)[number]["id"]) => activeTab === id;

  const irParaAba = (id: (typeof ABAS)[number]["id"]) => {
    if (id === "diarias") {
      setSelectedCategory("Todas");
      setSelectedPriority("Todas");
      setSearchQuery("");
    }
    setActiveTab(id);
    setIsAcoesOpen(false);
  };

  const classeAba = (ativa: boolean) =>
    `${ui.monoRot} px-3 py-1.5 rounded-pauta cursor-pointer transition-colors ${ui.foco} ${
      ativa
        ? "bg-fita text-pauta-alta dark:bg-fita-clara dark:text-tinta"
        : `${ui.suave} hover:bg-pauta-baixa dark:hover:bg-tinta-linha`
    }`;

  // Ações de uma-vez-por-mês: menu, não navegação.
  const acoes = [
    { rotulo: "Imprimir planner", Icone: Printer, onClick: generatePlannerImage },
    {
      rotulo: "Copiar resumo do dia",
      Icone: FileDown,
      onClick: () => {
        const today = getLocalDateString();
        const completedTasksToday = tasks.filter(
          (t) => t.completed && getLocalDateStringFromISO(t.updatedAt || t.createdAt) === today
        );
        if (completedTasksToday.length === 0) {
          triggerBanner("Nada concluído hoje para resumir.", "info");
          return;
        }
        const summary =
          `Tarefas concluídas — ${today}\n\n` +
          completedTasksToday.map((t) => `- ${t.title}`).join("\n");
        navigator.clipboard.writeText(summary);
        triggerBanner("Resumo copiado.", "success");
      },
    },
    { rotulo: "Exportar backup (JSON)", Icone: Download, onClick: handleExportBackup },
    { rotulo: "Exportar histórico (CSV)", Icone: FileSpreadsheet, onClick: handleExportCompletedCSV },
    { rotulo: "Importar backup", Icone: Upload, onClick: () => fileInputRef.current?.click() },
  ];

  const listaDeTarefas = (lista: Task[], arrastavel: boolean) =>
    lista.map((task, index) => (
      <motion.div
        key={task.id}
        id={`tarefa-${task.id}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index, 8) * 0.04 }}
        className={
          destaqueId === task.id ? "rounded-pauta outline-2 outline-fita dark:outline-fita-clara" : undefined
        }
      >
        <TaskItem
          task={task}
          categories={categories}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTask}
          onToggleArchive={handleToggleArchive}
          {...(arrastavel
            ? {
                isDraggable: true,
                onDragStart: handleDragStart,
                onDragOver: handleDragOver,
                onDragEnd: handleDragEnd,
                onDrop: handleDrop,
                isDraggedOver: draggedOverTaskId === task.id,
                isFocused: focusedTaskId === task.id,
                onToggleFocus: (id: string) => setFocusedTaskId(focusedTaskId === id ? null : id),
              }
            : {})}
        />
      </motion.div>
    ));

  // O dia da pauta: tudo que está pendente, mais o que foi concluído hoje.
  const tarefasDaPauta = tasks.filter(
    (t) =>
      !t.archived &&
      (!t.completed || getLocalDateStringFromISO(t.updatedAt || t.createdAt) === todayStr)
  );

  // A fila mostra cinco. Se a pauta abriu uma tarefa fora delas, ela entra no topo.
  const filaVisivel = (() => {
    const base = filteredTasks.slice(0, 5);
    if (destaqueId && !base.some((t) => t.id === destaqueId)) {
      const destacada = tasks.find((t) => t.id === destaqueId);
      if (destacada) return [destacada, ...base];
    }
    return base;
  })();

  const abrirTarefa = (id: string) => {
    setDestaqueId(id);
    setActiveTab("diarias");
    setTimeout(() => {
      document
        .getElementById(`tarefa-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  const vazio = (titulo: string, convite: string) => (
    <div className={`${ui.superficie} p-10 text-center`}>
      <h4 className={`${ui.displayMd} mb-1`}>{titulo}</h4>
      <p className={`${ui.corpoSm} ${ui.suave} max-w-sm mx-auto`}>{convite}</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-pauta dark:bg-tinta-fundo text-tinta dark:text-pauta">
      <ReminderModal
        activeReminders={activeReminders}
        onDismiss={handleDismissReminder}
        onComplete={handleCompleteReminder}
        onSnooze={handleSnoozeReminder}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
        tasks={tasks}
        categories={categories}
        dndSettings={dndSettings}
        onUpdateDndSettings={setDndSettings}
        visibleCards={visibleCards}
        onUpdateVisibleCards={setVisibleCards}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportBackup}
        accept=".json"
        className="hidden"
      />

      {/* ── Barra de topo: 4 lugares, 1 menu de ações, 3 controles ────────── */}
      <header className="sticky top-0 z-30 h-14 shrink-0 border-b border-linha dark:border-tinta-linha bg-pauta/95 dark:bg-tinta-fundo/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-[76rem] items-center gap-2 px-4 sm:px-6">
          <span className="font-display text-[17px] font-extrabold tracking-[-0.02em]">
            EchoPlan
          </span>

          <nav className="ml-5 hidden items-center gap-1 md:flex" aria-label="Seções">
            {ABAS.map(({ id, rotulo }) => (
              <button
                key={id}
                onClick={() => irParaAba(id)}
                aria-current={abaAtiva(id) ? "page" : undefined}
                className={classeAba(abaAtiva(id))}
              >
                {rotulo}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setIsAcoesOpen((v) => !v)}
                aria-expanded={isAcoesOpen}
                aria-haspopup="menu"
                title="Exportar, importar e imprimir"
                className={ui.btnIcone}
              >
                <Menu className="h-4 w-4" />
              </button>
              {isAcoesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsAcoesOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    role="menu"
                    onKeyDown={(e) => e.key === "Escape" && setIsAcoesOpen(false)}
                    className={`${ui.superficie} absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden p-1 shadow-2xl`}
                  >
                    {acoes.map(({ rotulo, Icone, onClick }) => (
                      <button
                        key={rotulo}
                        role="menuitem"
                        onClick={() => {
                          setIsAcoesOpen(false);
                          onClick();
                        }}
                        className={`flex w-full items-center gap-3 rounded-pauta px-3 py-2 text-left ${ui.corpoSm} cursor-pointer hover:bg-pauta-baixa dark:hover:bg-tinta-linha ${ui.foco}`}
                      >
                        <Icone className="h-4 w-4 shrink-0 text-fita dark:text-fita-clara" />
                        <span>{rotulo}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Usar tema claro" : "Usar tema escuro"}
              className={ui.btnIcone}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              title="Ajustes"
              className={ui.btnIcone}
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={logout}
              title="Sair"
              className={`${ui.btnIcone} text-gravando hover:text-gravando dark:text-gravando-clara`}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Avisos flutuantes */}
      <AnimatePresence>
        {alertBanner && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`fixed left-1/2 top-16 z-40 flex w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 border px-4 py-3 rounded-pauta shadow-xl ${ui.corpoSm} ${
              alertBanner.type === "error"
                ? "bg-pauta-alta dark:bg-tinta-alta border-l-[3px] border-l-gravando border-linha dark:border-tinta-linha"
                : alertBanner.type === "success"
                ? "bg-pauta-alta dark:bg-tinta-alta border-l-[3px] border-l-fita border-linha dark:border-tinta-linha"
                : "bg-pauta-alta dark:bg-tinta-alta border-l-[3px] border-l-dial border-linha dark:border-tinta-linha"
            }`}
          >
            <span className="flex-1 leading-snug">{alertBanner.message}</span>
            <button
              onClick={() => setAlertBanner(null)}
              title="Fechar aviso"
              className={`p-1 rounded-pauta cursor-pointer hover:bg-pauta-baixa dark:hover:bg-tinta-linha ${ui.foco}`}
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {backupAlert && (
        <div
          className={`${ui.superficie} fixed bottom-44 right-4 z-40 flex items-center gap-4 p-4 shadow-2xl md:bottom-28`}
        >
          <p className={ui.corpoSm}>{backupAlert.message}</p>
          <button onClick={backupAlert.action} className={ui.btnPrimario}>
            Baixar
          </button>
        </div>
      )}

      {/* ── Conteúdo: uma coluna. A pauta sangra até 76rem, o resto para em 68rem ── */}
      <main className="mx-auto w-full max-w-[76rem] flex-1 px-4 pb-64 sm:px-6 md:pb-44">
        {/* O dia titula a aba diárias. As outras abas têm o próprio título. */}
        {activeTab === "diarias" && (
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-linha dark:border-tinta-linha pb-5 pt-8">
            <h1 className={ui.displayXl}>
              <span className="hidden sm:inline">{tituloDoDia}</span>
              <span className="sm:hidden">{tituloCurtoDoDia}</span>
            </h1>
            <p className={`${ui.monoNumLg} ${ui.suave}`}>
              {completedCount} de {totalCount} concluídas
            </p>
          </div>
        )}

        <div className="mx-auto max-w-[68rem] py-7">
          {activeTab === "diarias" ? (
            <div className="space-y-7">
              <Pauta
                tasks={tarefasDaPauta}
                minutoAtual={minutoAtual}
                dndSettings={dndSettings}
                onAbrirTarefa={abrirTarefa}
                onDefinirHorario={(id, hhmm) =>
                  handleUpdateTask(id, { reminderTime: hhmm, reminderTriggered: false })
                }
                recolhida={visibleCards.pauta === false}
                onAlternarRecolhida={() =>
                  setVisibleCards({ ...visibleCards, pauta: visibleCards.pauta === false })
                }
              />

              <TaskFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriority={selectedPriority}
                setSelectedPriority={setSelectedPriority}
                totalCount={totalCount}
                completedCount={completedCount}
                highPriorityCount={highPriorityCount}
                onClearAll={handleClearAll}
                onLoadSamples={handleLoadSamples}
                categories={categories}
              />

              {visibleCards.sugestaoTarefa && (
                <SugestaoTarefa
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onToggleFocus={(id) => setFocusedTaskId(focusedTaskId === id ? null : id)}
                  focusedTaskId={focusedTaskId}
                />
              )}

              <section className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className={ui.displayLg}>Hoje</h2>
                  <span className={`${ui.monoRot} ${ui.fraco}`}>
                    {filteredTasks.length > 5
                      ? `5 de ${filteredTasks.length} na fila`
                      : `${filteredTasks.length} na fila`}
                  </span>
                </div>

                {focusedTaskId && (
                  <div
                    className={`${ui.superficie} flex flex-wrap items-center justify-between gap-3 border-l-[3px] border-l-dial p-4`}
                  >
                    <p className={ui.corpoSm}>
                      <span className="font-semibold">Modo foco.</span> As outras tarefas estão
                      ocultas.
                    </p>
                    <button onClick={() => setFocusedTaskId(null)} className={ui.btnFantasma}>
                      Sair do foco
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filaVisivel.length > 0 ? listaDeTarefas(filaVisivel, true) : null}
                  </AnimatePresence>

                  {filteredTasks.length === 0 &&
                    (hasNoPendingTasksToday ? (
                      <EmptyStateProductivityTip />
                    ) : (
                      vazio(
                        "Nada com esse filtro",
                        "Limpe a busca ou escolha outra categoria para ver o resto da fila."
                      )
                    ))}

                  {filteredTasks.length > 5 && (
                    <p className={`${ui.corpoSm} ${ui.suave} pt-1`}>
                      A fila mostra cinco por vez. Conclua ou arquive para carregar as próximas{" "}
                      {filteredTasks.length - 5}.
                    </p>
                  )}
                </div>
              </section>

              {/* Entrada manual e estruturada. O console cuida da entrada por fala. */}
              <TaskForm onAddTask={handleAddNewTask} categories={categories} />

              {/* Métricas: só o que estiver ligado em Ajustes */}
              <div className="space-y-6">
                <PriorityDurationCard tasks={firestoreTasks} />
                {visibleCards.dailyGoal && <DailyGoal tasks={tasks} />}
                {visibleCards.weeklyProgress && <WeeklyProgress tasks={tasks} />}
                {visibleCards.productivitySummary && <ProductivitySummary tasks={tasks} />}
                {visibleCards.dicasHoje && <DicasHoje tasks={tasks} />}
                {visibleCards.categoryPieChart && <CategoryPieChart tasks={tasks} />}
              </div>
            </div>
          ) : activeTab === "notas" ? (
            <NotesView
              notes={notes}
              onAddNote={addNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
            />
          ) : activeTab === "listas" ? (
            <ListView
              lists={lists}
              onAddList={addList}
              onUpdateList={updateList}
              onDeleteList={deleteList}
            />
          ) : (
            /* Arquivo: histórico, arquivadas e calendário num destino só */
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  {MODOS_ARQUIVO.map(({ id, rotulo }) => (
                    <button
                      key={id}
                      onClick={() => setArquivoModo(id)}
                      aria-current={arquivoModo === id ? "true" : undefined}
                      className={classeAba(arquivoModo === id)}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>

                {arquivoModo !== "calendario" && (
                  <div className="flex items-center gap-2">
                    <label className={`${ui.monoRot} ${ui.fraco}`} htmlFor="filtro-periodo">
                      período
                    </label>
                    <input
                      id="filtro-periodo"
                      type="date"
                      value={historyDate}
                      onChange={(e) => setHistoryDate(e.target.value)}
                      className={`${ui.campo} w-auto ${ui.monoNum}`}
                    />
                    {historyDate && (
                      <button onClick={() => setHistoryDate("")} className={ui.btnFantasma}>
                        Tudo
                      </button>
                    )}
                  </div>
                )}
              </div>

              {arquivoModo === "calendario" ? (
                <CalendarView
                  tasks={tasks}
                  categories={categories}
                  onToggleComplete={handleToggleComplete}
                  onOpenDate={(date) => {
                    setHistoryDate(date);
                    setArquivoModo("concluidas");
                  }}
                />
              ) : arquivoModo === "arquivadas" ? (
                <section className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className={ui.displayLg}>Arquivadas</h2>
                    <span className={`${ui.monoRot} ${ui.fraco}`}>{archivedTasks.length}</span>
                  </div>
                  <p className={`${ui.corpoSm} ${ui.suave} max-w-[68ch]`}>
                    O que está aqui fica fora da fila do dia e das metas. Desarquive para trazer de
                    volta.
                  </p>
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {listaDeTarefas(archivedTasks, false)}
                    </AnimatePresence>
                    {archivedTasks.length === 0 &&
                      vazio(
                        "Nada arquivado",
                        "Arquive na fila do dia o que é ideia ou compromisso futuro."
                      )}
                  </div>
                </section>
              ) : (
                <section className="space-y-6">
                  {Object.keys(completedGroupedByDate).length > 0 && (
                    <ProgressChart completedGroupedByDate={completedGroupedByDate} />
                  )}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className={ui.displayLg}>
                        {historyDate
                          ? new Date(historyDate + "T12:00:00").toLocaleDateString("pt-BR")
                          : "Todo o histórico"}
                      </h2>
                      <span className={`${ui.monoRot} ${ui.fraco}`}>
                        {completedHistoryFiltered.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {listaDeTarefas(completedHistoryFiltered, false)}
                      </AnimatePresence>
                      {completedHistoryFiltered.length === 0 &&
                        (historyDate
                          ? vazio(
                              "Nada nesta data",
                              "Escolha outro dia ou toque em Tudo para ver o histórico inteiro."
                            )
                          : vazio(
                              "Histórico vazio",
                              "O que você concluir na aba diárias aparece aqui, dia por dia."
                            ))}
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Console de voz: ancorado embaixo, sempre ao alcance ───────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-linha dark:border-tinta-linha bg-pauta-alta dark:bg-tinta-alta shadow-[0_-8px_24px_-16px_rgba(0,0,0,.45)]">
        <nav
          className="mx-auto flex max-w-[76rem] items-center gap-1 border-b border-linha px-2 py-1 dark:border-tinta-linha md:hidden"
          aria-label="Seções"
        >
          {ABAS.map(({ id, rotulo }) => (
            <button
              key={id}
              onClick={() => irParaAba(id)}
              aria-current={abaAtiva(id) ? "page" : undefined}
              className={`${classeAba(abaAtiva(id))} flex-1`}
            >
              {rotulo}
            </button>
          ))}
        </nav>

        <div className="mx-auto max-h-[46vh] max-w-[68rem] overflow-y-auto px-4 py-3 sm:px-6">
          <AudioRecorder
            onTasksExtracted={handleAIRecovery}
            onError={(msg) => triggerBanner(msg, "error")}
            transcricaoRecente={recentTranscription}
            onLimparTranscricao={() => setRecentTranscription(null)}
          />
        </div>
      </div>

      <ConfettiEffect active={isConfettiActive} onComplete={() => setIsConfettiActive(false)} />
    </div>
  );
}
