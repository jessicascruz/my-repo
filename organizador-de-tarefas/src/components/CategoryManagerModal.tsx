import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import { Modal } from "./Modal";
import * as ui from "../lib/ui";

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
    <Modal
      aberto={isOpen}
      onFechar={onClose}
      titulo="Categorias"
      descricao="Crie, renomeie ou exclua as suas categorias."
      largura="sm:max-w-md"
    >
      {errorMsg && (
        <p className={`mb-3 border-l-[3px] border-l-gravando pl-3 ${ui.corpoSm}`}>{errorMsg}</p>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          aria-label="Nova categoria"
          placeholder="Nova categoria"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          maxLength={25}
          className={ui.campo}
        />
        <button type="submit" className={`${ui.btnPrimario} shrink-0`}>
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </form>

      <h3 className={`${ui.rotulo} mb-2 mt-5`}>ativas ({categories.length})</h3>
      <ul className="divide-y divide-linha border-y border-linha dark:divide-tinta-linha dark:border-tinta-linha">
        {categories.map((cat) => {
          const ehPadrao = cat === "Geral";
          const editando = editingCat === cat;
          return (
            <li key={cat} className="flex items-center justify-between gap-2 py-1.5">
              {editando ? (
                <>
                  <input
                    type="text"
                    aria-label={`Novo nome para ${cat}`}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    maxLength={25}
                    className={ui.campo}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(cat)}
                    className={`${ui.btnIcone} shrink-0`}
                    title="Salvar nome"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className={`flex min-w-0 items-center gap-2 ${ui.corpo}`}>
                    <span className="truncate">{cat}</span>
                    {ehPadrao && <span className={ui.chip}>padrão</span>}
                  </span>
                  {!ehPadrao && (
                    <span className="flex shrink-0 items-center">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className={ui.btnIcone}
                        title={`Renomear ${cat}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className={`${ui.btnIcone} hover:text-gravando dark:hover:text-gravando-clara`}
                        title={`Excluir ${cat}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </span>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      <p className={`mt-4 ${ui.corpoSm} ${ui.suave}`}>
        Ao excluir uma categoria, as tarefas dela passam para <strong>Geral</strong>. Ao renomear,
        as tarefas acompanham.
      </p>

      <ConfirmationModal
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => categoryToDelete && onDeleteCategory(categoryToDelete)}
        title="Excluir categoria"
        message={`As tarefas de "${categoryToDelete}" passam para Geral. A categoria some de vez.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </Modal>
  );
}
