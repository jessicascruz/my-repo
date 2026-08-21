import { useState, useEffect, useRef } from "react";
import { Category, Priority } from "../types";
import { Search, Filter, CheckCircle2, AlertCircle, Sparkles, BarChart2, Mic, MicOff, Info } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface TaskFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string; // "Todas" | Category
  setSelectedCategory: (val: string) => void;
  selectedPriority: string; // "Todas" | Priority
  setSelectedPriority: (val: string) => void;
  
  // Dashboard Metrics
  totalCount: number;
  completedCount: number;
  highPriorityCount: number;
  onClearAll: () => void;
  onLoadSamples: () => void;
  categories: string[];
}

const PRIORITIES = ["Todas", "Alta", "Média", "Baixa"];

export function TaskFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  totalCount,
  completedCount,
  highPriorityCount,
  onClearAll,
  onLoadSamples,
  categories,
}: TaskFilterProps) {
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage("Seu navegador não suporta reconhecimento de voz.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "pt-BR";

      rec.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          const cleanText = text.replace(/\.$/, "").trim();
          setSearchQuery(cleanText);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition error", event.error);
        if (event.error === "not-allowed") {
          setErrorMessage("Permissão de microfone negada.");
        } else if (event.error === "no-speech") {
          setErrorMessage("Nenhum comando de voz detectado.");
        } else {
          setErrorMessage(`Erro: ${event.error}`);
        }
        setTimeout(() => setErrorMessage(null), 4500);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Erro ao iniciar captura de voz.");
      setTimeout(() => setErrorMessage(null), 4000);
      setIsListening(false);
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopVoiceSearch();
    } else {
      startVoiceSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. MetricCards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tasks Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Minhas Tarefas Do Dia
            </span>
            <span className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 block mt-1">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
              Acumulado das últimas horas
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Concluídas
            </span>
            <span className="text-2xl font-bold font-display text-slate-800 dark:text-slate-100 block mt-1">
              {completedCount}
            </span>
            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* High Priority Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Urgentes (Alta)
            </span>
            <span className="text-2xl font-bold font-display text-rose-600 dark:text-rose-500 block mt-1">
              {highPriorityCount}
            </span>
            <span className="text-[11px] text-rose-500 dark:text-rose-400 block mt-0.5">
              {highPriorityCount > 0 ? "⚠️ Exige atenção prioritária" : "✅ Nada urgente pedindo foco"}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            highPriorityCount > 0 ? "bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-500" : "bg-slate-50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-500"
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs space-y-4">
        {/* Row 1: Search */}
        <div id="search-voice-container" className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="voice-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isListening ? "Ouvindo... comecar a falar" : "Buscar tarefa pelo título..."}
            className="w-full pl-10 pr-12 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          <Tooltip content={isListening ? "Parar escuta" : "Buscar por comando de voz"} position="top">
            <button
              id="voice-mic-button"
              onClick={handleMicClick}
              type="button"
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                  : "text-slate-500 hover:text-indigo-650 dark:text-slate-500 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
        </div>

        {/* Status indicator on listening or error */}
        {(isListening || errorMessage) && (
          <div id="voice-status-feedback" className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-xl bg-indigo-50/55 dark:bg-indigo-950/25 text-indigo-700 dark:text-indigo-500 animate-fadeIn">
            {errorMessage ? (
              <>
                <Info className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="text-rose-600 dark:text-rose-400 font-bold">{errorMessage}</span>
              </>
            ) : (
              <>
                {/* Micro-oscillating real-time voice levels simulation */}
                <div className="flex items-center space-x-0.5 h-3.5 shrink-0">
                  <span className="w-0.5 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-0.5 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-0.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-0.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="font-bold">Ouvindo... Diga frases como "Trabalho" ou palavras-chave das tarefas.</span>
              </>
            )}
          </div>
        )}

        {/* Row 2: Categorical Drops */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-50 dark:border-slate-800">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
              Filtrar Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Todas" className="dark:bg-slate-950">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-950">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
              Filtrar Prioridade
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {PRIORITIES.map((prio) => (
                <option key={prio} value={prio} className="dark:bg-slate-950">
                  {prio === "Todas" ? "Todas as Prioridades" : `${prio}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Utility triggers */}
        <div className="flex items-center justify-between text-xs pt-2">
          <Tooltip
            content="Popula sua agenda hoje com tarefas variadas estruturadas para experimentar o app."
            position="top"
          >
            <button
              onClick={onLoadSamples}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Carregar exemplo de organização</span>
            </button>
          </Tooltip>
          
          <Tooltip
            content="Remove permanentemente todas as tarefas ativas e do progresso histórico."
            position="top"
          >
            <button
              onClick={onClearAll}
              disabled={totalCount === 0}
              className="text-rose-600 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-semibold disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Limpar Minhas Tarefas
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
