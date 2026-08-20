import React, { useState, useMemo } from "react";
import { 
  StickyNote, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Trash2, 
  LayoutGrid, 
  List,
  FileText,
  Mic,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Note } from "../types";
import { NoteForm } from "./NoteForm";
import { NoteItem } from "./NoteItem";
import { motion, AnimatePresence } from "motion/react";

interface NotesViewProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, "id" | "userId" | "createdAt">) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

export function NotesView({ notes, onAddNote, onUpdateNote, onDeleteNote }: NotesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "text" | "audio">("all");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (note.transcription?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = filterType === "all" || 
                         (filterType === "audio" && !!note.audioUrl) ||
                         (filterType === "text" && !note.audioUrl);

      return matchesSearch && matchesType;
    });
  }, [notes, searchQuery, filterType]);

  const handleAddNote = (note: Omit<Note, "id" | "userId" | "createdAt">) => {
    onAddNote(note);
    setIsAddingNote(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <StickyNote className="w-7 h-7 text-indigo-500" />
            Suas Notas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Organize suas ideias, transcrições e lembretes rápidos.
          </p>
        </div>
        
        {!isAddingNote && (
          <button
            onClick={() => setIsAddingNote(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Nova Nota
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAddingNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <NoteForm onAddNote={handleAddNote} onCancel={() => setIsAddingNote(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar em notas e transcrições..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between sm:justify-start">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType("text")}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                filterType === "text"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-3 h-3 text-indigo-500" />
              <span>Texto</span>
            </button>
            <button
              onClick={() => setFilterType("audio")}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                filterType === "audio"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Mic className="w-3 h-3 text-indigo-500" />
              <span>Voz</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block shrink-0" />

          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
        <AnimatePresence mode="popLayout">
          {filteredNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onDelete={onDeleteNote}
              onUpdate={onUpdateNote}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
            <StickyNote className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">
              {searchQuery || filterType !== "all" ? "Nenhuma nota encontrada" : "Sua área de notas está vazia"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {searchQuery || filterType !== "all" 
                ? "Tente ajustar seus filtros ou termos de pesquisa." 
                : "Comece a registrar suas ideias digitando ou gravando um áudio rápido!"}
            </p>
          </div>
          {!searchQuery && filterType === "all" && !isAddingNote && (
            <button
              onClick={() => setIsAddingNote(true)}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
            >
              Adicionar minha primeira nota
            </button>
          )}
        </div>
      )}
    </div>
  );
}
