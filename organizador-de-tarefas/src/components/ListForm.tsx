import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  CheckSquare, 
  ListOrdered, 
  Hash,
  X,
  Save,
  ShoppingCart,
  Plane,
  Briefcase,
  GraduationCap,
  Utensils,
  Dumbbell,
  Heart,
  Home,
  Code,
  Coffee,
  List as ListIcon,
  Smile
} from "lucide-react";
import { List, ListEntry } from "../types";
import * as ui from "../lib/ui";

const AVAILABLE_ICONS = [
  { id: "list", icon: ListIcon },
  { id: "shopping-cart", icon: ShoppingCart },
  { id: "plane", icon: Plane },
  { id: "briefcase", icon: Briefcase },
  { id: "graduation-cap", icon: GraduationCap },
  { id: "utensils", icon: Utensils },
  { id: "dumbbell", icon: Dumbbell },
  { id: "heart", icon: Heart },
  { id: "home", icon: Home },
  { id: "code", icon: Code },
  { id: "coffee", icon: Coffee },
  { id: "smile", icon: Smile },
];

interface ListFormProps {
  onAddList: (list: Omit<List, "id" | "userId" | "createdAt">) => void;
  onUpdateList?: (id: string, updates: Partial<List>) => void;
  initialData?: List;
  onCancel?: () => void;
  isCompact?: boolean;
}

export function ListForm({ onAddList, onUpdateList, initialData, onCancel, isCompact }: ListFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [icon, setIcon] = useState(initialData?.icon || "list");
  const [type, setType] = useState<List["type"]>(initialData?.type || "checklist");
  const [items, setItems] = useState<ListEntry[]>(initialData?.items || []);
  const [newItemText, setNewItemText] = useState("");

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ListEntry = {
        id: `item-${Date.now()}`,
        text: newItemText.trim(),
        completed: false
      };
      setItems([...items, newItem]);
      setNewItemText("");
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemText = (index: number, text: string) => {
    const newItems = [...items];
    newItems[index].text = text;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || items.length === 0) return;

    if (initialData && onUpdateList) {
      onUpdateList(initialData.id, {
        title: title.trim(),
        icon,
        type,
        items
      });
    } else {
      onAddList({
        title: title.trim(),
        icon,
        type,
        items: items.map((item, index) => ({
          ...item,
          id: item.id || `item-${Date.now()}-${index}`
        })),
      });
    }

    if (!initialData) {
      setTitle("");
      setIcon("list");
      setItems([]);
    }
    setNewItemText("");
  };

  const TIPOS: { id: List["type"]; rotulo: string; Icone: typeof CheckSquare }[] = [
    { id: "checklist", rotulo: "checklist", Icone: CheckSquare },
    { id: "numbered", rotulo: "numerada", Icone: ListOrdered },
    { id: "mixed", rotulo: "mista", Icone: Hash },
  ];

  const botaoEscolha = (ativo: boolean) =>
    `flex items-center justify-center gap-1.5 rounded-pauta border px-2 py-2 cursor-pointer transition-colors ${ui.monoRot} ${ui.foco} ${
      ativo
        ? "border-fita bg-fita text-pauta-alta dark:border-fita-clara dark:bg-fita-clara dark:text-tinta"
        : `border-linha dark:border-tinta-linha ${ui.suave} hover:bg-pauta-baixa dark:hover:bg-tinta-linha`
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`${isCompact ? "" : `${ui.superficie} p-5`} space-y-4`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-linha pb-3 dark:border-tinta-linha">
        <h2 className={ui.displayMd}>{initialData ? "Editar lista" : "Nova lista"}</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className={ui.btnIcone} title="Fechar">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <label className={`${ui.rotulo} mb-1`} htmlFor="lista-titulo">
          título
        </label>
        <input
          id="lista-titulo"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: compras do mês"
          className={ui.campo}
        />
      </div>

      <div>
        <span className={`${ui.rotulo} mb-1`}>tipo</span>
        <div className="grid grid-cols-3 gap-2">
          {TIPOS.map(({ id, rotulo, Icone }) => (
            <button
              key={id}
              type="button"
              aria-pressed={type === id}
              onClick={() => setType(id)}
              className={botaoEscolha(type === id)}
            >
              <Icone className="h-3.5 w-3.5" />
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className={`${ui.rotulo} mb-1`}>ícone</span>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_ICONS.map(({ id, icon: Icone }) => (
            <button
              key={id}
              type="button"
              aria-pressed={icon === id}
              aria-label={`Ícone ${id}`}
              onClick={() => setIcon(id)}
              className={`grid h-9 w-9 place-items-center rounded-pauta border cursor-pointer transition-colors ${ui.foco} ${
                icon === id
                  ? "border-fita bg-fita text-pauta-alta dark:border-fita-clara dark:bg-fita-clara dark:text-tinta"
                  : `border-linha dark:border-tinta-linha ${ui.suave} hover:bg-pauta-baixa dark:hover:bg-tinta-linha`
              }`}
            >
              <Icone className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className={ui.rotulo}>itens ({items.length})</span>
          {items.length === 0 && (
            <span className={`${ui.corpoSm} ${ui.suave}`}>Pelo menos um.</span>
          )}
        </div>

        {items.length > 0 && (
          <ul className="mb-2 max-h-56 divide-y divide-linha overflow-y-auto border-y border-linha dark:divide-tinta-linha dark:border-tinta-linha">
            {items.map((item, index) => (
              <li key={item.id || index} className="flex items-center gap-2 py-1">
                <span className={`w-6 shrink-0 text-right ${ui.monoNum} ${ui.fraco}`}>
                  {type === "checklist" ? "•" : index + 1}
                </span>
                <input
                  type="text"
                  aria-label={`Item ${index + 1}`}
                  value={item.text}
                  onChange={(e) => updateItemText(index, e.target.value)}
                  placeholder="Nome do item"
                  className={`flex-1 border-none bg-transparent py-1 ${ui.corpoSm} ${ui.foco}`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label={`Remover item ${index + 1}`}
                  className={`${ui.btnIcone} shrink-0 hover:text-gravando dark:hover:text-gravando-clara`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            aria-label="Novo item"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            placeholder="Novo item — Enter adiciona"
            className={ui.campo}
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!newItemText.trim()}
            className={`${ui.btnFantasma} shrink-0`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-linha pt-3 dark:border-tinta-linha">
        <button
          type="submit"
          disabled={!title.trim() || items.length === 0}
          className={ui.btnPrimario}
        >
          <Save className="h-4 w-4" />
          Salvar lista
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={ui.btnFantasma}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
