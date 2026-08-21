import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Save, Trash2, FileText } from "lucide-react";
import { Note } from "../types";
import * as ui from "../lib/ui";

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

  const abaModo = (modo: "text" | "audio", rotulo: string, Icone: typeof Mic) => (
    <button
      type="button"
      onClick={() => setActiveTab(modo)}
      aria-current={activeTab === modo ? "true" : undefined}
      className={`${ui.monoRot} flex items-center gap-1.5 rounded-pauta px-2.5 py-1.5 cursor-pointer transition-colors ${ui.foco} ${
        activeTab === modo
          ? "bg-fita text-pauta-alta dark:bg-fita-clara dark:text-tinta"
          : `${ui.suave} hover:bg-pauta-baixa dark:hover:bg-tinta-linha`
      }`}
    >
      <Icone className="h-3.5 w-3.5" />
      {rotulo}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className={`${ui.superficie} space-y-4 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha pb-3 dark:border-tinta-linha">
        <h2 className={ui.displayMd}>Nova nota</h2>
        <div className="flex items-center gap-1">
          {abaModo("text", "escrever", FileText)}
          {abaModo("audio", "gravar", Mic)}
        </div>
      </div>

      {error && (
        <p className={`border-l-[3px] border-l-gravando pl-3 ${ui.corpoSm}`}>{error}</p>
      )}

      {activeTab === "audio" && (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {isRecording && (
              <span
                className="pulso-gravando absolute inset-0 rounded-full bg-gravando/25"
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              aria-label={isRecording ? "Parar gravação" : "Gravar nota"}
              className={`relative grid h-12 w-12 place-items-center rounded-full bg-gravando text-pauta-alta cursor-pointer transition-colors hover:bg-gravando/88 active:scale-95 ${ui.foco}`}
            >
              {isRecording ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="min-w-0 flex-1">
            {isRecording ? (
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[22px] tabular-nums leading-none">
                  {formatTime(recordingDuration)}
                </span>
                <span className={`${ui.monoRot} ${ui.suave} flex items-center gap-1.5`}>
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gravando" />
                  gravando
                </span>
              </div>
            ) : isProcessing ? (
              <p className={`flex items-center gap-2 ${ui.corpoSm} ${ui.suave}`}>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                Ouvindo…
              </p>
            ) : audioUrl ? (
              <div className="flex flex-wrap items-center gap-2">
                <audio src={audioUrl} controls className="h-9 max-w-[15rem] flex-1" />
                <button
                  type="button"
                  onClick={() => {
                    setAudioUrl(null);
                    setTranscription("");
                  }}
                  className={ui.btnFantasma}
                  title="Descartar áudio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className={`${ui.corpoSm} ${ui.suave}`}>Fale e a nota vira texto.</p>
            )}
          </div>
        </div>
      )}

      <div>
        <label className={`${ui.rotulo} mb-1`} htmlFor="nota-conteudo">
          {activeTab === "audio" ? "transcrição" : "nota"}
        </label>
        <textarea
          id="nota-conteudo"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            activeTab === "audio" ? "A transcrição aparece aqui para editar." : "Escreva a nota."
          }
          className={`${ui.campo} ${ui.corpoLg} min-h-[7rem] resize-none`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={!content.trim() && !transcription.trim()}
          className={ui.btnPrimario}
        >
          <Save className="h-4 w-4" />
          Salvar nota
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={ui.btnFantasma}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
