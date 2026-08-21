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
  Trash2,
  Check,
  Edit2,
  ChevronDown,
  ChevronUp,
  FileText,
  GripVertical,
  Plus,
  ListTodo,
  Target,
  Archive,
  Mic,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Priority, Task } from "../types";
import { ConfirmationModal } from "./ConfirmationModal";
import { TaskItemEdit } from "./TaskItemEdit";
import { fundoPrioridade } from "../lib/ui";
import * as ui from "../lib/ui";

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

const WEEKDAY_ABBRS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

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
  onToggleFocus,
  onToggleArchive,
}: TaskItemProps) {
  // O estado de rascunho da edição mora em TaskItemEdit — aqui só o interruptor.
  const [isEditing, setIsEditing] = useState(false);
  const [newTagText, setNewTagText] = useState("");

  const [isEditingTitleInline, setIsEditingTitleInline] = useState(false);
  const [inlineTitleValue, setInlineTitleValue] = useState(task.title);

  const handleSaveInlineTitle = () => {
    if (inlineTitleValue.trim() && inlineTitleValue.trim() !== task.title) {
      onUpdate(task.id, {
        title: inlineTitleValue.trim(),
        updatedAt: new Date().toISOString(),
      });
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
    setInlineTitleValue(task.title);
  }, [task.title]);

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

  const IconeCategoria = CATEGORY_ICONS[task.category] || Tag;

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleString("pt-BR", {
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

  const handleAddTagToTask = (tag: string) => {
    const currentTags = task.tags || [];
    if (tag && !currentTags.includes(tag)) {
      onUpdate(task.id, { tags: [...currentTags, tag], updatedAt: new Date().toISOString() });
    }
  };

  const handleRemoveTagFromTask = (tagToRemove: string) => {
    onUpdate(task.id, {
      tags: (task.tags || []).filter((tg) => tg !== tagToRemove),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveNotes = () => {
    onUpdate(task.id, {
      notes: notesText.trim() === "" ? undefined : notesText.trim(),
      updatedAt: new Date().toISOString(),
    });
    setIsSavingNotes(true);
    setTimeout(() => setIsSavingNotes(false), 2000);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onUpdate(task.id, {
      subtasks: [
        ...(task.subtasks || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          title: newSubtaskTitle.trim(),
          completed: false,
        },
      ],
      updatedAt: new Date().toISOString(),
    });
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (subtaskId: string) => {
    onUpdate(task.id, {
      subtasks: (task.subtasks || []).map((sub) =>
        sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    onUpdate(task.id, {
      subtasks: (task.subtasks || []).filter((sub) => sub.id !== subtaskId),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateSubtaskTitle = (subtaskId: string, newTitle: string) => {
    if (newTitle.trim()) {
      onUpdate(task.id, {
        subtasks: (task.subtasks || []).map((sub) =>
          sub.id === subtaskId ? { ...sub, title: newTitle.trim() } : sub
        ),
        updatedAt: new Date().toISOString(),
      });
    }
    setEditingSubtaskId(null);
  };

  const subtarefas = task.subtasks || [];
  const subtarefasFeitas = subtarefas.filter((s) => s.completed).length;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      draggable={!task.completed && isDraggable}
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver && onDragOver(e, task.id);
      }}
      onDragEnd={(e) => onDragEnd && onDragEnd(e)}
      onDrop={(e) => onDrop && onDrop(e, task.id)}
      className={`group relative ${ui.superficie} overflow-hidden py-2.5 pl-4 pr-3 transition-colors ${
        task.completed ? "bg-pauta dark:bg-tinta-fundo" : ""
      } ${isDraggedOver ? "border-fita dark:border-fita-clara" : ""}`}
    >
      {/* Marca de prioridade: filete de 3px, mesma cor do ponto na pauta.
          Elemento próprio, e não border-left, para não brigar com a borda
          da superfície por especificidade. */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${
          isFocused ? "bg-dial" : fundoPrioridade[task.priority]
        }`}
      />
      {isEditing ? (
        <TaskItemEdit
          task={task}
          categories={categories}
          onUpdate={onUpdate}
          onClose={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex flex-col">
          <div className="flex items-start gap-2">
            {!task.completed && isDraggable && (
              <span
                title="Arraste por aqui para reordenar"
                className={`mt-1.5 shrink-0 cursor-grab select-none active:cursor-grabbing ${ui.fraco}`}
              >
                <GripVertical className="h-4 w-4" />
              </span>
            )}

            {/* Concluir: alvo de 44px no toque, marca pequena no desenho */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
              aria-pressed={task.completed}
              aria-label={task.completed ? "Marcar como pendente" : "Concluir tarefa"}
              className={`-my-1.5 -ml-1.5 grid h-11 w-11 shrink-0 place-items-center rounded-pauta cursor-pointer sm:h-8 sm:w-8 ${ui.foco}`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border-2 transition-colors ${
                  task.completed
                    ? "border-fita bg-fita text-pauta-alta dark:border-fita-clara dark:bg-fita-clara dark:text-tinta"
                    : "border-linha dark:border-tinta-linha"
                }`}
              >
                {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
              </span>
            </button>

            {/* Horário em mono: 09:05 e 18:00 alinham em coluna */}
            <span
              className={`mt-1 w-11 shrink-0 ${ui.monoNum} ${
                task.completed ? ui.fraco : ui.suave
              }`}
            >
              {task.reminderTime || "--:--"}
            </span>

            <div
              onClick={() => setIsExpanded(!isExpanded)}
              className="min-w-0 flex-1 cursor-pointer select-none"
            >
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
                  className={ui.campo}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h4
                  onDoubleClick={handleDoubleClickTitle}
                  title="Clique duplo para renomear"
                  className={`${ui.corpo} cursor-text break-words leading-snug ${
                    task.completed ? `line-through ${ui.fraco}` : "font-medium"
                  }`}
                >
                  {task.title}
                </h4>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className={ui.chip}>
                  <IconeCategoria className="h-3 w-3 shrink-0" />
                  {task.category}
                </span>

                <span className={ui.chip}>
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      fundoPrioridade[task.priority]
                    }`}
                  />
                  {task.priority}
                </span>

                {task.reminderTime && task.reminderDays && task.reminderDays.length > 0 && (
                  <span className={ui.chip}>
                    {task.reminderDays.map((d) => WEEKDAY_ABBRS[d]).join(" ")}
                  </span>
                )}

                {!task.completed && isOverdue && (
                  <span
                    className={`${ui.monoRot} rounded-pauta bg-gravando px-2 py-0.5 text-pauta-alta`}
                  >
                    atrasada
                  </span>
                )}

                {!task.completed && isDueSoon && (
                  <span className={`${ui.monoRot} rounded-pauta bg-dial px-2 py-0.5 text-tinta`}>
                    em menos de 1h
                  </span>
                )}

                {task.isRecurring && (
                  <span className={ui.chip}>
                    <RefreshCw className="h-3 w-3 shrink-0" />
                    {task.recurrence === "semanal"
                      ? "semanal"
                      : task.recurrence === "mensal"
                      ? "mensal"
                      : "diário"}
                  </span>
                )}

                {(task.tags || []).map((tg) => (
                  <span key={tg} className={ui.chip}>
                    #{tg}
                  </span>
                ))}

                {task.notes && (
                  <span className={ui.chip}>
                    <FileText className="h-3 w-3 shrink-0" />
                    descrição
                  </span>
                )}

                {subtarefas.length > 0 && (
                  <span className={ui.chip}>
                    <ListTodo className="h-3 w-3 shrink-0" />
                    {subtarefasFeitas}/{subtarefas.length}
                  </span>
                )}
              </div>
            </div>

            {/* Ações: sempre visíveis no toque, reveladas no hover no desktop */}
            <div className="flex shrink-0 items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              {!task.completed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    suggestSubtasks();
                  }}
                  disabled={isSuggesting}
                  className={ui.btnIcone}
                  title="Sugerir subtarefas"
                >
                  {isSuggesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Target className="h-4 w-4" />
                  )}
                </button>
              )}

              {!task.completed && onToggleFocus && (
                <>
                  {isFocused && (
                    <span
                      className={`flex items-center gap-1.5 rounded-pauta border border-linha px-2 py-1 dark:border-tinta-linha`}
                    >
                      {isTimerRunning ? (
                        <span className={ui.monoNum}>
                          {Math.floor(timeRemaining / 60)}:
                          {(timeRemaining % 60).toString().padStart(2, "0")}
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="1"
                          max="99"
                          aria-label="Minutos de foco"
                          value={timerDuration}
                          onChange={(e) => setTimerDuration(parseInt(e.target.value) || 1)}
                          className={`w-9 border-none bg-transparent p-0 text-center ${ui.monoNum} ${ui.foco}`}
                        />
                      )}
                      <button
                        onClick={isTimerRunning ? () => setIsTimerRunning(false) : startTimer}
                        className={`${ui.monoRot} cursor-pointer ${ui.foco}`}
                      >
                        {isTimerRunning ? "parar" : "iniciar"}
                      </button>
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFocus(task.id);
                    }}
                    aria-pressed={isFocused}
                    className={`${ui.btnIcone} ${isFocused ? "text-dial-clara" : ""}`}
                    title={isFocused ? "Sair do foco" : "Focar nesta tarefa"}
                  >
                    <Target className="h-4 w-4" />
                  </button>
                </>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className={ui.btnIcone}
                title="Editar"
              >
                <Edit2 className="h-4 w-4" />
              </button>

              {onToggleArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleArchive(task.id);
                  }}
                  className={ui.btnIcone}
                  title={task.archived ? "Desarquivar" : "Arquivar"}
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmingDelete(true);
                }}
                className={`${ui.btnIcone} hover:text-gravando dark:hover:text-gravando-clara`}
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                aria-expanded={isExpanded}
                className={ui.btnIcone}
                title={isExpanded ? "Recolher detalhes" : "Abrir detalhes"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Detalhes: indentado por filete, não por outro card */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-5 border-l border-linha pl-4 dark:border-tinta-linha">
                  <p className={`${ui.monoNum} ${ui.fraco}`}>
                    criada {formatDateTime(task.createdAt)}
                    {task.updatedAt ? ` · alterada ${formatDateTime(task.updatedAt)}` : ""}
                  </p>

                  {/* Descrição */}
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <label className={ui.rotulo} htmlFor={`notas-${task.id}`}>
                        descrição
                      </label>
                      {!task.completed && !isRecordingNote && !isTranscribingNote && (
                        <button
                          type="button"
                          onClick={startNoteRecording}
                          className={`${ui.monoRot} flex cursor-pointer items-center gap-1.5 rounded-pauta px-2 py-1 hover:bg-pauta-baixa dark:hover:bg-tinta-linha ${ui.foco}`}
                        >
                          <Mic className="h-3.5 w-3.5" />
                          gravar nota
                        </button>
                      )}
                    </div>

                    {isRecordingNote && (
                      <div className="mb-2 flex items-center justify-between gap-3 border-l-[3px] border-l-gravando pl-3">
                        <span className={`${ui.corpoSm} min-w-0 flex-1`}>
                          <span className={ui.monoNum}>{formatNoteTime(recordingNoteDuration)}</span>
                          {noteTranscriptText && (
                            <span className={`ml-2 italic ${ui.suave}`}>{noteTranscriptText}</span>
                          )}
                        </span>
                        <span className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={stopNoteRecording}
                            className={ui.btnPrimario}
                          >
                            Anexar
                          </button>
                          <button
                            type="button"
                            onClick={cancelNoteRecording}
                            className={ui.btnFantasma}
                            title="Descartar nota de voz"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      </div>
                    )}

                    {isTranscribingNote && (
                      <p className={`mb-2 flex items-center gap-2 ${ui.corpoSm} ${ui.suave}`}>
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        Ouvindo…
                      </p>
                    )}

                    {noteError && (
                      <div className="mb-2 flex items-start justify-between gap-2 border-l-[3px] border-l-gravando pl-3">
                        <span className={ui.corpoSm}>{noteError}</span>
                        <button
                          type="button"
                          onClick={() => setNoteError(null)}
                          className={ui.btnIcone}
                          title="Fechar aviso"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <textarea
                      id={`notas-${task.id}`}
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      onBlur={handleSaveNotes}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                          e.preventDefault();
                          handleSaveNotes();
                        }
                      }}
                      placeholder="Detalhes, metas ou referências desta tarefa."
                      rows={2}
                      className={`${ui.campo} resize-none`}
                    />
                    <p className={`mt-1 ${ui.corpoSm} ${ui.fraco}`}>
                      {isSavingNotes ? "Salvando…" : "Salva ao clicar fora, ou com Ctrl + Enter."}
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={`${ui.rotulo} mb-2`} htmlFor={`nova-tag-${task.id}`}>
                      tags
                    </label>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {(task.tags || []).map((tg) => (
                        <span key={tg} className={ui.chip}>
                          #{tg}
                          <button
                            type="button"
                            onClick={() => handleRemoveTagFromTask(tg)}
                            aria-label={`Remover tag ${tg}`}
                            className={`cursor-pointer hover:text-gravando dark:hover:text-gravando-clara ${ui.foco}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      id={`nova-tag-${task.id}`}
                      type="text"
                      value={newTagText}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.endsWith(",")) {
                          handleAddTagToTask(val.slice(0, -1).trim());
                          setNewTagText("");
                        } else {
                          setNewTagText(val);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTagToTask(newTagText.trim());
                          setNewTagText("");
                        }
                      }}
                      placeholder="Nova tag — Enter ou vírgula cadastra"
                      className={`${ui.campo} max-w-sm`}
                    />
                  </div>

                  {/* Subtarefas */}
                  <div>
                    {subtaskError && (
                      <div className="mb-2 flex items-start justify-between gap-2 border-l-[3px] border-l-gravando pl-3">
                        <span className={ui.corpoSm}>{subtaskError}</span>
                        <button
                          type="button"
                          onClick={() => setSubtaskError(null)}
                          className={ui.btnIcone}
                          title="Fechar aviso"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <label className={ui.rotulo} htmlFor={`nova-subtarefa-${task.id}`}>
                        subtarefas
                      </label>
                      {subtarefas.length > 0 && (
                        <span className={`${ui.monoNum} ${ui.fraco}`}>
                          {subtarefasFeitas}/{subtarefas.length}
                        </span>
                      )}
                    </div>

                    <div className="mb-2 max-h-48 space-y-0.5 overflow-y-auto">
                      {subtarefas.length === 0 ? (
                        <p className={`${ui.corpoSm} ${ui.fraco}`}>
                          Nenhuma subtarefa. Escreva a primeira abaixo.
                        </p>
                      ) : (
                        subtarefas
                          .slice()
                          .sort((a, b) => Number(a.completed) - Number(b.completed))
                          .map((sub) => (
                            <div
                              key={sub.id}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingSubtaskId(sub.id);
                                setEditingSubtaskTitle(sub.title);
                              }}
                              className="group/sub flex items-center gap-2 rounded-pauta py-0.5 hover:bg-pauta-baixa dark:hover:bg-tinta-linha"
                            >
                              {editingSubtaskId === sub.id ? (
                                <input
                                  type="text"
                                  value={editingSubtaskTitle}
                                  onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleUpdateSubtaskTitle(sub.id, editingSubtaskTitle);
                                    else if (e.key === "Escape") setEditingSubtaskId(null);
                                  }}
                                  onBlur={() =>
                                    handleUpdateSubtaskTitle(sub.id, editingSubtaskTitle)
                                  }
                                  className={ui.campo}
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSubtask(sub.id)}
                                    aria-pressed={sub.completed}
                                    aria-label={sub.title}
                                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-pauta cursor-pointer sm:h-7 sm:w-7 ${ui.foco}`}
                                  >
                                    <span
                                      className={`grid h-4 w-4 place-items-center rounded-[2px] border transition-colors ${
                                        sub.completed
                                          ? "border-fita bg-fita text-pauta-alta dark:border-fita-clara dark:bg-fita-clara dark:text-tinta"
                                          : "border-linha dark:border-tinta-linha"
                                      }`}
                                    >
                                      {sub.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                    </span>
                                  </button>
                                  <span
                                    onClick={() => handleToggleSubtask(sub.id)}
                                    title="Clique duplo para renomear"
                                    className={`flex-1 cursor-pointer truncate select-none ${ui.corpoSm} ${
                                      sub.completed ? `line-through ${ui.fraco}` : ""
                                    }`}
                                  >
                                    {sub.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubtask(sub.id)}
                                    aria-label={`Excluir subtarefa ${sub.title}`}
                                    className={`${ui.btnIcone} shrink-0 hover:text-gravando dark:hover:text-gravando-clara sm:opacity-0 sm:group-hover/sub:opacity-100 sm:group-focus-within/sub:opacity-100`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))
                      )}
                    </div>

                    <form onSubmit={handleAddSubtask} className="flex gap-2">
                      <input
                        id={`nova-subtarefa-${task.id}`}
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        placeholder="Nova subtarefa"
                        className={ui.campo}
                      />
                      <button
                        type="submit"
                        disabled={!newSubtaskTitle.trim()}
                        className={`${ui.btnFantasma} shrink-0`}
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ConfirmationModal
            isOpen={isConfirmingDelete}
            onClose={() => setIsConfirmingDelete(false)}
            onConfirm={() => onDelete(task.id)}
            title="Excluir tarefa"
            message={`"${task.title}" será removida de vez. Não há como desfazer.`}
            confirmText="Excluir"
            cancelText="Cancelar"
          />
        </div>
      )}
    </motion.div>
  );
}
