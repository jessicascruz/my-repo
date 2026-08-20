import React, { useState } from "react";
import { 
  Trash2, 
  Calendar, 
  Mic, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Play,
  Volume2,
  Clock,
  Edit2,
  Save,
  X
} from "lucide-react";
import { Note } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const formattedDate = new Date(note.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSave = () => {
    if (editContent.trim() && editContent !== note.content) {
      onUpdate(note.id, { content: editContent.trim() });
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden h-fit"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {note.audioUrl ? (
                <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  <Mic className="w-3.5 h-3.5" />
                  <div className="w-px h-3 bg-rose-200 dark:bg-rose-800 mx-1" />
                  <span>Voz</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <div className="w-px h-3 bg-indigo-200 dark:bg-indigo-800 mx-1" />
                  <span>Texto</span>
                </div>
              )}
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {formattedDate}
              </span>
            </div>
 
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[100px]"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>Salvar</span>
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setEditContent(note.content); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-slate-700 dark:text-slate-200 text-sm leading-relaxed ${!isExpanded ? "line-clamp-3" : ""}`}>
                {note.content}
              </p>
            )}
          </div>
 
          <div className="flex items-center gap-0.5 shrink-0">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                title="Editar nota"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(note.id)}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-800/20 rounded-xl transition-all cursor-pointer"
              title="Excluir nota"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
 
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-slate-50 dark:border-slate-800 space-y-4">
                {note.audioUrl && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Volume2 className="w-3 h-3" />
                      Áudio Gravado
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <audio src={note.audioUrl} controls className="h-8 flex-1" />
                    </div>
                  </div>
                )}
 
                {note.transcription && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Mic className="w-3 h-3" />
                      Transcrição Original
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                      "{note.transcription}"
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
 
        {(note.audioUrl || note.transcription || note.content.length > 150) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-all py-1.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-lg cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Ver Menos
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Ver Detalhes
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
