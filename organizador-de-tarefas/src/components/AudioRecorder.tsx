import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Square, Sparkles, Loader2, Keyboard, Play, Trash2, HelpCircle } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface AudioRecorderProps {
  onTasksExtracted: (tasks: any[], transcription?: string, isLocalFallback?: boolean) => void;
  onError: (message: string) => void;
}

export function AudioRecorder({ onTasksExtracted, onError }: AudioRecorderProps) {
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
        "Não foi possível acessar seu microfone. Certifique-se de dar permissões de áudio no seu navegador ou use a entrada de texto abaixo!"
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
        throw new Error(`Resposta do servidor de texto na recuperação por voz inválida (Status: ${response.status}).`);
      }

      if (!response.ok) {
        throw new Error((result && result.error) || "Erro ao processar o relato em texto.");
      }

      if (result.tasks) {
        onTasksExtracted(result.tasks, transcriptText, result.isLocalFallback);
        deleteRecording(); // Clear state
      } else {
        throw new Error("Nenhuma tarefa pôde ser identificada no seu relato de voz.");
      }
    } catch (fallbackErr: any) {
      throw new Error(
        `Falha ao processar voz localmente: ${fallbackErr.message || fallbackErr}. Digite sua tarefa na aba 'Digitar'!`
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
            throw new Error("O áudio gravado excedeu o limite de tamanho permitido. Por favor, grave uma mensagem mais curta de até 15-25 segundos!");
          }

          if (response.status === 403) {
            throw new Error("Não foi possível processar o áudio por inteligência artificial (Erro 403 - Chave Gemini não configurada ou restrição de tamanho no proxy). Como seu microfone não capturou transcrição local, tente novamente mais curto ou digite na aba 'Digitar'!");
          }

          const isHtml = responseText.includes("<!doctype html") || responseText.includes("<html");
          throw new Error(
            isHtml
              ? `O servidor de áudio está se inicializando ou terminou de reiniciar (Status: ${response.status}). Por favor, aguarde de 5 a 10 segundos e tente novamente! Você também pode usar a aba 'Digitar' para criar tarefas instantaneamente.`
              : `Resposta inválida do servidor (Status: ${response.status}): ` + (responseText.slice(0, 100) || "Corpo vazio")
          );
        }

        if (!response.ok) {
          if (transcriptText && transcriptText.trim()) {
            console.warn("Audio processing response raw error, falling back to local transcriptText", response.status);
            await useTranscriptFallback();
            return;
          }

          if (result && result.error === "GEMINI_API_KEY_NOT_CONFIGURED") {
            throw new Error("Não foi possível transcrever áudio por inteligência artificial (Erro 403 - GEMINI_API_KEY não configurada). Configure sua chave nas Configurações do AI Studio, ou use a aba 'Digitar' que funciona de forma local!");
          }
          throw new Error((result && result.error) || `Erro ao processar áudio (Status: ${response.status}).`);
        }

        if (result.tasks) {
          onTasksExtracted(result.tasks, result.transcription, result.isLocalFallback);
          deleteRecording(); // Clear on success
        } else {
          throw new Error("Resposta inesperada do servidor.");
        }
      };

      await runAudioUpload();
    } catch (err: any) {
      console.error(err);
      onError(err.message || "Erro de conexão ou faturamento da API.");
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
          throw new Error("Erro de permissão no processamento de texto (Status: 403). Para corrigir, verifique se a sua chave do Gemini está ativa nas Configurações, ou continue usando o app que possui processamento local!");
        }

        const isTooLarge = response.status === 413 || responseText.includes("413") || responseText.toLowerCase().includes("too large");
        throw new Error(
          isTooLarge
            ? "O texto inserido excedeu o limite de tamanho permitido. Por favor, digite um texto mais curto!"
            : responseText.includes("<!doctype html") || responseText.includes("<html")
            ? `O servidor de processamento de texto está se inicializando ou terminou de reiniciar (Status: ${response.status}). Por favor, aguarde de 5 a 10 segundos e tente novamente!`
            : `Resposta inválida do servidor (Status: ${response.status}): ` + (responseText.slice(0, 100) || "Corpo vazio")
        );
      }

      if (!response.ok) {
        throw new Error((result && result.error) || `Erro ao processar seu texto (Status: ${response.status}).`);
      }

      if (result.tasks) {
        onTasksExtracted(result.tasks, undefined, result.isLocalFallback);
        setManualText(""); // Clear on success
      } else {
        throw new Error("Nenhuma tarefa pôde ser identificada no seu relato.");
      }
    } catch (err: any) {
      console.error(err);
      onError(err.message || "Erro ao registrar tarefas por texto.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden">
      {/* Decorative backdrop gradients */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50/50 dark:bg-amber-950/10 rounded-full blur-2xl pointer-events-none" />

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-900 pb-3 mb-6 items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 font-display flex items-center">
          <Sparkles className="w-5 h-5 text-indigo-500 mr-2" />
          Como planejar hoje?
        </h3>
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          <Tooltip
            content="Grave e dote suas pendências por voz para organização instantânea via IA."
            position="top"
          >
            <button
              onClick={() => setInputMode("audio")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                inputMode === "audio"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Falar Áudio</span>
            </button>
          </Tooltip>
          <Tooltip
            content="Escreva ou cole um parágrafo corrido listando suas rotinas diárias."
            position="top"
          >
            <button
              onClick={() => setInputMode("text")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                inputMode === "text"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Digitar</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xs flex flex-col items-center justify-center z-10 p-6 text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <h4 className="font-bold text-slate-800 dark:text-slate-200 font-display text-lg">
            O Gemini está organizando o seu dia...
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Transcrevendo a voz, categorizando suas obrigações por relevância e automatizando horários de lembrete.
          </p>
        </div>
      )}

      {inputMode === "audio" ? (
        <div className="flex flex-col items-center justify-center py-6">
          {!audioUrl && !isRecording ? (
            <div className="text-center">
              <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                Clique no microfone abaixo e fale livremente o que você tem para realizar hoje. O app classifica suas tarefas, atribui urgência e define os horários.
              </p>

              <Tooltip
                content="Dica: Clique para falar. Diga horários e prioridades (ex: 'fazer relatório importante às 15:30') e o app fará tudo!"
                position="top"
              >
                <button
                  onClick={startRecording}
                  className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all shadow-md shadow-rose-200 cursor-pointer mx-auto"
                >
                  <div className="absolute inset-0 rounded-full bg-rose-400 opacity-0 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300" />
                  <Mic className="w-8 h-8" />
                </button>
              </Tooltip>
              <span className="block text-xs font-semibold text-slate-400 mt-4 tracking-wider uppercase">
                Iniciar Gravação
              </span>
            </div>
          ) : isRecording ? (
            <div className="text-center w-full">
              {/* Voice pulse indicator ripples */}
              <div className="relative flex items-center justify-center w-28 h-28 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-voice-ripple-1" />
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-voice-ripple-2" />
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-voice-ripple-3" />
                <button
                  onClick={stopRecording}
                  className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-rose-600 text-white transition-all scale-105 shadow-md hover:bg-rose-700 cursor-pointer"
                >
                  <Square className="w-6 h-6 fill-white" />
                </button>
              </div>

              <span className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100">
                {formatTime(recordingDuration)}
              </span>
              <p className="text-xs font-medium text-rose-500 mt-2 animate-pulse">
                Gravando... Diga tudo o que você necessita hoje
              </p>
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-2">
                  Áudio Gravado com Sucesso
                </p>
                <div className="flex items-center justify-between">
                  <audio src={audioUrl || ""} controls className="w-full max-w-xs h-9" />
                  <button
                    onClick={deleteRecording}
                    title="Excluir gravação"
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {transcriptText && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">
                      Transcrição local (tempo real):
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 p-2.5 rounded-lg italic select-text">
                      "{transcriptText}"
                    </p>
                  </div>
                )}
              </div>

              <Tooltip
                content="Analisa o áudio gravado com IA para carregar e agendar todas as tarefas automaticamente."
                position="top"
                className="w-full"
              >
                <button
                  onClick={processAudio}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar e Organizar Minhas Tarefas
                </button>
              </Tooltip>
            </div>
          )}

          {/* Practical Hint */}
          <div className="flex items-start bg-slate-50 dark:bg-slate-950/40 border border-slate-100/60 dark:border-slate-800/40 p-3 rounded-lg mt-6 w-full max-w-md">
            <HelpCircle className="w-4.5 h-4.5 text-indigo-500 mr-2 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Dica:</strong> Fale horários e prioridades! Ex:{" "}
              <em>
                "Preciso entregar o projeto de trabalho às 14 horas que é super importante, e mais tarde lembrar de remarcar a academia para amanhã."
              </em>
            </p>
          </div>
        </div>
      ) : (
        <div className="py-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Caso não queira ou não possa falar agora, descreva tudo o que precisa fazer abaixo (um parágrafo contínuo, listando os afazeres e horas) que o Gemini organizará.
          </p>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Ex: Fazer relatório semanal às 11:30, passar no mercado para comprar leite de tarde, e às 19:00 caminhar no parque por 30 minutos."
            rows={4}
            className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none"
          />
          <div className="flex justify-end mt-3">
            <Tooltip
              content="Envia seu texto corrido para que a inteligência artificial organize seus horários e categorias."
              position="left"
            >
              <button
                onClick={processText}
                disabled={!manualText.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Organizar via Texto
              </button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
