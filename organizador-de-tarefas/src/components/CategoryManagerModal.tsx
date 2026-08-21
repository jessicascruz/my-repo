import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Trash2, Edit2, Check, AlertCircle } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (name: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: CategoryManagerModalProps) {
  const [newCatName, setNewCatName] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg("Essa categoria já existe!");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    onAddCategory(trimmed);
    setNewCatName("");
  };

  const handleStartEdit = (cat: string) => {
    setEditingCat(cat);
    setEditingValue(cat);
  };

  const handleSaveEdit = (oldName: string) => {
    const trimmed = editingValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCat(null);
      return;
    }

    if (
      categories.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName
      )
    ) {
      setErrorMsg("Esse nome de categoria já existe!");
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    onRenameCategory(oldName, trimmed);
    setEditingCat(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] z-10"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-display text-base">
                  Gerenciar Categorias
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Crie, renomeie ou exclua categorias personalizadas
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 border-b border-rose-100 dark:border-rose-950/40">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 select-none">
              {/* Form Add Category */}
              <form onSubmit={handleAdd} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova categoria..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  maxLength={25}
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500 dark:placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Categorias Ativas ({categories.length})
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  {categories.map((cat) => {
                    const isDefault = cat === "Geral";
                    const isCurrentlyEditing = editingCat === cat;

                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition-colors text-xs"
                      >
                        {isCurrentlyEditing ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              maxLength={25}
                              className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(cat)}
                              className="p-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                              title="Salvar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                            {cat}
                            {isDefault && (
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                Padrão
                              </span>
                            )}
                          </span>
                        )}

                        {!isCurrentlyEditing && (
                          <div className="flex items-center gap-1 shrink-0">
                            {!isDefault && (
                              <>
                                <button
                                  onClick={() => handleStartEdit(cat)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                  title="Renomear"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setCategoryToDelete(cat)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors cursor-pointer"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer info banner */}
            <div className="bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 p-4 text-[11px] text-slate-400 dark:text-slate-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500 dark:text-slate-500 shrink-0 mt-0.5" />
              <span>
                Ao excluir uma categoria, todas as tarefas vinculadas a ela serão automaticamente transferidas para o grupo <strong>Geral</strong>. Ao renomear, as tarefas serão atualizadas automaticamente.
              </span>
            </div>
          </motion.div>

          <ConfirmationModal
            isOpen={categoryToDelete !== null}
            onClose={() => setCategoryToDelete(null)}
            onConfirm={() => {
              if (categoryToDelete) {
                onDeleteCategory(categoryToDelete);
              }
            }}
            title="Excluir Categoria"
            message={`Are you sure you want to delete this? (A categoria "${categoryToDelete}" será removida permanentemente e suas tarefas vinculadas serão movidas para "Geral")`}
            confirmText="Excluir"
            cancelText="Cancelar"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
