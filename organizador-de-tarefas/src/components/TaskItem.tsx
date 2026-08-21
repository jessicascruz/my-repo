import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  User,
  BookOpen,
  HeartPulse,
  DollarSign,
  Home,
  CheckSquare,
  Tag,
  Clock,
  Trash2,
  Check,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileText,
  GripVertical,
  Plus,
  ListTodo,
  Target,
  Archive,
  Mic,
  Square,
  X,
  Loader2,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Category, Priority, Task } from "../types";
import { ConfirmationModal } from "./ConfirmationModal";
import { Tooltip } from "./Tooltip";

interface TaskItemProps {
  key?: string;
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedFields: Partial<Task>) => void;
  categories: string[];
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  isDraggedOver?: boolean;
  isFocused?: boolean;
  isAnyTaskFocused?: boolean;
  onToggleFocus?: (id: string) => void;
  onToggleArchive?: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  Trabalho: Briefcase,
  Pessoal: User,
  Estudos: BookOpen,
  Saúde: HeartPulse,
  Finanças: DollarSign,
  Casa: Home,
  Geral: CheckSquare,
  Outros: Tag,
};

const CATEGORY_COLORS: Record<string, string> = {
  Trabalho: "bg-blue-50 text-blue-600 border-blue-100",
  Pessoal: "bg-purple-50 text-purple-600 border-purple-100",
  Estudos: "bg-indigo-50 text-indigo-600 border-indigo-100",
  Saúde: "bg-rose-50 text-rose-600 border-rose-100",
  Finanças: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Casa: "bg-amber-50 text-amber-600 border-amber-100",
  Geral: "bg-slate-50 text-slate-600 border-slate-100",
  Outros: "bg-teal-50 text-teal-600 border-teal-100",
};

const PRIORITY_BADGES: Record<Priority, string> = {
  Alta: "bg-rose-100 text-rose-700 border-rose-200",
  Média: "bg-amber-100 text-amber-700 border-amber-200",
  Baixa: "bg-slate-100 text-slate-600 border-slate-200",
};

const WEEKDAY_ABBRS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const WEEK_DAYS = [
  { value: 1, label: "S", fullName: "Segunda-feira" },
  { value: 2, label: "T", fullName: "Terça-feira" },
  { value: 3, label: "Q", fullName: "Quarta-feira" },
  { value: 4, label: "Q", fullName: "Quinta-feira" },
  { value: 5, label: "S", fullName: "Sexta-feira" },
  { value: 6, label: "S", fullName: "Sábado" },
  { value: 0, label: "D", fullName: "Domingo" },
];

