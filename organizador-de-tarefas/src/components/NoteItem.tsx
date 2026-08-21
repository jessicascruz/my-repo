import React, { useState } from "react";
import { Trash2, Edit2, Save, X, Mic, ChevronDown, ChevronUp } from "lucide-react";
import { Note } from "../types";
import { motion, AnimatePresence } from "motion/react";
import * as ui from "../lib/ui";

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
}

/**
 * Nota é transcrição. Então o desenho serve à leitura: texto grande, data em
 * mono, áudio embutido discreto — e nada de card decorado em volta.
 */
export const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const data = new Date(note.createdAt);
  const dataCurta = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const handleSave = () => {
    if (editContent.trim() && editContent !== note.content) {
      onUpdate(note.id, { content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const temDetalhes = !!(note.audioUrl || note.transcription);

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={`group ${ui.superficie} px-4 py-3.5`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <span className={`mt-1 shrink-0 ${ui.monoNum} ${ui.fraco}`}>
          {dataCurta} {hora}
        </span>

        <div className="min-w-0 flex-1 basis-40">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                aria-label="Conteúdo da nota"
                className={`${ui.campo} ${ui.corpoLg} min-h-[7rem] resize-none`}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className={ui.btnPrimario}>
                  <Save className="h-4 w-4" />
                  Salvar nota
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(note.content);
                  }}
                  className={ui.btnFantasma}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className={`${ui.corpoLg} whitespace-pre-wrap`}>{note.content}</p>
          )}

          {note.audioUrl && !isEditing && (
            <span className={`mt-1.5 inline-flex items-center gap-1.5 ${ui.monoRot} ${ui.fraco}`}>
              <Mic className="h-3 w-3" />
              de voz
            </span>
          )}
        </div>

        <div className="flex w-full items-center justify-end sm:w-auto sm:shrink-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className={ui.btnIcone} title="Editar nota">
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(note.id)}
            className={`${ui.btnIcone} hover:text-gravando dark:hover:text-gravando-clara`}
            title="Excluir nota"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {temDetalhes && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className={ui.btnIcone}
              title={isExpanded ? "Recolher áudio e transcrição" : "Ouvir o áudio original"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && temDetalhes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 border-l border-linha pl-4 dark:border-tinta-linha">
              {note.audioUrl && (
                <audio src={note.audioUrl} controls className="h-9 w-full max-w-sm" />
              )}
              {note.transcription && (
                <div>
                  <span className={`${ui.rotulo} mb-1`}>transcrição original</span>
                  <p className={`${ui.corpoSm} ${ui.suave} italic`}>{note.transcription}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
