import { useMemo, useState } from "react";
import { Plus, Search, X, FileText, Mic } from "lucide-react";
import { Note } from "../types";
import { NoteForm } from "./NoteForm";
import { NoteItem } from "./NoteItem";
import { AnimatePresence } from "motion/react";
import * as ui from "../lib/ui";

interface NotesViewProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, "id" | "userId" | "createdAt">) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

const FILTROS = [
  { id: "all", rotulo: "todas", Icone: null },
  { id: "text", rotulo: "escritas", Icone: FileText },
  { id: "audio", rotulo: "de voz", Icone: Mic },
] as const;

export function NotesView({ notes, onAddNote, onUpdateNote, onDeleteNote }: NotesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "text" | "audio">("all");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const filteredNotes = useMemo(() => {
    const busca = searchQuery.toLowerCase();
    return notes.filter((note) => {
      const casaBusca =
        note.content.toLowerCase().includes(busca) ||
        !!note.transcription?.toLowerCase().includes(busca);
      const casaTipo =
        filterType === "all" ||
        (filterType === "audio" && !!note.audioUrl) ||
        (filterType === "text" && !note.audioUrl);
      return casaBusca && casaTipo;
    });
  }, [notes, searchQuery, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={ui.displayLg}>Notas</h2>
          <p className={`${ui.corpoSm} ${ui.suave}`}>
            Ideias, transcrições e o que não é tarefa.
          </p>
        </div>
        {!isAddingNote && (
          <button onClick={() => setIsAddingNote(true)} className={ui.btnPrimario}>
            <Plus className="h-4 w-4" />
            Nova nota
          </button>
        )}
      </div>

      {isAddingNote && (
        <NoteForm
          onAddNote={(note) => {
            onAddNote(note);
            setIsAddingNote(false);
          }}
          onCancel={() => setIsAddingNote(false)}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search
            aria-hidden="true"
            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${ui.fraco}`}
          />
          <input
            type="text"
            aria-label="Pesquisar nas notas"
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${ui.campo} pl-9 pr-9`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Limpar busca"
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-pauta p-1 cursor-pointer ${ui.foco}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {FILTROS.map(({ id, rotulo, Icone }) => (
            <button
              key={id}
              onClick={() => setFilterType(id)}
              aria-current={filterType === id ? "true" : undefined}
              className={`${ui.monoRot} flex items-center gap-1.5 rounded-pauta px-2.5 py-1.5 cursor-pointer transition-colors ${ui.foco} ${
                filterType === id
                  ? "bg-fita text-pauta-alta dark:bg-fita-clara dark:text-tinta"
                  : `${ui.suave} hover:bg-pauta-baixa dark:hover:bg-tinta-linha`
              }`}
            >
              {Icone && <Icone className="h-3.5 w-3.5" />}
              {rotulo}
            </button>
          ))}
        </div>

        <span className={`${ui.monoRot} ${ui.fraco} ml-auto`}>{filteredNotes.length}</span>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note) => (
            <NoteItem key={note.id} note={note} onDelete={onDeleteNote} onUpdate={onUpdateNote} />
          ))}
        </AnimatePresence>

        {filteredNotes.length === 0 && (
          <div className={`${ui.superficie} p-10 text-center`}>
            <h3 className={`${ui.displayMd} mb-1`}>
              {searchQuery || filterType !== "all" ? "Nada com esse filtro" : "Nenhuma nota ainda"}
            </h3>
            <p className={`${ui.corpoSm} ${ui.suave} mx-auto max-w-sm`}>
              {searchQuery || filterType !== "all"
                ? "Limpe a busca ou escolha outro tipo."
                : "Toque em Nova nota e escreva, ou grave e deixe a transcrição virar texto."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
