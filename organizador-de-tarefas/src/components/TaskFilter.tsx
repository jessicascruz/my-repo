import { useState, useEffect, useRef } from "react";
import { Search, Mic, MicOff } from "lucide-react";
import * as ui from "../lib/ui";

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
    <div className="space-y-4">
      {/* Três medidas do dia. Número grande em Bricolage, rótulo em mono. */}
      <dl className="grid gap-4 border-y border-linha py-4 dark:border-tinta-linha sm:grid-cols-3">
        <div>
          <dt className={ui.rotulo}>na pauta hoje</dt>
          <dd className="mt-0.5 font-display text-[30px] font-extrabold leading-none tracking-[-0.03em]">
            {totalCount}
          </dd>
        </div>
        <div className="sm:border-l sm:border-linha sm:pl-4 sm:dark:border-tinta-linha">
          <dt className={ui.rotulo}>concluídas</dt>
          <dd className="mt-0.5 font-display text-[30px] font-extrabold leading-none tracking-[-0.03em]">
            {completedCount}
            <span className={`ml-2 ${ui.monoNum} ${ui.suave} font-sans font-normal`}>
              {percentComplete}%
            </span>
          </dd>
        </div>
        <div className="sm:border-l sm:border-linha sm:pl-4 sm:dark:border-tinta-linha">
          <dt className={ui.rotulo}>prioridade alta</dt>
          <dd className="mt-0.5 flex items-baseline gap-2">
            <span className="font-display text-[30px] font-extrabold leading-none tracking-[-0.03em]">
              {highPriorityCount}
            </span>
            {highPriorityCount > 0 && (
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 translate-y-[-4px] rounded-full bg-gravando"
              />
            )}
          </dd>
        </div>
      </dl>

      <div id="search-voice-container" className="relative">
        <Search
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${ui.fraco}`}
        />
        <input
          id="voice-search-input"
          type="text"
          aria-label="Buscar tarefa"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isListening ? "Ouvindo…" : "Buscar na fila"}
          className={`${ui.campo} pl-9 pr-12`}
        />
        <button
          id="voice-mic-button"
          onClick={handleMicClick}
          type="button"
          title={isListening ? "Parar de ouvir" : "Buscar falando"}
          className={`absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-pauta cursor-pointer transition-colors ${ui.foco} ${
            isListening
              ? "bg-gravando text-pauta-alta"
              : `${ui.suave} hover:bg-pauta-baixa dark:hover:bg-tinta-linha`
          }`}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      </div>

      {(isListening || errorMessage) && (
        <p
          id="voice-status-feedback"
          className={`border-l-[3px] pl-3 ${ui.corpoSm} ${
            errorMessage ? "border-l-gravando" : "border-l-fita dark:border-l-fita-clara"
          }`}
        >
          {errorMessage || "Ouvindo… diga uma palavra do título ou da categoria."}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={`${ui.rotulo} mb-1`} htmlFor="filtro-categoria">
            categoria
          </label>
          <select
            id="filtro-categoria"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={ui.campo}
          >
            <option value="Todas">Todas</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`${ui.rotulo} mb-1`} htmlFor="filtro-prioridade">
            prioridade
          </label>
          <select
            id="filtro-prioridade"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className={ui.campo}
          >
            {PRIORITIES.map((prio) => (
              <option key={prio} value={prio}>
                {prio}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onLoadSamples}
          className={`${ui.monoRot} ${ui.suave} cursor-pointer rounded-pauta px-2 py-1 hover:bg-pauta-baixa dark:hover:bg-tinta-linha ${ui.foco}`}
        >
          carregar exemplos
        </button>
        {/* Rótulo neutro: `gravando` a 11px sobre papel dá 3,3:1. O perigo
            aparece no hover, onde o preenchimento carrega a cor. */}
        <button
          onClick={onClearAll}
          disabled={totalCount === 0}
          className={`${ui.monoRot} ${ui.suave} cursor-pointer rounded-pauta px-2 py-1 disabled:pointer-events-none disabled:opacity-40 hover:bg-gravando hover:text-pauta-alta dark:hover:bg-gravando-clara dark:hover:text-tinta ${ui.foco}`}
        >
          limpar as tarefas
        </button>
      </div>
    </div>
  );
}
