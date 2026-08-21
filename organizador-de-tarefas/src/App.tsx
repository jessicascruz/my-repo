import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  CalendarDays,
  Calendar,
  Sparkles,
  X,
  Bell,
  Volume2,
  Clock,
  Settings,
  History,
  Trash2,
  CheckCircle,
  Target,
  Printer,
  FileDown,
  Upload,
  Download,
  Archive,
  Sun,
  Moon,
  FileSpreadsheet,
  StickyNote,
  ListTodo,
  Menu,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Task, Category, Priority, DndSettings, VisibleCards, Note, List } from "./types";
import { ProductivityTip } from "./components/ProductivityTip";
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
import { ListView } from "./components/ListView";
import { useBackupScheduler } from "./hooks/useBackupScheduler";
import { useDataStore } from "./hooks/useDataStore";
import { getLocalDateString, getLocalDateStringFromISO } from "./lib/dateUtils";
import { Login } from "./components/Login";
import { logout } from "./lib/session";
import { LogOut } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"diarias" | "historico" | "arquivadas" | "calendario" | "notas" | "listas">("diarias");
  const [historyDate, setHistoryDate] = useState("");

  // Categories Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileAddOpen, setIsMobileAddOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuCollapsed, setIsMobileMenuCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
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
            triggerBanner("Atalho Ctrl+N: Novo Título de Tarefa focado!", "info");
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
        ctx.font = "bold 19px system-ui, -apple-system, sans-serif";
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
      ctx.font = "bold 19px system-ui, -apple-system, sans-serif";
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
    ctx.fillStyle = "#FFFFFF";
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
    ctx.strokeStyle = "#475569"; // slate-600 border
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = "rgba(79, 70, 229, 0.18)"; // subtle inside offset border
    ctx.lineWidth = 1;
    ctx.strokeRect(41, 41, canvas.width - 82, canvas.height - 82);

    // 3. Main Header Banner with Indigo-to-Violet Linear Gradient
    const gradient = ctx.createLinearGradient(55, 55, canvas.width - 55, 55);
    gradient.addColorStop(0, "#1E1B4B");
    gradient.addColorStop(0.5, "#312E81");
    gradient.addColorStop(1, "#4F46E5");
    drawRoundRect(55, 55, canvas.width - 110, 180, 20, gradient as any);

    // Sound waves graphic representing the audio helper
    ctx.fillStyle = "rgba(165, 180, 252, 0.65)";
    const waveHeights = [20, 38, 55, 70, 48, 25, 30, 60, 80, 72, 45, 18, 35, 50, 40, 15];
    waveHeights.forEach((h, idx) => {
      ctx.fillRect(95 + idx * 7, 145 - h / 2, 4, h);
    });

    // Brand and logo markup
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
    ctx.fillText("EchoPlan 🎙️", 225, 120);

    ctx.fillStyle = "#A5B4FC";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.fillText("ORGANIZAÇÃO DIÁRIA INTEGRADA POR ÁUDIO", 225, 150);

    ctx.fillStyle = "#E2E8F0";
    ctx.font = "italic 11px system-ui, -apple-system, sans-serif";
    ctx.fillText("Acompanhe fisicamente sua jornada diária riscada no papel", 225, 175);

    // Right header metadata card
    const metaBoxW = 340;
    const metaBoxX = canvas.width - metaBoxW - 80;
    drawRoundRect(metaBoxX, 75, metaBoxW, 140, 12, "rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.15)", 1);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
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

    ctx.fillStyle = "#C7D2FE";
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.fillText(`🏷️ CATEGORIA: ${selectedCategory.toUpperCase()}`, metaBoxX + 20, 135);
    ctx.fillText(`⚡ PRIORIDADE: ${selectedPriority.toUpperCase()}`, metaBoxX + 20, 155);

    ctx.fillStyle = "#818CF8";
    ctx.fillText(`🔍 TAREFAS FILTRADAS: ${filteredTasks.length}`, metaBoxX + 20, 185);

    // 4. Section Title
    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 23px system-ui, -apple-system, sans-serif";
    ctx.fillText("📋 SEUS COMPROMISSOS EM ANDAMENTO", 75, 280);

    ctx.fillStyle = "#64748B";
    ctx.font = "italic 13px system-ui, -apple-system, sans-serif";
    ctx.fillText("Foque nas tarefas digitais enviadas para esta folha. Risque à medida que realiza!", 75, 305);

    // Decorative line
    ctx.strokeStyle = "#4F46E5";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(75, 318);
    ctx.lineTo(390, 318);
    ctx.stroke();

    // 5. Draw the Tasks
    let currentY = 350;
    const cardW = canvas.width - 150;

    if (filteredTasks.length === 0) {
      drawRoundRect(75, currentY, cardW, 150, 16, "#F8FAFC", "#E2E8F0", 1);
      ctx.fillStyle = "#475569";
      ctx.font = "bold 17px system-ui, -apple-system, sans-serif";
      ctx.fillText("Nenhuma tarefa ativa neste filtro!", 120, currentY + 65);
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#94A3B8";
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
        const bCol = task.priority === "Alta" ? "#FECDD3" : task.priority === "Média" ? "#FDE68A" : "#E2E8F0";
        const bgCol = task.priority === "Alta" ? "#FFF9FA" : task.priority === "Média" ? "#FFFCF5" : "#FFFFFF";
        drawRoundRect(75, currentY, cardW, cardH, 16, bgCol, bCol, 1.5);

        // Solid accent strip
        const accentCol = task.priority === "Alta" ? "#F43F5E" : task.priority === "Média" ? "#F59E0B" : "#4F46E5";
        ctx.fillStyle = accentCol;
        drawRoundRect(77, currentY + 10, 6, cardH - 20, 3, accentCol);

        // Checkbox circle - perfectly aligned with the priority colors and vertically centered to the first text line
        ctx.strokeStyle = accentCol;
        ctx.lineWidth = 2.5;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(120, currentY + 34, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Title and notes wrapping
        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 19px system-ui, -apple-system, sans-serif";
        const titleEndY = wrapText(task.title, 160, currentY + 42, 680, 26);

        // Pills rendered securely on the right-hand margin preventing any card or layout overflow
        const pillY = currentY + 22;

        // Priority pill
        const prioBg = task.priority === "Alta" ? "#FEF2F2" : task.priority === "Média" ? "#FFFBEB" : "#F0FDF4";
        const prioText = task.priority === "Alta" ? "#EF4444" : task.priority === "Média" ? "#D97706" : "#16A34A";
        drawRoundRect(990, pillY, 110, 26, 6, prioBg);
        
        ctx.fillStyle = prioText;
        ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Prio: ${task.priority}`, 990 + 55, pillY + 17);
        ctx.textAlign = "left"; // reset

        // Category pill
        drawRoundRect(860, pillY, 120, 26, 6, "#F1F5F9");
        ctx.fillStyle = "#475569";
        ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(task.category.substring(0, 14), 860 + 60, pillY + 17);
        ctx.textAlign = "left"; // reset

        // Reminder Time pill if useful
        if (task.reminderTime) {
          const remY = currentY + 54;
          drawRoundRect(990, remY, 110, 22, 6, "#EEF2FF");
          ctx.fillStyle = "#4F46E5";
          ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`⏰ ${task.reminderTime}`, 990 + 55, remY + 15);
          ctx.textAlign = "left"; // reset
        }

        // Draw description text (Notes)
        let itemY = Math.max(titleEndY + 23, currentY + 70);
        if (hasNotes) {
          drawRoundRect(160, itemY - 14, 680, 26, 8, "#F8FAFC", "#E2E8F0", 1);
          ctx.fillStyle = "#64748B";
          ctx.font = "italic 11px system-ui, -apple-system, sans-serif";
          const descVal = task.notes!.length > 95 ? task.notes!.substring(0, 92) + "..." : task.notes!;
          ctx.fillText(`Nota: "${descVal}"`, 178, itemY + 4);
          itemY += 32;
        }

        // Draw subtasks
        if (subtasksToDraw.length > 0) {
          subtasksToDraw.forEach((sub, sIdx) => {
            const subY = itemY + sIdx * 28;
            ctx.strokeStyle = "#94A3B8";
            ctx.lineWidth = 1.5;
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.arc(180, subY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#334155";
            ctx.font = "14px system-ui, -apple-system, sans-serif";
            ctx.fillText(sub.title.substring(0, 85), 205, subY + 5);
          });
        }

        currentY += cardH + 20;
      });

      if (filteredTasks.length > 8) {
        ctx.fillStyle = "#64748B";
        ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
        ctx.fillText(`+ ${filteredTasks.length - 8} outras atividades listadas no dispositivo digital`, 75, currentY - 5);
      }
    }

    // 6. Dotted Line Pannels (Writing room)
    const writeSectY = Math.max(currentY + 10, 860);
    drawRoundRect(75, writeSectY, cardW, 48, 10, "#F1F5F9");
    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.fillText("📝 COMPROMISSOS EXTRAS (ESCREVA COM SUA CANETA OU ADICIONE IDEIAS)", 100, writeSectY + 29);

    let drawingLinesY = writeSectY + 74;
    const canvasLimitY = canvas.height - 180;
    
    while (drawingLinesY < canvasLimitY) {
      // Small manual checkbox
      ctx.strokeStyle = "#94A3B8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(120, drawingLinesY - 6, 11, 0, Math.PI * 2);
      ctx.stroke();

      // Dotted line
      ctx.strokeStyle = "#CBD5E1";
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
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(55, bSeparationY);
    ctx.lineTo(canvas.width - 55, bSeparationY);
    ctx.stroke();

    ctx.fillStyle = "#64748B";
    ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
    ctx.fillText("EchoPlan 🎙️", 75, bSeparationY + 35);
    
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.fillText("Planner inteligente offline para impressão. Mantenha os olhos fora das telas e risque com foco.", 75, bSeparationY + 54);

    ctx.fillStyle = "#4F46E5";
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    ctx.fillText("SUGIRA: COLOQUE ESTE CARD IMPRESSO EM SEU CAMPO DE VISÃO! 📌", canvas.width - 450, bSeparationY + 45);

    // 8. Trigger PNG browser download
    try {
      const imgUrl = canvas.toDataURL("image/png");
      const downLink = document.createElement("a");
      downLink.download = `echoplan-planner-${selectedCategory.toLowerCase()}-${todayStr.replace(/\//g, "-")}.png`;
      downLink.href = imgUrl;
      document.body.appendChild(downLink);
      downLink.click();
      document.body.removeChild(downLink);

      triggerBanner("Planilha de papel baixada com sucesso! Pronta para imprimir! 🖨️🎯", "success");
    } catch (e) {
      console.error(e);
      triggerBanner("Incapaz de gerar a imagem devido a restrições no navegador.", "error");
    }
  };

  // Handle task actions
  const handleAddNewTask = async (newFields: Omit<Task, "id" | "completed" | "reminderTriggered" | "createdAt" | "updatedAt">) => {
    await addTask({
      ...newFields,
      completed: false,
      reminderTriggered: false,
    });
    triggerBanner("Tarefa adicionada com sucesso!", "success");
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
      triggerBanner(`Parabéns! Você concluiu a tarefa: "${target.title}". Ela foi enviada para o histórico! 🎉`, "success");
      
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

      if (isAltaPriority) {
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
        triggerBanner(`Tarefa recorrente criada para o próximo ciclo! 🔁`, "info");
      }
    } else if (!isNowCompleted && target.title) {
      triggerBanner(`Tarefa "${target.title}" reativada e movida de volta para a fila!`, "info");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (id === focusedTaskId) {
      setFocusedTaskId(null);
    }
    await deleteTask(id);
    setActiveReminders((prev) => prev.filter((task) => task.id !== id));
    triggerBanner("Tarefa removida.", "info");
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
      triggerBanner(`Tarefa "${target.title}" arquivada no Banco de Tarefas!`, "success");
    } else {
      triggerBanner(`Tarefa "${target.title}" movida de volta para a fila ativa!`, "info");
    }
  };

  const handleUpdateTask = async (id: string, updatedFields: Partial<Task>) => {
    await updateTask(id, updatedFields);
  };

  // Categories custom configurations
  const handleAddCategory = (name: string) => {
    setCategories([...categories, name]);
    triggerBanner(`Categoria "${name}" adicionada!`, "success");
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
    triggerBanner("Categoria e tarefas associadas atualizadas!", "success");
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
    triggerBanner(`Categoria excluída. Tarefas migradas para "Geral".`, "info");
  };

  // Handle audio/text extraction response from server
  const handleAIRecovery = (
    extractedTasks: Omit<Task, "id" | "completed" | "reminderTriggered" | "createdAt" | "updatedAt">[],
    transcription?: string,
    isLocalFallback?: boolean
  ) => {
    if (extractedTasks.length === 0) {
      triggerBanner(
        "O assistente não conseguiu identificar tarefas no seu relato. Diga ou digite ações claras como 'fazer atividade às 15h'!",
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
        `Sucesso extra-heurístico! Criamos ${extractedTasks.length} tarefa(s) localmente. Configure a GEMINI_API_KEY no menu Settings para transição inteligente por Áudio!`,
        "info"
      );
    } else {
      triggerBanner(
        `Sucesso! Extraímos ${extractedTasks.length} tarefa(s) inteligente(s) para o seu dia via Gemini Pro.`,
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
    triggerBanner("Tarefa marcada como concluída!", "success");
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

      triggerBanner(`Adiado em ${minutes} minutos. Novo alarme às ${snoozedTime}.`, "info");
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
    triggerBanner("Carregado um conjunto de tarefas exemplo!", "success");
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
          triggerBanner("Backup importado com sucesso!", "success");
        } else {
          triggerBanner("Formato de backup inválido.", "error");
        }
      } catch (err) {
        triggerBanner("Erro ao processar o arquivo de backup.", "error");
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
      triggerBanner("Backup baixado com sucesso!", "success");
    } catch (err) {
      triggerBanner("Erro ao exportar o backup de tarefas.", "error");
    }
  };

  const handleExportCompletedCSV = () => {
    try {
      const completedTasks = tasks.filter((t) => t.completed);
      if (completedTasks.length === 0) {
        triggerBanner("Não há tarefas concluídas no histórico para exportar.", "info");
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
      
      triggerBanner("Histórico de tarefas concluídas em CSV baixado!", "success");
    } catch (err) {
      console.error(err);
      triggerBanner("Erro ao exportar o histórico de tarefas em CSV.", "error");
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
      triggerBanner("Todas as tarefas de hoje foram limpas.", "info");
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
    triggerBanner("Ordenação manual no Banco de Dados requer campo de posição (não implementado).", "info");
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

  const getCategoryCount = (catName: string) => {
    return tasks.filter((t) => t.category === catName && !t.archived && !t.completed).length;
  };

  const getCategoryDotColor = (cat: string) => {
    const dotColors: Record<string, string> = {
      Trabalho: "bg-blue-500",
      Pessoal: "bg-purple-500",
      Estudos: "bg-indigo-500",
      Saúde: "bg-rose-500",
      Finanças: "bg-emerald-500",
      Casa: "bg-amber-500",
      Geral: "bg-slate-500",
      Outros: "bg-teal-500",
    };
    return dotColors[cat] || "bg-indigo-400";
  };

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans">
      <div className="flex min-h-screen bg-pauta dark:bg-tinta-fundo text-tinta dark:text-pauta font-sans overflow-hidden">
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

      {backupAlert && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-650 text-white rounded-xl shadow-xl flex items-center gap-4">
          <p className="text-sm font-semibold">{backupAlert.message}</p>
          <button
            onClick={backupAlert.action}
            className="px-3 py-1 bg-white text-indigo-700 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-100"
          >
            Download
          </button>
        </div>
      )}

      {/* Sidebar - Professional Polish Style */}
      <aside className={`${isSidebarHidden ? "hidden" : isSidebarCollapsed ? "w-16 p-2" : "w-66"} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col shrink-0 transition-all duration-300`}>
        <div className={`border-b border-slate-100 dark:border-slate-800 ${isSidebarCollapsed ? "py-4 px-1" : "p-6"}`}>
          <div className={`flex ${isSidebarCollapsed ? "flex-col items-center gap-4" : "items-center justify-between"}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-650 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <span className="font-extrabold text-base tracking-tight font-display text-slate-900 dark:text-slate-100 block">EchoPlan</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Voice Assistant</span>
                </div>
              )}
            </div>
            <div className={`flex ${isSidebarCollapsed ? "flex-col gap-2" : "items-center gap-1.5"}`}>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 cursor-pointer"
                title={isSidebarCollapsed ? "Expandir menu" : "Encolher menu"}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsSidebarHidden(true)}
                className="p-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-rose-500 cursor-pointer"
                title="Esconder menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto ${isSidebarCollapsed ? "p-1.5" : "p-4"}`}>
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Menu Principal</div>
          )}
          <button
            onClick={() => {
              setSelectedCategory("Todas");
              setSelectedPriority("Todas");
              setSearchQuery("");
              setActiveTab("diarias");
            }}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left ${
              activeTab === "diarias" ? "bg-slate-100/80 dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 font-extrabold" : "text-slate-700 dark:text-slate-400"
            }`}
            title="Fila de Atividades"
          >
            <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            {!isSidebarCollapsed && <span>Fila de Atividades</span>}
          </button>

          <button
            onClick={() => {
              setActiveTab("calendario");
            }}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} mt-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left ${
              activeTab === "calendario" ? "bg-slate-100/80 dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 font-extrabold" : "text-slate-700 dark:text-slate-400"
            }`}
            title="Calendário Mensal"
          >
            <Calendar className="w-4 h-4 text-indigo-700 dark:text-indigo-500 shrink-0" />
            {!isSidebarCollapsed && <span>Calendário Mensal</span>}
          </button>

          <button
            onClick={() => {
              setActiveTab("historico");
            }}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} mt-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left ${
              activeTab === "historico" ? "bg-slate-100/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold" : "text-slate-600 dark:text-slate-400"
            }`}
            title="Histórico de Tarefas"
          >
            <History className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            {!isSidebarCollapsed && <span>Histórico de Tarefas</span>}
          </button>

          <button
            onClick={() => {
              setActiveTab("arquivadas");
            }}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} mt-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer text-left ${
              activeTab === "arquivadas" ? "bg-slate-100/80 dark:bg-slate-800 text-amber-800 dark:text-amber-500 font-extrabold" : "text-slate-700 dark:text-slate-500"
            }`}
            title="Banco de Tarefas"
          >
            <div className="relative flex items-center justify-center">
              <Archive className="w-4 h-4 text-amber-500 shrink-0 animate-none" />
              {isSidebarCollapsed && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-bold px-1 rounded-full">
                  {tasks.filter((t) => t.archived).length}
                </span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <>
                <span>Banco de Tarefas</span>
                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                  {tasks.filter((t) => t.archived).length}
                </span>
              </>
            )}
          </button>

          {!isSidebarCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 pt-6 mb-2">Ações e Planejamento</div>
          )}

          <button
            onClick={generatePlannerImage}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} mt-1 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 hover:text-indigo-700 border border-indigo-100 dark:border-indigo-900/35 bg-white dark:bg-slate-900 shadow-xs rounded-xl font-bold text-xs transition-colors cursor-pointer text-left`}
            title="Baixar planilha de Planner de tarefas para imprimir"
          >
            <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-500 shrink-0" />
            {!isSidebarCollapsed && <span>Imprimir Planner</span>}
          </button>

          <button
            onClick={() => {
              const today = getLocalDateString();
              const completedTasksToday = tasks.filter((t) => t.completed && getLocalDateStringFromISO(t.updatedAt || t.createdAt) === today);
              if (completedTasksToday.length === 0) {
                triggerBanner("Nenhuma tarefa concluída hoje para resumir.", "info");
                return;
              }
              const summary = `Tarefas Concluídas - ${today}\n\n` + completedTasksToday.map((t) => `- ${t.title}`).join("\n");
              navigator.clipboard.writeText(summary);
              triggerBanner("Resumo copiado para a área de transferência!", "success");
            }}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} mt-1 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs rounded-xl font-bold text-xs transition-colors cursor-pointer text-left`}
            title="Copiar resumo de tarefas do dia"
          >
            <FileDown className="w-4 h-4 text-indigo-600 dark:text-indigo-500 shrink-0" />
            {!isSidebarCollapsed && <span>Copiar Resumo</span>}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} mt-1 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs rounded-xl font-bold text-xs transition-colors cursor-pointer text-left`}
            title="Importar backup de tarefas"
          >
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-500 shrink-0" />
            {!isSidebarCollapsed && <span>Importar Backup</span>}
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleExportBackup}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} mt-1 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs rounded-xl font-bold text-xs transition-colors cursor-pointer text-left`}
            title="Exportar backup de tarefas para JSON local"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-500 shrink-0" />
            {!isSidebarCollapsed && <span>Exportar Backup</span>}
          </button>

          <button
            onClick={handleExportCompletedCSV}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} mt-1 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs rounded-xl font-bold text-xs transition-colors cursor-pointer text-left`}
            title="Exportar histórico de tarefas concluídas em formato CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-600 shrink-0" />
            {!isSidebarCollapsed && <span>Exportar Histórico (CSV)</span>}
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className={`w-full flex items-center ${isSidebarCollapsed ? "justify-center p-2.5" : "justify-between px-2.5 py-2"} mt-4 text-[11px] font-bold text-indigo-650 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 bg-indigo-50/20 dark:bg-indigo-950/10 border border-dashed border-indigo-200 dark:border-indigo-900/40 rounded-xl cursor-pointer transition-colors`}
            title="Categorias Personalizadas"
          >
            <span className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Categorias Personalizadas</span>}
            </span>
            {!isSidebarCollapsed && (
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200 px-1 py-0.2 rounded">+</span>
            )}
          </button>
        </nav>

        {/* User profile section matching the style sheet */}
        <div className={`p-4 border-t border-slate-100 dark:border-slate-800 flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || "User"} className="w-10 h-10 rounded-xl shadow-sm object-cover shrink-0" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-indigo-650 text-white font-bold text-sm flex items-center justify-center shadow-sm uppercase shrink-0">
              {user.displayName?.slice(0, 2) || "U"}
            </div>
          )}
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.displayName || "Usuário"}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-20 transition-colors">
          <div className="flex items-center space-x-3">
            {isSidebarHidden && (
              <button
                onClick={() => setIsSidebarHidden(false)}
                className="hidden md:flex p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 items-center justify-center cursor-pointer transition-colors"
                title="Mostrar menu lateral"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
              <span className="md:hidden w-8 h-8 bg-indigo-650 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-200">
                <Mic className="w-4 h-4" />
              </span>
              <span className="truncate max-w-[140px] sm:max-w-none">EchoPlan</span>
            </h1>
            <div className="hidden xs:flex items-center space-x-1 py-0.5 px-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-lg text-[10px] font-semibold text-indigo-650 dark:text-indigo-400">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Gemini Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-display hidden sm:inline-block">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            {/* Action buttons (Manage categories & notifications notification alert) */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-500 animate-none" /> : <Moon className="w-4 h-4 text-indigo-600 animate-none" />}
              </button>

              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={logout}
                className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>

              <div className="relative p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                <Bell className="w-4 h-4" />
                {activeReminders.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Floating alert banners */}
        <AnimatePresence>
          {alertBanner && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-4 left-1/2 -translate-x-1/2 z-45 px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center space-x-2.5 max-w-md w-full shrink-0 ${
                alertBanner.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : alertBanner.type === "error"
                  ? "bg-rose-50 text-rose-800 border-rose-300"
                  : "bg-indigo-50 text-indigo-800 border-indigo-300"
              }`}
            >
              <span className="flex-1 leading-snug">{alertBanner.message}</span>
              <button
                onClick={() => setAlertBanner(null)}
                className="p-1 hover:bg-black/5 rounded-md transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-24 md:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Input Panel - Hidden on mobile, sticky on desktop */}
            <div className="hidden lg:block lg:col-span-5 space-y-6 lg:sticky lg:top-0">
              <AudioRecorder
                onTasksExtracted={handleAIRecovery}
                onError={(msg) => triggerBanner(msg, "error")}
              />

              {/* Display last audio transcription */}
              <AnimatePresence>
                {recentTranscription && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/40 rounded-2xl p-5"
                  >
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center mb-1.5">
                      <Volume2 className="w-3.5 h-3.5 mr-1" /> Transcrição do seu relato
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                      "{recentTranscription}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <TaskForm onAddTask={handleAddNewTask} categories={categories} />
            </div>

            {/* Right Column: Dynamic Dashboard and Interactive Lists */}
            <div className="lg:col-span-7 space-y-6">
              {/* Mobile Tab Title & Status indicator */}
              <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 font-display">
                  {activeTab === "diarias" && (
                    <>
                      <CalendarDays className="w-4 h-4 text-indigo-600" />
                      Fila de Atividades
                    </>
                  )}
                  {activeTab === "historico" && (
                    <>
                      <History className="w-4 h-4 text-emerald-600" />
                      Histórico de Tarefas
                    </>
                  )}
                  {activeTab === "arquivadas" && (
                    <>
                      <Archive className="w-4 h-4 text-amber-500" />
                      Banco de Tarefas
                    </>
                  )}
                  {activeTab === "calendario" && (
                    <>
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      Calendário Mensal
                    </>
                  )}
                  {activeTab === "notas" && (
                    <>
                      <StickyNote className="w-4 h-4 text-teal-600" />
                      Notas & Ideias
                    </>
                  )}
                  {activeTab === "listas" && (
                    <>
                      <ListTodo className="w-4 h-4 text-sky-600" />
                      Listas de Verificação
                    </>
                  )}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  {activeTab === "diarias" && `${filteredTasks.length} ativas`}
                  {activeTab === "historico" && "Histórico"}
                  {activeTab === "arquivadas" && "Arquivadas"}
                  {activeTab === "calendario" && "Mensal"}
                  {activeTab === "notas" && `${notes.length} notas`}
                  {activeTab === "listas" && `${lists.length} listas`}
                </span>
              </div>

              {/* Tab Selector - Visible on desktop/tablet only */}
              <div className="hidden md:flex border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab("diarias")}
                  className={`py-3 px-6 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
                    activeTab === "diarias"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Fila de Atividades
                </button>
                 <button
                  onClick={() => setActiveTab("historico")}
                  className={`py-3 px-6 text-sm font-semibold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    activeTab === "historico"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <History className="w-4 h-4 shrink-0" />
                  <span>Histórico de Tarefas</span>
                  <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/45 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {tasks.filter((t) => !t.archived).length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("arquivadas")}
                  className={`py-3 px-6 text-sm font-semibold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    activeTab === "arquivadas"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Archive className="w-4 h-4 shrink-0 text-amber-500 animate-none" />
                  <span>Banco de Tarefas</span>
                  <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/45 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {tasks.filter((t) => t.archived).length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("calendario")}
                  className={`py-3 px-6 text-sm font-semibold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    activeTab === "calendario"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Calendário</span>
                </button>
                <button
                  onClick={() => setActiveTab("notas")}
                  className={`py-3 px-6 text-sm font-semibold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    activeTab === "notas"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <StickyNote className="w-4 h-4 shrink-0" />
                  <span>Notas</span>
                </button>
                <button
                  onClick={() => setActiveTab("listas")}
                  className={`py-3 px-6 text-sm font-semibold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    activeTab === "listas"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <ListTodo className="w-4 h-4 shrink-0" />
                  <span>Listas</span>
                </button>
              </div>

              {activeTab === "diarias" ? (
                // Tab 1: Regular Workflow
                <div className="flex flex-col gap-6">
                  {/* Task block - placed first on mobile via order-1 */}
                  <div className="order-1 md:order-7 space-y-6">
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

                    {/* Task list container */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 font-display text-base">
                          Fila de Atividades ({filteredTasks.length > 5 ? `Exibindo 5 de ${filteredTasks.length}` : filteredTasks.length})
                        </h3>
                        {selectedCategory !== "Todas" || selectedPriority !== "Todas" ? (
                          <button
                            onClick={() => {
                              setSelectedCategory("Todas");
                              setSelectedPriority("Todas");
                            }}
                            className="text-xs text-indigo-650 hover:underline font-semibold cursor-pointer"
                          >
                            Limpar Filtros
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">
                            Arraste as tarefas pelo marcador para reordenar
                          </span>
                        )}
                      </div>

                      {visibleCards.sugestaoTarefa && (
                        <SugestaoTarefa
                          tasks={tasks}
                          onToggleComplete={handleToggleComplete}
                          onToggleFocus={(id) => setFocusedTaskId(focusedTaskId === id ? null : id)}
                          focusedTaskId={focusedTaskId}
                        />
                      )}

                      {filteredTasks.length > 5 && (
                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 text-xs text-slate-700 flex gap-3 shadow-xs">
                          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <p className="font-bold text-slate-900">Visualização Focada (Máximo 5 tarefas)</p>
                            <p className="mt-0.5 leading-relaxed text-slate-600">
                              Sua tela inicial exibe no máximo as 5 primeiras tarefas ativas. Conclua tarefas para carregar as próximas {filteredTasks.length - 5} automaticamente ou envie-as para o <strong>Banco de Tarefas (arquivando)</strong> para tirá-las da fila!
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 min-h-[200px] pb-10">
                        {focusedTaskId && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-amber-50/55 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                                <Target className="w-5 h-5 animate-pulse" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">Você está no Modo Foco 🎯</h4>
                                <p className="text-xs text-slate-500">As outras tarefas estão ocultas para ajudá-lo a manter o foco total.</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setFocusedTaskId(null)}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Sair do Foco</span>
                            </button>
                          </motion.div>
                        )}

                        <AnimatePresence mode="popLayout">
                          <motion.div
                            key={`${selectedCategory}-${searchQuery}`}
                            initial="hidden"
                            animate="visible"
                            variants={{
                              visible: { transition: { staggerChildren: 0.1 } },
                              hidden: {},
                            }}
                          >
                            {filteredTasks.length > 0 ? (
                              filteredTasks.slice(0, 5).map((task, index) => (
                                <motion.div
                                  key={task.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <TaskItem
                                    task={task}
                                    categories={categories}
                                    onToggleComplete={handleToggleComplete}
                                    onDelete={handleDeleteTask}
                                    onUpdate={handleUpdateTask}
                                    isDraggable={true}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDragEnd={handleDragEnd}
                                    onDrop={handleDrop}
                                    isDraggedOver={draggedOverTaskId === task.id}
                                    isFocused={focusedTaskId === task.id}
                                    isAnyTaskFocused={focusedTaskId !== null}
                                    onToggleFocus={(id) => setFocusedTaskId(focusedTaskId === id ? null : id)}
                                    onToggleArchive={handleToggleArchive}
                                  />
                                </motion.div>
                              ))
                            ) : hasNoPendingTasksToday ? (
                              <EmptyStateProductivityTip />
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[300px]"
                              >
                                <img
                                  src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M8 12h8'/></svg>"
                                  alt="Nenhuma tarefa encontrada"
                                  className="w-12 h-12 text-slate-300 opacity-60 mb-3"
                                />
                                <h4 className="font-bold font-display text-slate-600 text-sm">
                                  Nenhuma tarefa correspondente
                                </h4>
                                <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                                  Tente gravar um áudio descrevendo sua rotina ou crie tarefas manuais no formulário lateral para começar a classificar seu dia!
                                </p>
                              </motion.div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Focus in High Priority Card - order-2 */}
                  <div className="order-2 md:order-6">
                    <PriorityDurationCard tasks={firestoreTasks} />
                  </div>

                  {/* Daily Goal Card - order-3 */}
                  {visibleCards.dailyGoal && (
                    <div className="order-3 md:order-3">
                      <DailyGoal tasks={tasks} />
                    </div>
                  )}

                  {/* Weekly Progress Card - order-4 */}
                  {visibleCards.weeklyProgress && (
                    <div className="order-4 md:order-4">
                      <WeeklyProgress tasks={tasks} />
                    </div>
                  )}

                  {/* Productivity Summary Card - order-5 */}
                  {visibleCards.productivitySummary && (
                    <div className="order-5 md:order-5">
                      <ProductivitySummary tasks={tasks} />
                    </div>
                  )}

                  {/* Dicas Hoje Card - order-6 */}
                  {visibleCards.dicasHoje && (
                    <div className="order-6 md:order-2">
                      <DicasHoje tasks={tasks} />
                    </div>
                  )}

                  {/* Category Pie Chart Card - order-7 */}
                  {visibleCards.categoryPieChart && (
                    <div className="order-7 md:order-1">
                      <CategoryPieChart tasks={tasks} />
                    </div>
                  )}
                </div>
              ) : activeTab === "historico" ? (
                // Tab 2: Historic Completed View & Date Filtration
                <div className="space-y-6">
                  {/* Historical Date Filtering bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                        <History className="w-4 h-4 text-indigo-500" />
                        Histórico de Tarefas
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Busque e filtre todas as suas atividades ativas ou concluídas por data
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={historyDate}
                        onChange={(e) => setHistoryDate(e.target.value)}
                        className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      />
                      {historyDate && (
                        <button
                          onClick={() => setHistoryDate("")}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Mostrar Todas
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Completion Progress Over Time Dashboard */}
                  {Object.keys(completedGroupedByDate).length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                        Desempenho por Dia
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-600 italic">
                        Nenhum progresso de tarefa concluída computado ainda. Complete atividades do menu diário para preencher seu gráfico de produtividade!
                      </p>
                    </div>
                  ) : (
                    <ProgressChart completedGroupedByDate={completedGroupedByDate} />
                  )}

                  {/* List of Historic Tasks */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 font-display text-base">
                      {historyDate ? `Tarefas em ${new Date(historyDate + "T12:00:00").toLocaleDateString("pt-BR")}` : "Histórico Geral de Tarefas"}{" "}
                      ({completedHistoryFiltered.length})
                    </h3>

                    <div className="space-y-3 min-h-[150px] pb-10">
                      <AnimatePresence mode="popLayout">
                        {completedHistoryFiltered.length > 0 ? (
                          completedHistoryFiltered.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              categories={categories}
                              onToggleComplete={handleToggleComplete}
                              onDelete={handleDeleteTask}
                              onUpdate={handleUpdateTask}
                              onToggleArchive={handleToggleArchive}
                            />
                          ))
                        ) : (
                          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
                            <h4 className="font-bold font-display text-slate-500 dark:text-slate-400 text-sm">
                              Nenhuma tarefa encontrada nesta data
                            </h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1 leading-relaxed">
                              Suas tarefas ativas ou concluídas residem nesta lista para acompanhamento de sua evolução diária.
                            </p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ) : activeTab === "calendario" ? (
                // Tab 4: Calendar Monthly View
                <CalendarView
                  tasks={tasks}
                  categories={categories}
                  onToggleComplete={handleToggleComplete}
                  setActiveTab={setActiveTab}
                  setHistoryDate={setHistoryDate}
                />
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
                // Tab 3: Archived / Banco de Tarefas View
                <div className="space-y-6">
                  {/* Archived Info Header Banner */}
                  <div className="bg-amber-50/10 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-5 shadow-xs flex gap-4">
                    <Archive className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900 dark:text-amber-500 uppercase tracking-wide flex items-center gap-2 mb-1 font-display">
                        Banco de Tarefas (Arquivadas)
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                        Este é o seu banco de tarefas e ideias secundárias. Tarefas aqui guardadas ficam fora das suas metas diárias ativas e do seu histórico para evitar distrações. Você pode <strong>Desarquivar</strong> (através do ícone de gaveta de arquivo) para trazê-las de volta à sua Fila de Atividades a qualquer momento!
                      </p>
                    </div>
                  </div>

                  {/* List of Archived Tasks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 font-display text-base">
                        Banco de Tarefas ({archivedTasks.length})
                      </h3>
                      {selectedCategory !== "Todas" || selectedPriority !== "Todas" ? (
                        <button
                          onClick={() => {
                            setSelectedCategory("Todas");
                            setSelectedPriority("Todas");
                          }}
                          className="text-xs text-indigo-200 hover:underline font-semibold cursor-pointer"
                        >
                          Limpar Filtros
                        </button>
                      ) : null}
                    </div>

                    <div className="space-y-3 min-h-[150px] pb-10">
                      <AnimatePresence mode="popLayout">
                        {archivedTasks.length > 0 ? (
                          archivedTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              categories={categories}
                              onToggleComplete={handleToggleComplete}
                              onDelete={handleDeleteTask}
                              onUpdate={handleUpdateTask}
                              onToggleArchive={handleToggleArchive}
                            />
                          ))
                        ) : (
                          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
                            <Archive className="w-10 h-10 text-slate-400 dark:text-slate-500 shrink-0 mb-3" />
                            <h4 className="font-bold font-display text-slate-500 dark:text-slate-400 text-sm">
                              Nenhuma tarefa no seu banco
                            </h4>
                            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1 leading-relaxed">
                              Use a fila diária e clique no ícone de arquivamento para guardar ideias, referências ou compromissos futuros aqui neste banco!
                            </p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button (FAB) for mobile additions */}
        <button
          onClick={() => setIsMobileAddOpen(true)}
          className="lg:hidden fixed bottom-20 right-6 z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-800 text-white rounded-full shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Adicionar Tarefa ou Gravar Áudio"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Mobile Task Insertion Slide-up Bottom Sheet */}
        <AnimatePresence>
          {isMobileAddOpen && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileAddOpen(false)}
                className="lg:hidden fixed inset-0 bg-black z-45"
              />
              {/* Bottom Sheet Card */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 z-50 shadow-2xl flex flex-col space-y-5"
              >
                {/* Grab handle bar */}
                <div className="flex justify-center -mt-1.5 mb-1">
                  <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold font-display text-slate-800 dark:text-slate-100 text-sm">Nova Tarefa / Áudio</h3>
                  </div>
                  <button
                    onClick={() => setIsMobileAddOpen(false)}
                    className="p-1.5 bg-slate-200 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Render inputs inside sheet */}
                <div className="space-y-6 pb-6">
                  <AudioRecorder
                    onTasksExtracted={(tasks) => {
                      handleAIRecovery(tasks);
                      // Close the modal after successful audio parsing
                      setIsMobileAddOpen(false);
                    }}
                    onError={(msg) => triggerBanner(msg, "error")}
                  />

                  {recentTranscription && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/40 rounded-2xl p-5">
                      <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center mb-1.5">
                        <Volume2 className="w-3.5 h-3.5 mr-1" /> Transcrição do seu relato
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                        "{recentTranscription}"
                      </p>
                    </div>
                  )}

                  <TaskForm 
                    onAddTask={(task) => {
                      handleAddNewTask(task);
                      // Close sheet on successful add
                      setIsMobileAddOpen(false);
                    }} 
                    categories={categories} 
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Tab Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 flex items-center justify-around px-2">
          <button
            onClick={() => {
              setSelectedCategory("Todas");
              setSelectedPriority("Todas");
              setSearchQuery("");
              setActiveTab("diarias");
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === "diarias"
                ? "text-indigo-650 dark:text-indigo-400 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <CalendarDays className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight">Atividades</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("calendario");
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === "calendario"
                ? "text-indigo-650 dark:text-indigo-400 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight">Calendário</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("notas");
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === "notas"
                ? "text-indigo-650 dark:text-indigo-400 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <StickyNote className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight">Notas</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("listas");
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === "listas"
                ? "text-indigo-650 dark:text-indigo-400 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <ListTodo className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight">Listas</span>
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              isMobileMenuOpen
                ? "text-indigo-650 dark:text-indigo-400 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Menu className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight">Menu</span>
          </button>
        </nav>

        {/* Mobile Menu Slide-over/Drawer Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop (hidden if collapsed to allow interacting with content) */}
              {!isMobileMenuCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="md:hidden fixed inset-0 bg-black z-45"
                />
              )}
              {/* Drawer content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className={`md:hidden fixed inset-y-0 right-0 ${
                  isMobileMenuCollapsed ? "w-16 p-2" : "w-80 p-5"
                } bg-white dark:bg-slate-900 z-50 shadow-2xl flex flex-col space-y-5 border-l border-slate-200 dark:border-slate-800 h-screen overflow-y-auto pb-24 transition-all duration-300`}
              >
                {/* Drawer Header */}
                <div className={`flex ${isMobileMenuCollapsed ? "flex-col items-center gap-4" : "items-center justify-between"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-650 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    {!isMobileMenuCollapsed && (
                      <div>
                        <span className="font-extrabold text-sm tracking-tight font-display text-slate-900 dark:text-slate-100 block">EchoPlan</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Voice Assistant</span>
                      </div>
                    )}
                  </div>
                  <div className={`flex ${isMobileMenuCollapsed ? "flex-col gap-2" : "items-center gap-1.5"}`}>
                    <button
                      onClick={() => setIsMobileMenuCollapsed(!isMobileMenuCollapsed)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 cursor-pointer"
                      title={isMobileMenuCollapsed ? "Expandir menu" : "Encolher menu"}
                    >
                      {isMobileMenuCollapsed ? (
                        <ChevronLeft className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-rose-500 cursor-pointer"
                      title="Esconder menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* User profile */}
                <div className={`${isMobileMenuCollapsed ? "p-1 justify-center" : "p-3 gap-3"} bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center`}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} className="w-10 h-10 rounded-xl shadow-sm object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-650 text-white font-bold text-sm flex items-center justify-center shadow-sm uppercase shrink-0">
                      {user.displayName?.slice(0, 2) || "U"}
                    </div>
                  )}
                  {!isMobileMenuCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.displayName || "Usuário"}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                    </div>
                  )}
                </div>

                {/* Navigation Menu Links */}
                <div className="space-y-1">
                  {!isMobileMenuCollapsed && (
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">Seções do App</div>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedCategory("Todas");
                      setSelectedPriority("Todas");
                      setSearchQuery("");
                      setActiveTab("diarias");
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === "diarias" ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                    title="Fila de Atividades"
                  >
                    <CalendarDays className="w-4 h-4 shrink-0" />
                    {!isMobileMenuCollapsed && <span>Fila de Atividades</span>}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("calendario");
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === "calendario" ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                    title="Calendário Mensal"
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    {!isMobileMenuCollapsed && <span>Calendário Mensal</span>}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("historico");
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === "historico" ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                    title="Histórico de Tarefas"
                  >
                    <History className="w-4 h-4 shrink-0" />
                    {!isMobileMenuCollapsed && <span>Histórico de Tarefas</span>}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("arquivadas");
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      activeTab === "arquivadas" ? "bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-500" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                    title="Banco de Tarefas"
                  >
                    <div className="relative flex items-center justify-center">
                      <Archive className="w-4 h-4 shrink-0 text-amber-500" />
                      {isMobileMenuCollapsed && (
                        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-bold px-1 rounded-full">
                          {tasks.filter((t) => t.archived).length}
                        </span>
                      )}
                    </div>
                    {!isMobileMenuCollapsed && (
                      <>
                        <span>Banco de Tarefas</span>
                        <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                          {tasks.filter((t) => t.archived).length}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action buttons from Sidebar */}
                <div className="space-y-1">
                  {!isMobileMenuCollapsed && (
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1.5">Ações e Planejamento</div>
                  )}

                  <button
                    onClick={() => {
                      generatePlannerImage();
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border border-indigo-100 dark:border-indigo-900/35 bg-indigo-50/20 dark:bg-indigo-950/10`}
                    title="Imprimir Planner"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    {!isMobileMenuCollapsed && <span>Imprimir Planner</span>}
                  </button>

                  <button
                    onClick={() => {
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                      const today = getLocalDateString();
                      const completedTasksToday = tasks.filter((t) => t.completed && getLocalDateStringFromISO(t.updatedAt || t.createdAt) === today);
                      if (completedTasksToday.length === 0) {
                        triggerBanner("Nenhuma tarefa concluída hoje para resumir.", "info");
                        return;
                      }
                      const summary = `Tarefas Concluídas - ${today}\n\n` + completedTasksToday.map((t) => `- ${t.title}`).join("\n");
                      navigator.clipboard.writeText(summary);
                      triggerBanner("Resumo copiado para a área de transferência!", "success");
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer`}
                    title="Copiar Resumo"
                  >
                    <FileDown className="w-4 h-4 shrink-0 text-indigo-600" />
                    {!isMobileMenuCollapsed && <span>Copiar Resumo</span>}
                  </button>

                  <button
                    onClick={() => {
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer`}
                    title="Importar Backup"
                  >
                    <Upload className="w-4 h-4 shrink-0 text-indigo-600" />
                    {!isMobileMenuCollapsed && <span>Importar Backup</span>}
                  </button>

                  <button
                    onClick={() => {
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                      handleExportBackup();
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer`}
                    title="Exportar Backup"
                  >
                    <Download className="w-4 h-4 shrink-0 text-indigo-600" />
                    {!isMobileMenuCollapsed && <span>Exportar Backup</span>}
                  </button>

                  <button
                    onClick={() => {
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                      handleExportCompletedCSV();
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-pointer`}
                    title="Exportar Histórico (CSV)"
                  >
                    <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
                    {!isMobileMenuCollapsed && <span>Exportar Histórico (CSV)</span>}
                  </button>

                  <button
                    onClick={() => {
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                      setIsCategoryModalOpen(true);
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs text-indigo-650 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-dashed border-indigo-200 dark:border-indigo-900/45 cursor-pointer bg-indigo-50/10`}
                    title="Categorias Personalizadas"
                  >
                    <Settings className="w-4 h-4 shrink-0 text-indigo-600" />
                    {!isMobileMenuCollapsed && <span>Categorias Personalizadas</span>}
                  </button>
                </div>

                {/* Settings & Logout */}
                <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                      setDarkMode(!darkMode);
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer`}
                    title={darkMode ? "Modo Claro" : "Modo Escuro"}
                  >
                    {darkMode ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                        {!isMobileMenuCollapsed && <span>Modo Claro</span>}
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
                        {!isMobileMenuCollapsed && <span>Modo Escuro</span>}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer`}
                    title="Configurações Gerais"
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    {!isMobileMenuCollapsed && <span>Configurações Gerais</span>}
                  </button>

                  <button
                    onClick={() => {
                      if (!isMobileMenuCollapsed) setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className={`w-full flex items-center ${isMobileMenuCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2 text-left"} rounded-xl font-bold text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer`}
                    title="Sair da Conta"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {!isMobileMenuCollapsed && <span>Sair da Conta</span>}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      <ConfettiEffect active={isConfettiActive} onComplete={() => setIsConfettiActive(false)} />
    </div>
  </div>
  );
}