export function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onUpdate,
  categories,
  isDraggable,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDraggedOver,
  isFocused,
  isAnyTaskFocused,
  onToggleFocus,
  onToggleArchive,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editCategory, setEditCategory] = useState<Category>(task.category);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editTime, setEditTime] = useState(task.reminderTime || "");
  const [hasReminder, setHasReminder] = useState(!!task.reminderTime);
  const [editReminderDays, setEditReminderDays] = useState<number[]>(task.reminderDays || []);
  const [editTags, setEditTags] = useState<string[]>(task.tags || []);
  const [editTagInput, setEditTagInput] = useState("");
  const [newTagText, setNewTagText] = useState("");
  const [editIsRecurring, setEditIsRecurring] = useState(!!task.isRecurring);
  const [editRecurrence, setEditRecurrence] = useState<"diario" | "semanal" | "mensal">(task.recurrence || "diario");

  const [isEditingTitleInline, setIsEditingTitleInline] = useState(false);
  const [inlineTitleValue, setInlineTitleValue] = useState(task.title);

  const handleSaveInlineTitle = () => {
    if (inlineTitleValue.trim() && inlineTitleValue.trim() !== task.title) {
      onUpdate(task.id, {
        title: inlineTitleValue.trim(),
        updatedAt: new Date().toISOString(),
      });
      setEditTitle(inlineTitleValue.trim());
    } else {
      setInlineTitleValue(task.title);
    }
    setIsEditingTitleInline(false);
  };

  const handleDoubleClickTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.completed) return;
    setInlineTitleValue(task.title);
    setIsEditingTitleInline(true);
  };

  // Expanded Notes & Metadata State
  const [isExpanded, setIsExpanded] = useState(false);
  const [notesText, setNotesText] = useState(task.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
  const [isDueSoon, setIsDueSoon] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const prevCompletedRef = useRef(task.completed);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [subtaskError, setSubtaskError] = useState<string | null>(null);

  const suggestSubtasks = async () => {
    setIsSuggesting(true);
    try {
      const response = await fetch("/api/tasks/suggest-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: task.title }),
      });
      
      const contentType = response.headers.get("content-type");
      let data: any;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Resposta do servidor não-JSON:", text);
        throw new Error("Resposta inválida do servidor. Verifique se a chave da API (GEMINI_API_KEY) está configurada corretamente.");
      }
      
      if (!response.ok) {
        throw new Error(data.error || data.message || "Falha ao sugerir subtarefas");
      }
      
      if (!data.subtasks || !Array.isArray(data.subtasks)) {
        throw new Error("Formato de resposta inválido do Gemini (lista de subtarefas ausente).");
      }
      
      const newSubtasks = data.subtasks.map((title: string) => ({
        id: Math.random().toString(36).substring(2, 9),
        title,
        completed: false,
      }));
      
      onUpdate(task.id, {
        subtasks: [...(task.subtasks || []), ...newSubtasks],
        updatedAt: new Date().toISOString(),
      });
      setSubtaskError(null);
      if (!isExpanded) setIsExpanded(true);
    } catch (err: any) {
      console.error(err);
      setSubtaskError(err.message || "Erro ao sugerir subtarefas.");
    } finally {
      setIsSuggesting(false);
    }
  };

  // Focus timer state
  const [timerDuration, setTimerDuration] = useState(25); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0); // seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timeRemaining === 0 && isTimerRunning) setIsTimerRunning(false); // Finished
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timeRemaining]);

  const startTimer = () => {
    setTimeRemaining(timerDuration * 60);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    if (task.completed && !prevCompletedRef.current) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 1000);
    }
    prevCompletedRef.current = task.completed;
  }, [task.completed]);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState<string>("");

  // Quick Note Audio Recording States
  const [isRecordingNote, setIsRecordingNote] = useState(false);
  const [recordingNoteDuration, setRecordingNoteDuration] = useState(0);
  const [isTranscribingNote, setIsTranscribingNote] = useState(false);
  const [noteTranscriptText, setNoteTranscriptText] = useState("");

  // Refs for audio processing
  const noteMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const noteAudioChunksRef = useRef<Blob[]>([]);
  const noteTimerRef = useRef<any>(null);
  const noteAudioBlobRef = useRef<Blob | null>(null);
  const noteRecognitionRef = useRef<any>(null);

  const startNoteRecording = async () => {
    try {
      noteAudioChunksRef.current = [];
      noteAudioBlobRef.current = null;
      setNoteTranscriptText("");
      setRecordingNoteDuration(0);

      // Expand note if not expanded, so they can see the input field feedback
      setIsExpanded(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let options = { mimeType: "audio/webm" };
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/ogg" };
      }
      if (!MediaRecorder.isTypeSupported("audio/ogg")) {
        options = { mimeType: "" };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      noteMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          noteAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(noteAudioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        noteAudioBlobRef.current = audioBlob;

        // Clean up tracks
        stream.getTracks().forEach((track) => track.stop());

        // Process audio automatically on stop
        processNoteAudio(audioBlob, noteTranscriptText);
      };

      mediaRecorder.start();
      setIsRecordingNote(true);

      // Web Speech API for live preview and offline fallback
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = "pt-BR";
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event: any) => {
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              finalTranscript += event.results[i][0].transcript;
            }
            if (finalTranscript) {
              setNoteTranscriptText(finalTranscript);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn("Note speech recognition error:", e.error);
          };

          noteRecognitionRef.current = recognition;
          recognition.start();
        } catch (recognitionErr) {
          console.warn("Note Speech recognition start failed:", recognitionErr);
        }
      }

      noteTimerRef.current = setInterval(() => {
        setRecordingNoteDuration((prev) => prev + 1);
      }, 1000);
      setNoteError(null);
    } catch (err: any) {
      console.error("Error accessing microphone for note:", err);
      setNoteError("Não foi possível acessar seu microfone. Por favor, dê permissão de áudio.");
    }
  };

  const stopNoteRecording = () => {
    if (noteMediaRecorderRef.current && isRecordingNote) {
      noteMediaRecorderRef.current.stop();
      setIsRecordingNote(false);
      if (noteTimerRef.current) {
        clearInterval(noteTimerRef.current);
      }
    }
    if (noteRecognitionRef.current) {
      try {
        noteRecognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping note speech recognition:", err);
      }
    }
  };

  const cancelNoteRecording = () => {
    if (noteMediaRecorderRef.current && isRecordingNote) {
      // Temporarily clear onstop so it doesn't process
      noteMediaRecorderRef.current.onstop = null;
      noteMediaRecorderRef.current.stop();
    }
    if (noteRecognitionRef.current) {
      try {
        noteRecognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping note speech recognition on cancel:", err);
      }
    }
    setIsRecordingNote(false);
    if (noteTimerRef.current) {
      clearInterval(noteTimerRef.current);
    }
    setNoteTranscriptText("");
    setRecordingNoteDuration(0);
    noteAudioChunksRef.current = [];
    noteAudioBlobRef.current = null;
  };

  const formatNoteTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const appendNoteToText = (textToAppend: string) => {
    const currentNotes = notesText.trim();
    const formattedAppend = `[Nota de Voz]: ${textToAppend}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n\n${formattedAppend}` : formattedAppend;
    setNotesText(updatedNotes);
    onUpdate(task.id, {
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    });
  };

  const processNoteAudio = async (audioBlob: Blob, fallbackText: string) => {
    setIsTranscribingNote(true);
    setNoteError(null);
    try {
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = (e) => reject(e);
      });

      const response = await fetch("/api/tasks/transcribe-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioData: base64Audio,
          mimeType: audioBlob.type,
        }),
      });

      let result: any;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch (jsonErr) {
        if (fallbackText && fallbackText.trim()) {
          appendNoteToText(fallbackText);
          return;
        }
        if (response.status === 403) {
          setNoteError("Não foi possível transcrever o áudio por IA (Erro 403 - Chave Gemini não configurada). Como seu microfone não capturou transcrição local, digite na anotação!");
          return;
        }
        const isHtml = responseText.includes("<!doctype html") || responseText.includes("<html");
        const detail = isHtml ? `Servidor indisponível ou em reinicialização (Status ${response.status})` : responseText.trim() ? `Texto: ${responseText.slice(0, 100)}` : "Resposta do servidor vazia.";
        setNoteError(`Erro na resposta do servidor de transcrição. ${detail}`);
        return;
      }

      if (!response.ok) {
        if (fallbackText && fallbackText.trim()) {
          appendNoteToText(fallbackText);
          return;
        }
        setNoteError(result.message || result.error || "Falha na transcrição.");
        return;
      }

      if (result.transcription && result.transcription.trim()) {
        appendNoteToText(result.transcription.trim());
      } else if (fallbackText && fallbackText.trim()) {
        appendNoteToText(fallbackText);
      } else {
        setNoteError("Não foi possível transcrever nada do seu áudio.");
      }
    } catch (err: any) {
      console.error(err);
      if (fallbackText && fallbackText.trim()) {
        appendNoteToText(fallbackText);
      } else {
        setNoteError("Ops! " + (err.message || "Erro de conexão ao transcrever áudio por IA."));
      }
    } finally {
      setIsTranscribingNote(false);
    }
  };

  // Ensure clean up of running timers when component unmounts
  useEffect(() => {
    return () => {
      if (noteTimerRef.current) {
        clearInterval(noteTimerRef.current);
      }
    };
  }, []);

  // Keep notes synchronized when changed outside
  useEffect(() => {
    setNotesText(task.notes || "");
  }, [task.notes]);

  // Keep title synchronized when changed outside
  useEffect(() => {
    setEditTitle(task.title);
    setInlineTitleValue(task.title);
  }, [task.title]);

  // Keep recurrence synchronized when changed outside
  useEffect(() => {
    setEditIsRecurring(!!task.isRecurring);
    setEditRecurrence(task.recurrence || "diario");
  }, [task.isRecurring, task.recurrence]);

  // Dynamic status evaluation for scheduled reminders on the present day
  useEffect(() => {
    if (task.completed || !task.reminderTime) {
      setIsOverdue(false);
      setIsDueSoon(false);
      return;
    }

    const checkOverdue = () => {
      const now = new Date();
      if (task.reminderDays && task.reminderDays.length > 0) {
        const currentDayOfWeek = now.getDay();
        if (!task.reminderDays.includes(currentDayOfWeek)) {
          setIsOverdue(false);
          setIsDueSoon(false);
          return;
        }
      }

      const currentHour = now.getHours();
      const currentMin = now.getMinutes();

      const parts = task.reminderTime!.split(":");
      const h = Number(parts[0]);
      const m = Number(parts[1]);

      if (!isNaN(h) && !isNaN(m)) {
        const totalNowMinutes = currentHour * 60 + currentMin;
        const totalReminderMinutes = h * 60 + m;
        const diff = totalReminderMinutes - totalNowMinutes;

        if (totalNowMinutes > totalReminderMinutes) {
          setIsOverdue(true);
          setIsDueSoon(false);
        } else if (diff >= 0 && diff <= 60) {
          setIsOverdue(false);
          setIsDueSoon(true);
        } else {
          setIsOverdue(false);
          setIsDueSoon(false);
        }
      }
    };

    checkOverdue();
    const interval = setInterval(checkOverdue, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [task.completed, task.reminderTime, task.reminderDays]);

  const IconComponent = CATEGORY_ICONS[task.category] || Tag;

  const getCategoryColor = (cat: string) => {
    if (CATEGORY_COLORS[cat]) {
      return CATEGORY_COLORS[cat];
    }
    // Dynamic naming fallback colors
    const colors = [
      "bg-teal-50 text-teal-600 border-teal-100",
      "bg-cyan-50 text-cyan-600 border-cyan-100",
      "bg-emerald-50 text-emerald-600 border-emerald-100",
      "bg-orange-50 text-orange-700 border-orange-100",
      "bg-pink-50 text-pink-600 border-pink-100",
      "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
      "bg-sky-50 text-sky-600 border-sky-100",
    ];
    let hash = 0;
    for (let i = 0; i < cat.length; i++) {
      hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate(task.id, {
      title: editTitle.trim(),
      category: editCategory,
      priority: editPriority,
      reminderTime: hasReminder && editTime ? editTime : null,
      reminderDays: hasReminder && editTime && editReminderDays.length > 0 ? editReminderDays : undefined,
      tags: editTags,
      isRecurring: editIsRecurring,
      recurrence: editIsRecurring ? editRecurrence : null,
      updatedAt: new Date().toISOString(),
      reminderTriggered:
        hasReminder && editTime === task.reminderTime
          ? task.reminderTriggered
          : false,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditPriority(task.priority);
    setEditTime(task.reminderTime || "");
    setHasReminder(!!task.reminderTime);
    setEditReminderDays(task.reminderDays || []);
    setEditTags(task.tags || []);
    setEditTagInput("");
    setEditIsRecurring(!!task.isRecurring);
    setEditRecurrence(task.recurrence || "diario");
    setIsEditing(false);
  };

  const handleAddTagToTask = (tag: string) => {
    const currentTags = task.tags || [];
    if (tag && !currentTags.includes(tag)) {
      onUpdate(task.id, {
        tags: [...currentTags, tag],
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleRemoveTagFromTask = (tagToRemove: string) => {
    const currentTags = task.tags || [];
    onUpdate(task.id, {
      tags: currentTags.filter((tg) => tg !== tagToRemove),
      updatedAt: new Date().toISOString()
    });
  };

  const handleSaveNotes = () => {
    onUpdate(task.id, {
      notes: notesText.trim() === "" ? undefined : notesText.trim(),
      updatedAt: new Date().toISOString(),
    });
    setIsSavingNotes(true);
    setTimeout(() => {
      setIsSavingNotes(false);
    }, 2000);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: Math.random().toString(36).substring(2, 9),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    const currentSubtasks = task.subtasks || [];
    onUpdate(task.id, {
      subtasks: [...currentSubtasks, newSubtask],
      updatedAt: new Date().toISOString(),
    });
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const currentSubtasks = task.subtasks || [];
    const updatedSubtasks = currentSubtasks.map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );
    onUpdate(task.id, {
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const currentSubtasks = task.subtasks || [];
    const updatedSubtasks = currentSubtasks.filter((sub) => sub.id !== subtaskId);
    onUpdate(task.id, {
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateSubtaskTitle = (subtaskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const currentSubtasks = task.subtasks || [];
    const updatedSubtasks = currentSubtasks.map((sub) =>
      sub.id === subtaskId ? { ...sub, title: newTitle.trim() } : sub
    );
    onUpdate(task.id, {
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    });
    setEditingSubtaskId(null);
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      draggable={!task.completed && isDraggable}
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver && onDragOver(e, task.id);
      }}
      onDragEnd={(e) => onDragEnd && onDragEnd(e)}
      onDrop={(e) => onDrop && onDrop(e, task.id)}
      className={`bg-white dark:bg-slate-900 rounded-xl border p-4 transition-all relative group ${
        task.completed
          ? "border-slate-100 dark:border-slate-800/20 bg-slate-50/50 dark:bg-slate-950/20"
          : isDraggedOver
          ? "border-indigo-500 bg-indigo-100 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-md"
          : isFocused
          ? "border-amber-400 bg-amber-50/15 dark:bg-amber-950/20 ring-2 ring-amber-400/25 shadow-md"
          : isOverdue
          ? "border-rose-500 bg-rose-50/5 dark:bg-rose-950/10 ring-1 ring-rose-500/20 shadow-xs hover:border-rose-600"
          : "border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900"
      } ${!task.completed && isDraggable ? "hover:cursor-default" : ""}`}
    >
      {showAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-white/60 backdrop-blur-sm rounded-xl">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-emerald-500"
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{
                opacity: 0,
                x: Math.cos((i * 30 * Math.PI) / 180) * 80,
                y: Math.sin((i * 30 * Math.PI) / 180) * 80,
                scale: 0,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ))}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle className="text-emerald-500 w-16 h-16" />
          </motion.div>
        </div>
      )}
      {isEditing ? (
        <div 
          className="space-y-3"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
        >
          {/* Edit Title */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Título
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          {/* Edit Options */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Categoria
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Category)}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Prioridade
              </label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          {/* Edit Tags */}
          <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Tags / Marcadores (Enter ou vírgula para cadastrar)
            </label>
            <div className="flex border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg px-2 py-1 items-center focus-within:ring-1 focus-within:ring-indigo-600 transition-all">
              <input
                type="text"
                value={editTagInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.endsWith(",")) {
                    const cleaned = val.slice(0, -1).trim();
                    if (cleaned && !editTags.includes(cleaned)) {
                      setEditTags([...editTags, cleaned]);
                    }
                    setEditTagInput("");
                  } else {
                    setEditTagInput(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const cleaned = editTagInput.trim();
                    if (cleaned && !editTags.includes(cleaned)) {
                      setEditTags([...editTags, cleaned]);
                    }
                    setEditTagInput("");
                  }
                }}
                placeholder="Adicionar nova tag..."
                className="w-full text-xs bg-transparent border-none p-0.5 focus:outline-none focus:ring-0 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-600"
              />
              {editTagInput.trim() && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const cleaned = editTagInput.trim();
                    if (cleaned && !editTags.includes(cleaned)) {
                      setEditTags([...editTags, cleaned]);
                    }
                    setEditTagInput("");
                  }}
                  className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-650 font-bold px-2 py-0.5 rounded transition-all cursor-pointer select-none shrink-0"
                >
                  Ok
                </button>
              )}
            </div>
            {editTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {editTags.map((tg) => (
                  <span
                    key={tg}
                    className="inline-flex items-center text-[10px] font-bold bg-indigo-50/70 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 rounded-full px-2 py-0.5"
                  >
                    #{tg}
                    <button
                      type="button"
                      onClick={() => setEditTags(editTags.filter((tKey) => tKey !== tg))}
                      className="ml-1 text-indigo-400 hover:text-indigo-650 dark:hover:text-indigo-200 transition-colors focus:outline-none"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Edit Reminder */}
          <div className="flex flex-col space-y-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReminder}
                  onChange={(e) => setHasReminder(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-650"
                />
                <span>Ativar lembrete</span>
              </label>
              {hasReminder && (
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                />
              )}
            </div>

            {hasReminder && (
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Dias de Repetição:
                </span>
                <div className="flex flex-wrap gap-1">
                  {WEEK_DAYS.map((day) => {
                    const isSelected = editReminderDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          setEditReminderDays((prev) =>
                            prev.includes(day.value)
                              ? prev.filter((d) => d !== day.value)
                              : [...prev, day.value]
                          );
                        }}
                        className={`w-6 h-6 rounded text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer select-none border ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                        title={day.fullName}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">
                  {editReminderDays.length === 0
                    ? "✓ Todos os dias"
                    : `✓ Apenas: ${editReminderDays
                        .map((dayVal) => WEEK_DAYS.find((d) => d.value === dayVal)?.fullName.split("-")[0])
                        .join(", ")}`}
                </p>
              </div>
            )}
          </div>

          {/* Edit Recurrence */}
          <div className="flex flex-col space-y-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsRecurring}
                  onChange={(e) => setEditIsRecurring(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-650"
                />
                <span>Tarefa Recorrente</span>
              </label>
              {editIsRecurring && (
                <select
                  value={editRecurrence}
                  onChange={(e) => setEditRecurrence(e.target.value as any)}
                  className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="diario">Diário</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              )}
            </div>
          </div>

          {/* Edit Actions */}
          <div className="flex justify-end space-x-2 pt-1">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="Ctrl + Enter para Salvar"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar</span>
              <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 text-[8px] font-mono font-bold bg-indigo-700 text-indigo-200 rounded border border-indigo-500/30">
                Ctrl+⏎
              </kbd>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-start justify-between space-x-3">
            {/* Left Checkbox & Text Area to Expand */}
            <div className="flex items-start space-x-3 min-w-0 flex-1">
              {!task.completed && isDraggable && (
                <Tooltip content="Clique e arraste este marcador para reordenar esta tarefa manualmente." position="top">
                  <div 
                    className="mt-1.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-0.5 select-none transition-colors duration-150"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                </Tooltip>
              )}

              <Tooltip
                content={task.completed ? "Reajustar tarefa como pendente e mover de volta para a fila." : "Concluir tarefa e arquivar no histórico de progresso diário."}
                position="top"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                    task.completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 hover:border-indigo-500"
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              </Tooltip>

              <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="min-w-0 flex-1 cursor-pointer select-none"
                title="Clique para expandir notas e informações"
              >
                <div className="flex items-center gap-1.5">
                  {isEditingTitleInline ? (
                    <input
                      type="text"
                      value={inlineTitleValue}
                      onChange={(e) => setInlineTitleValue(e.target.value)}
                      onBlur={handleSaveInlineTitle}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveInlineTitle();
                        } else if (e.key === "Escape") {
                          setIsEditingTitleInline(false);
                          setInlineTitleValue(task.title);
                        }
                      }}
                      className="px-2 py-0.5 text-xs font-semibold border border-indigo-400 dark:border-indigo-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-w-[200px]"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h4
                      onDoubleClick={handleDoubleClickTitle}
                      className={`text-sm font-semibold transition-all break-words leading-snug cursor-text ${
                        task.completed
                          ? "text-slate-400 dark:text-slate-500 line-through decoration-emerald-500/35"
                          : "text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                      }`}
                      title="Clique duplo para renomear rapidamente"
                    >
                      {task.title}
                    </h4>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 inline-block shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 inline-block shrink-0" />
                  )}
                </div>

                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  {/* Category Badge */}
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(
                      task.category
                    )}`}
                  >
                    <IconComponent className="w-3 h-3 mr-1 shrink-0" />
                    {task.category}
                  </span>

                  {/* Priority Badge */}
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      PRIORITY_BADGES[task.priority]
                    }`}
                  >
                    {task.priority === "Alta" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 shrink-0" />
                    )}
                    {task.priority === "Média" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 shrink-0" />
                    )}
                    {task.priority === "Baixa" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1 shrink-0" />
                    )}
                    {task.priority}
                  </span>

                  {/* Reminder Badge */}
                  {task.reminderTime && (
                    <span
                      className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        task.completed
                          ? "bg-slate-50 text-slate-400 border-slate-100"
                          : isOverdue
                          ? "bg-rose-100 text-rose-700 border-rose-300 animate-pulse font-bold"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1 text-rose-500 shrink-0" />
                      <span>
                        {task.reminderTime} {isOverdue && "(Atrasada!)"}{" "}
                        {task.reminderDays && task.reminderDays.length > 0
                          ? `(${task.reminderDays.map((d) => WEEKDAY_ABBRS[d]).join(",")})`
                          : "(Diário)"}
                      </span>
                    </span>
                  )}

                  {/* Warning Badge for Due Soon (< 1h) */}
                  {!task.completed && isDueSoon && (
                    <span
                      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 animate-pulse"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500 dark:text-amber-400 shrink-0" />
                      <span>Lembrete em breve! (&lt; 1h)</span>
                    </span>
                  )}

                  {/* Recurrence Badge */}
                  {task.isRecurring && (
                    <span
                      className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        task.completed
                          ? "bg-slate-50 text-slate-400 border-slate-100"
                          : "bg-indigo-50 text-indigo-650 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                      }`}
                    >
                      <RefreshCw className="w-3 h-3 mr-1 text-indigo-500 dark:text-indigo-400 shrink-0" />
                      <span className="capitalize">
                        Recorrente ({task.recurrence === "diario" ? "Diário" : task.recurrence === "semanal" ? "Semanal" : "Mensal"})
                      </span>
                    </span>
                  )}

                  {/* Tags Badges */}
                  {task.tags && task.tags.length > 0 && task.tags.map((tg) => (
                    <span
                      key={tg}
                      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50/50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-xs leading-none"
                    >
                      <Tag className="w-2.5 h-2.5 mr-1 text-indigo-400 dark:text-indigo-500 shrink-0" />
                      {tg}
                    </span>
                  ))}

                  {/* Has Notes Badge indicator */}
                  {task.notes && (
                    <span className="bg-indigo-50/50 text-indigo-700 border border-indigo-100 inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded">
                      <FileText className="w-2.5 h-2.5 mr-0.5 text-indigo-500" />
                      Com descrição
                    </span>
                  )}

                  {/* Subtasks Progress Badge */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span className="bg-emerald-50/70 text-emerald-700 border border-emerald-100 inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded">
                      <ListTodo className="w-2.5 h-2.5 mr-1 text-emerald-500" />
                      {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtarefas
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex space-x-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              {!task.completed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      suggestSubtasks();
                    }}
                    disabled={isSuggesting}
                    className="p-1 px-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                    title="Sugerir subtarefas via I.A."
                  >
                    {isSuggesting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Target className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline select-none">Sugerir Foco</span>
                  </button>
              )}
              {!task.completed && onToggleFocus && (
                <div className="flex items-center gap-2">
                   {isFocused && (
                      <div className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-2 py-0.5">
                        {isTimerRunning ? (
                          <span className="font-mono text-xs font-bold text-amber-700">
                             {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={timerDuration}
                            onChange={(e) => setTimerDuration(parseInt(e.target.value) || 1)}
                            className="w-8 text-xs text-center border-none focus:ring-0 p-0"
                          />
                        )}
                        <button
                          onClick={isTimerRunning ? () => setIsTimerRunning(false) : startTimer}
                          className="text-[10px] font-bold text-amber-700 cursor-pointer hover:underline"
                        >
                          {isTimerRunning ? "Stop" : "Start"}
                        </button>
                      </div>
                   )}
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFocus(task.id);
                    }}
                    className={`p-1 px-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                      isFocused
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        : "text-slate-400 hover:text-amber-600 hover:bg-slate-50"
                    }`}
                    title={isFocused ? "Parar de focar nesta atividade" : "Focar nesta atividade"}
                  >
                    <Target className={`w-3.5 h-3.5 ${isFocused ? "animate-pulse text-amber-700" : ""}`} />
                    <span className="text-[10px] hidden sm:inline select-none">
                      {isFocused ? "Focado" : "Focar"}
                    </span>
                  </button>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 px-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {onToggleArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleArchive(task.id);
                  }}
                  className={`p-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
                    task.archived
                      ? "text-amber-700 hover:text-amber-700 bg-amber-50 hover:bg-amber-100"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
                  title={task.archived ? "Desarquivar (mover de volta)" : "Arquivar tarefa"}
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmingDelete(true);
                }}
                className="p-1 px-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Field Container */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 overflow-hidden"
              >
                {/* Dates Information Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[9px]">
                        Criada em
                      </span>
                      <span>{formatDateTime(task.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider text-[9px]">
                        Última alteração
                      </span>
                      <span>
                        {task.updatedAt
                          ? formatDateTime(task.updatedAt)
                          : "Sem alterações ainda"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description Input Field */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Descrição / Detalhes da Tarefa
                    </label>
                    {!task.completed && !isRecordingNote && !isTranscribingNote && (
                      <button
                        type="button"
                        onClick={startNoteRecording}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-900/40"
                        title="Gravar nota de voz rápida e anexar à descrição"
                      >
                        <Mic className="w-3 h-3 text-indigo-600" />
                        <span>Gravar Nota Rápida</span>
                      </button>
                    )}
                  </div>

                  {isRecordingNote && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/45 rounded-xl p-3 mb-2 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                          <Mic className="w-3.5 h-3.5 text-rose-600 relative z-10" />
                        </div>
                        <span className="text-[11px] font-semibold text-rose-700 whitespace-nowrap">
                          Gravando nota: <span className="font-mono font-bold">{formatNoteTime(recordingNoteDuration)}</span>
                        </span>
                        {noteTranscriptText && (
                          <span className="text-[10px] text-slate-500 italic truncate max-w-[120px] sm:max-w-[200px]">
                            "{noteTranscriptText}"
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={stopNoteRecording}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Square className="w-2.5 h-2.5 fill-white pb-0.5 animate-none" />
                          <span>Concluir</span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelNoteRecording}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Cancelar gravação"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {isTranscribingNote && (
                    <div className="bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-3 mb-2 flex items-center gap-2.5 shadow-xs animate-pulse">
                      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400">
                        O Gemini está transcrevendo e anexando sua nota de voz...
                      </span>
                    </div>
                  )}

                  {noteError && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3 mb-2 flex items-center justify-between gap-2.5 shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-medium text-rose-700 dark:text-rose-500 leading-relaxed">
                          {noteError}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNoteError(null)}
                        className="text-rose-500 hover:text-rose-700 p-1 transition-colors rounded-lg flex-shrink-0 cursor-pointer"
                        title="Fechar aviso"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    onBlur={handleSaveNotes}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        handleSaveNotes();
                      }
                    }}
                    placeholder="Escreva a descrição desta tarefa, metas ou referências adicionais..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 shadow-xs resize-none transition-all placeholder:text-slate-400 dark:text-slate-200"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-slate-400 font-medium font-sans">
                      {isSavingNotes ? "⏳ Gravando descrição..." : "✔ Salvo automaticamente ao clicar fora"}
                    </span>
                    <button
                      type="submit"
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                      title="Ctrl + Enter para Salvar Descrição"
                    >
                      <span>Salvar Descrição</span>
                      <kbd className="hidden sm:inline-block px-1 py-0.2 text-[8px] font-mono font-bold bg-slate-800 dark:bg-slate-700 text-slate-300 rounded border border-slate-700/50">
                        Ctrl+⏎
                      </kbd>
                    </button>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    Tags / Marcadores da Atividade
                  </label>
                  
                  {/* Tags list inside expanded panel */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {(!task.tags || task.tags.length === 0) ? (
                      <p className="text-xs text-slate-500 dark:text-slate-500 italic py-1 font-sans">
                        Nenhuma tag associada a esta tarefa. Adicione abaixo para melhor organização!
                      </p>
                    ) : (
                      task.tags.map((tg) => (
                        <span
                          key={tg}
                          className="inline-flex items-center text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-full px-2.5 py-0.5"
                        >
                          #{tg}
                          <button
                            type="button"
                            onClick={() => handleRemoveTagFromTask(tg)}
                            className="ml-1 text-slate-500 hover:text-rose-500 transition-colors focus:outline-none"
                            title={`Excluir tag ${tg}`}
                          >
                            <X className="w-2.5 h-2.5 hover:scale-110" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Tag Inline form */}
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      value={newTagText}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.endsWith(",")) {
                          const cleaned = val.slice(0, -1).trim();
                          if (cleaned) {
                            handleAddTagToTask(cleaned);
                          }
                          setNewTagText("");
                        } else {
                          setNewTagText(val);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = newTagText.trim();
                          if (val) {
                            handleAddTagToTask(val);
                          }
                          setNewTagText("");
                        }
                      }}
                      placeholder="Nova tag... (pressione Enter ou vírgula)"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-700"
                    />
                    {newTagText.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          const val = newTagText.trim();
                          if (val) {
                            handleAddTagToTask(val);
                          }
                          setNewTagText("");
                        }}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border border-transparent"
                      >
                        Vincular
                      </button>
                    )}
                  </div>
                </div>

                {/* Subtasks Component */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  {subtaskError && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3 mb-2 flex items-center justify-between gap-2.5 shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-medium text-rose-700 dark:text-rose-500 leading-relaxed">
                          {subtaskError}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubtaskError(null)}
                        className="text-rose-500 hover:text-rose-700 p-1 transition-colors rounded-lg flex-shrink-0 cursor-pointer"
                        title="Fechar aviso"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-indigo-500" />
                      Subtarefas ({(task.subtasks || []).filter(s => s.completed).length}/{(task.subtasks || []).length})
                    </label>
                    {(task.subtasks || []).length > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5">
                        {Math.round(
                          (((task.subtasks || []).filter(s => s.completed).length) /
                            (task.subtasks || []).length) *
                            100
                        )}
                        % Concluído
                      </span>
                    )}
                  </div>

                  {/* Subtask Progress Bar */}
                  {(task.subtasks || []).length > 0 && (
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (((task.subtasks || []).filter(s => s.completed).length) /
                              (task.subtasks || []).length) *
                            100
                          }%`,
                        }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  )}

                  {/* Subtask List container */}
                  <div className="space-y-1 max-h-48 overflow-y-auto mb-3 pr-1">
                    {(task.subtasks || []).length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 text-center bg-slate-50/50 dark:bg-slate-950/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                        Nenhuma subtarefa criada ainda. Adicione uma no campo abaixo!
                      </p>
                    ) : (
                      (task.subtasks || []).slice().sort((a, b) => Number(a.completed) - Number(b.completed)).map((sub) => (
                        <div
                          key={sub.id}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingSubtaskId(sub.id);
                            setEditingSubtaskTitle(sub.title);
                          }}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group/sub transition-all cursor-pointer"
                        >
                          {editingSubtaskId === sub.id ? (
                            <div className="flex-1 flex items-center gap-2 min-w-0" onDoubleClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingSubtaskTitle}
                                onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleUpdateSubtaskTitle(sub.id, editingSubtaskTitle);
                                  } else if (e.key === "Escape") {
                                    setEditingSubtaskId(null);
                                  }
                                }}
                                onBlur={() => handleUpdateSubtaskTitle(sub.id, editingSubtaskTitle)}
                                className="flex-1 px-2 py-0.5 text-xs border border-indigo-400 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => handleToggleSubtask(sub.id)}
                                className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                                  sub.completed
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-indigo-500 dark:hover:border-indigo-400"
                                }`}
                              >
                                {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </button>
                              <span
                                onClick={() => handleToggleSubtask(sub.id)}
                                className={`text-xs select-none cursor-pointer truncate flex-1 ${
                                  sub.completed ? "line-through text-slate-400 dark:text-slate-600" : "text-slate-800 dark:text-slate-300 font-medium"
                                }`}
                                title="De dois cliques para editar"
                              >
                                {sub.title}
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(sub.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md opacity-0 group-hover/sub:opacity-100 focus:opacity-100 transition-opacity cursor-pointer shrink-0"
                            title="Excluir subtarefa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Inline Creation Form */}
                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Nova subtarefa... (pressione Enter para criar)"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                    <Tooltip content="Adicionar nova etapa para planejar" position="left">
                      <button
                        type="submit"
                        disabled={!newSubtaskTitle.trim()}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-45 disabled:pointer-events-none text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Adicionar</span>
                      </button>
                    </Tooltip>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ConfirmationModal
            isOpen={isConfirmingDelete}
            onClose={() => setIsConfirmingDelete(false)}
            onConfirm={() => onDelete(task.id)}
            title="Excluir Atividade"
            message={`Are you sure you want to delete this? (Esta atividade "${task.title}" será removida permanentemente)`}
            confirmText="Excluir"
            cancelText="Cancelar"
          />
        </div>
      )}
    </motion.div>
  );
}
