import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  Square, 
  Sparkles, 
  Loader2, 
  X, 
  Save, 
  Trash2, 
  Plus, 
  FileText, 
  Volume2,
  AlertCircle
} from "lucide-react";
import { Note } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NoteFormProps {
  onAddNote: (note: Omit<Note, "id" | "userId" | "createdAt">) => void;
  onCancel?: () => void;
}

export function NoteForm({ onAddNote, onCancel }: NoteFormProps) {
  const [content, setContent] = useState("");
  const [transcription, setTranscription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "audio">("text");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      setAudioUrl(null);
      setAudioData(null);
      setTranscription("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let options = { mimeType: "audio/webm" };
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/ogg" };
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert to base64 for transcription
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          setAudioData(base64);
          transcribeAudio(base64, audioBlob.type);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const transcribeAudio = async (base64: string, mimeType: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/tasks/transcribe-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioData: base64, mimeType }),
      });

      const data = await response.json();
      if (response.ok) {
        setTranscription(data.transcription);
        if (!content) {
          setContent(data.transcription);
        }
      } else {
        setError(data.message || "Erro ao transcrever áudio.");
      }
    } catch (err) {
      setError("Erro de rede ao transcrever áudio.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !transcription.trim()) return;

    const noteData: Omit<Note, "id" | "userId" | "createdAt"> = {
      content: content.trim() || transcription.trim(),
    };

    if (transcription.trim()) {
      noteData.transcription = transcription.trim();
    }

    if (audioUrl) {
      noteData.audioUrl = audioUrl;
    }

    onAddNote(noteData);

    // Reset form
    setContent("");
    setTranscription("");
    setAudioUrl(null);
    setAudioData(null);
    setError(null);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-500" />
          Nova Nota
        </h3>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "text" 
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" />
            Texto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audio")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "audio" 
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Mic className="w-3.5 h-3.5 inline mr-1" />
            Voz
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {activeTab === "audio" && (
        <div className="flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          {!audioUrl && !isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex flex-col items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600 active:scale-95 transition-all">
                <Mic className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Gravar Nota</span>
            </button>
          ) : isRecording ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                <button
                  type="button"
                  onClick={stopRecording}
                  className="relative w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                >
                  <Square className="w-6 h-6 fill-white" />
                </button>
              </div>
              <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">
                {formatTime(recordingDuration)}
              </span>
              <span className="text-xs text-rose-500 font-medium animate-pulse">Gravando...</span>
            </div>
          ) : (
            <div className="w-full px-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <Volume2 className="w-4 h-4 text-indigo-500" />
                  <audio src={audioUrl} controls className="h-8 flex-1" />
                </div>
                <button
                  type="button"
                  onClick={() => { setAudioUrl(null); setTranscription(""); }}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Transcrevendo...</span>
                </div>
              )}
              {transcription && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transcrição da IA</label>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 italic">
                    "{transcription}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          {activeTab === "audio" ? "Editar Nota / Conteúdo" : "Conteúdo da Nota"}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={activeTab === "audio" ? "A transcrição aparecerá aqui para edição..." : "Digite sua nota aqui..."}
          className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!content.trim() && !transcription.trim()}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Salvar Nota
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
