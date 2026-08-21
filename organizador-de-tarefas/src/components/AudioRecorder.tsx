import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Square, Loader2, Keyboard, Trash2, X } from "lucide-react";
import * as ui from "../lib/ui";

interface AudioRecorderProps {
  onTasksExtracted: (tasks: any[], transcription?: string, isLocalFallback?: boolean) => void;
  onError: (message: string) => void;
  /** Transcrição da última leva de tarefas, exibida no próprio console. */
  transcricaoRecente?: string | null;
  onLimparTranscricao?: () => void;
}

export function AudioRecorder({
  onTasksExtracted,
  onError,
  transcricaoRecente,
  onLimparTranscricao,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputMode, setInputMode] = useState<"audio" | "text">("audio");
  const [manualText, setManualText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const recognitionRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setAudioUrl(null);
      audioBlobRef.current = null;
      setTranscriptText("");

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine optimum mimeType supported by the browser
      let options = { mimeType: "audio/webm" };
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/ogg" };
      }
      if (!MediaRecorder.isTypeSupported("audio/ogg")) {
        options = { mimeType: "" }; // default fallback for Safari / standard compliance
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        audioBlobRef.current = audioBlob;
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Terminate all stream tracks safely
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start client-side Web Speech API in parallel if supported
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
              setTranscriptText(finalTranscript);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn("Speech recognition warning:", e.error);
          };

          recognition.onend = () => {
            console.log("Speech recognition ended.");
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (speechErr) {
          console.warn("Speech recognition initialization failed:", speechErr);
        }
      }

      // Simple recording timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      onError(
        "O microfone não abriu. Libere o áudio nas permissões do navegador, ou use o modo digitar."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
      }
    }
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    audioBlobRef.current = null;
    audioChunksRef.current = [];
    setRecordingDuration(0);
    setTranscriptText("");
  };

  const useTranscriptFallback = async () => {
    try {
      const response = await fetch("/api/tasks/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcriptText }),
      });

      let result: any;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch (jsonErrEvent) {
        throw new Error(`O servidor respondeu algo que não deu para ler (status ${response.status}).`);
      }

      if (!response.ok) {
        throw new Error((result && result.error) || "O relato não pôde ser processado.");
      }

      if (result.tasks) {
        onTasksExtracted(result.tasks, transcriptText, result.isLocalFallback);
        deleteRecording(); // Clear state
      } else {
        throw new Error("Não deu para identificar tarefas no que você falou.");
      }
    } catch (fallbackErr: any) {
      throw new Error(
        `A voz não pôde ser processada: ${fallbackErr.message || fallbackErr}. Use o modo digitar.`
      );
    }
  };

  const processAudio = async () => {
    const audioBlob = audioBlobRef.current;
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      // Check if we can use client-side SpeechRecognition text if processing failed/was blocked
      const runAudioUpload = async () => {
        // Convert Blob to Base64 using FileReader
        const base64Audio = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const result = reader.result as string;
            // Note: split of data URL header "data:audio/webm;base64,..."
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = (e) => reject(e);
        });

        // Send to Express Backend API which proxies safely to Gemini
        const response = await fetch("/api/tasks/analyze-audio", {
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
        } catch (jsonErrEvent) {
          if (transcriptText && transcriptText.trim()) {
            console.warn("Audio processing failed with invalid JSON, falling back to local transcriptText", response.status);
            await useTranscriptFallback();
            return;
          }

          const isTooLarge = response.status === 413 || responseText.includes("413") || responseText.toLowerCase().includes("too large");
          if (isTooLarge) {
            throw new Error("O áudio passou do limite de tamanho. Grave até uns 20 segundos.");
          }

          if (response.status === 403) {
            throw new Error("Sem chave do Gemini, o áudio não pode ser transcrito. Use o modo digitar.");
          }

          const isHtml = responseText.includes("<!doctype html") || responseText.includes("<html");
          throw new Error(
            isHtml
              ? `O servidor está subindo (status ${response.status}). Espere uns dez segundos e envie de novo.`
              : `O servidor respondeu algo que não deu para ler (status ${response.status}): ` + (responseText.slice(0, 100) || "resposta vazia")
          );
        }

        if (!response.ok) {
          if (transcriptText && transcriptText.trim()) {
            console.warn("Audio processing response raw error, falling back to local transcriptText", response.status);
            await useTranscriptFallback();
            return;
          }

          if (result && result.error === "GEMINI_API_KEY_NOT_CONFIGURED") {
            throw new Error("Sem chave do Gemini, o áudio não pode ser transcrito. Use o modo digitar, que funciona local.");
          }
          throw new Error((result && result.error) || `O áudio não pôde ser processado (status ${response.status}).`);
        }

        if (result.tasks) {
          onTasksExtracted(result.tasks, result.transcription, result.isLocalFallback);
          deleteRecording(); // Clear on success
        } else {
          throw new Error("O servidor respondeu algo inesperado.");
        }
      };

      await runAudioUpload();
    } catch (err: any) {
      console.error(err);
      onError(err.message || "Não deu para enviar. Confira a conexão e tente de novo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processText = async () => {
    if (!manualText.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/tasks/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: manualText }),
      });

      let result: any;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch (jsonErrEvent) {
        if (response.status === 403) {
          throw new Error("Sem permissão para processar o texto (403). Confira a chave do Gemini nos Ajustes.");
        }

        const isTooLarge = response.status === 413 || responseText.includes("413") || responseText.toLowerCase().includes("too large");
        throw new Error(
          isTooLarge
            ? "O texto passou do limite de tamanho. Escreva um relato mais curto."
            : responseText.includes("<!doctype html") || responseText.includes("<html")
            ? `O servidor está subindo (status ${response.status}). Espere uns dez segundos e envie de novo.`
            : `O servidor respondeu algo que não deu para ler (status ${response.status}): ` + (responseText.slice(0, 100) || "resposta vazia")
        );
      }

      if (!response.ok) {
        throw new Error((result && result.error) || `O texto não pôde ser processado (status ${response.status}).`);
      }

      if (result.tasks) {
        onTasksExtracted(result.tasks, undefined, result.isLocalFallback);
        setManualText(""); // Clear on success
      } else {
        throw new Error("Não deu para identificar tarefas no relato.");
      }
    } catch (err: any) {
      console.error(err);
      onError(err.message || "As tarefas não foram criadas. Tente de novo.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Quatro estados, um lugar na tela. Nada de salto de layout entre eles.
  const estado: "pronto" | "gravando" | "revisar" | "processando" = isProcessing
    ? "processando"
    : isRecording
    ? "gravando"
    : audioUrl
    ? "revisar"
    : "pronto";

  const transcricaoVisivel =
    estado === "gravando" || estado === "revisar" ? transcriptText : transcricaoRecente || "";

  const abaModo = (modo: "audio" | "text", rotulo: string, Icone: typeof Mic) => (
    <button
      onClick={() => setInputMode(modo)}
      aria-current={inputMode === modo ? "true" : undefined}
      className={`${ui.monoRot} flex items-center gap-1.5 rounded-pauta px-2.5 py-1.5 cursor-pointer transition-colors ${ui.foco} ${
        inputMode === modo
          ? "bg-fita text-pauta-alta dark:bg-fita-clara dark:text-tinta"
          : `${ui.suave} hover:bg-pauta-baixa dark:hover:bg-tinta-linha`
      }`}
    >
      <Icone className="h-3.5 w-3.5" />
      <span>{rotulo}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* A transcrição aparece no console, durante a revisão — não num card à parte */}
      <AnimatePresence>
        {transcricaoVisivel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 border-l-[3px] border-l-linha dark:border-l-tinta-linha pl-3">
              <p className={`${ui.corpoSm} ${ui.suave} line-clamp-3 flex-1 italic`}>
                {transcricaoVisivel}
              </p>
              {estado === "pronto" && onLimparTranscricao && (
                <button
                  onClick={onLimparTranscricao}
                  title="Fechar transcrição"
                  className={`shrink-0 rounded-pauta p-1 cursor-pointer hover:bg-pauta-baixa dark:hover:bg-tinta-linha ${ui.foco}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-14 items-center gap-3">
        {/* Botão principal — sempre no mesmo lugar, em qualquer estado */}
        <div className="relative shrink-0">
          {estado === "gravando" && (
            <span
              className="pulso-gravando absolute inset-0 rounded-full bg-gravando/25"
              aria-hidden="true"
            />
          )}
          <button
            onClick={
              estado === "gravando"
                ? stopRecording
                : () => {
                    setInputMode("audio");
                    startRecording();
                  }
            }
            disabled={estado === "processando"}
            aria-label={estado === "gravando" ? "Parar gravação" : "Gravar"}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full text-pauta-alta transition-colors disabled:opacity-60 ${
              estado === "processando"
                ? "bg-tinta/45 dark:bg-pauta/30 cursor-default"
                : "bg-gravando hover:bg-gravando/88 cursor-pointer active:scale-95"
            } ${ui.foco}`}
          >
            {estado === "processando" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : estado === "gravando" ? (
              <Square className="h-4 w-4 fill-current" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Miolo: muda por estado */}
        <div className="min-w-0 flex-1">
          {estado === "gravando" ? (
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[22px] tabular-nums leading-none">
                {formatTime(recordingDuration)}
              </span>
              <span className={`${ui.monoRot} ${ui.suave} flex items-center gap-1.5`}>
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gravando" />
                gravando
              </span>
            </div>
          ) : estado === "processando" ? (
            <div className="flex items-baseline gap-3">
              <span className={`${ui.monoRot} ${ui.suave}`}>ouvindo…</span>
              <span className="font-mono text-[22px] tabular-nums leading-none">
                {formatTime(recordingDuration)}
              </span>
            </div>
          ) : estado === "revisar" ? (
            <div className="flex flex-wrap items-center gap-2">
              <audio src={audioUrl || ""} controls className="h-9 max-w-[15rem] flex-1" />
              <button onClick={processAudio} className={ui.btnPrimario}>
                Enviar
              </button>
              <button onClick={deleteRecording} className={ui.btnFantasma} title="Descartar áudio">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Descartar</span>
              </button>
            </div>
          ) : inputMode === "audio" ? (
            /* No mobile o convite sai: o microfone já diz o que fazer e a
               largura vai toda para as abas gravar/digitar. */
            <p className={`hidden sm:block ${ui.corpoSm} ${ui.suave}`}>
              Fale as suas tarefas do dia.
            </p>
          ) : (
            <p className={`hidden sm:block ${ui.corpoSm} ${ui.suave}`}>
              Escreva o dia num parágrafo corrido, com horários.
            </p>
          )}
        </div>

        {/* Gravar / digitar */}
        {estado === "pronto" && (
          <div className="flex shrink-0 items-center gap-1">
            {abaModo("audio", "gravar", Mic)}
            {abaModo("text", "digitar", Keyboard)}
          </div>
        )}
      </div>

      {inputMode === "text" && estado === "pronto" && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) processText();
            }}
            placeholder="Ex: relatório semanal às 11:30, mercado de tarde, caminhada às 19:00."
            rows={2}
            aria-label="Descreva o seu dia"
            className={`${ui.campo} resize-none`}
          />
          <button
            onClick={processText}
            disabled={!manualText.trim()}
            className={`${ui.btnPrimario} shrink-0`}
          >
            Organizar
          </button>
        </div>
      )}
    </div>
  );
}
