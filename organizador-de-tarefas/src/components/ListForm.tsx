import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  CheckSquare, 
  ListOrdered, 
  Hash,
  X,
  Save,
  PlusCircle,
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
  CheckCircle2,
  List as ListIcon,
  Smile
} from "lucide-react";
import { List, ListEntry } from "../types";
import { motion, AnimatePresence } from "motion/react";

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

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${isCompact ? '' : 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6'} ${isCompact ? 'space-y-4' : 'space-y-6'}`}
    >
      <div className={`flex items-center justify-between border-b border-slate-100 dark:border-slate-800 ${isCompact ? 'pb-2.5' : 'pb-3.5'}`}>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base font-display">
          <PlusCircle className="w-5 h-5 text-indigo-500" />
          {initialData ? "Editar Lista" : "Nova Lista"}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Title input */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Título da Lista</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Compras do Mês, Checklist de Viagem..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-250 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 outline-none transition-all font-medium text-sm"
          />
        </div>

        {/* List type grid selector */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Tipo de Lista</label>
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setType("checklist")}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                type === "checklist" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Checklist</span>
            </button>
            <button
              type="button"
              onClick={() => setType("numbered")}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                type === "numbered" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Numerada</span>
            </button>
            <button
              type="button"
              onClick={() => setType("mixed")}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                type === "mixed" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Mista</span>
            </button>
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block">Ícone</label>
          <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 justify-between sm:justify-start">
            {AVAILABLE_ICONS.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    icon === item.id 
                      ? "bg-indigo-600 text-white shadow-sm scale-110" 
                      : "bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Items creation block */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Itens da Lista ({items.length})</label>
            {items.length === 0 && (
              <span className="text-[10px] text-rose-500 font-bold uppercase animate-pulse">Adicione pelo menos 1 item</span>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 group bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-2xs"
                  >
                    <div className="flex items-center justify-center w-5.5 h-5.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0">
                      {type === "numbered" || type === "mixed" ? index + 1 : "•"}
                    </div>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItemText(index, e.target.value)}
                      placeholder="Nome do item..."
                      className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 py-0.5 outline-none font-medium border-b border-transparent focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-md transition-all shrink-0 cursor-pointer"
                      title="Remover item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* New Item input bar */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
                placeholder="Adicionar novo item..."
                className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-250 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 outline-none transition-all font-medium"
              />
              <button
                type="button"
                onClick={addItem}
                disabled={!newItemText.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={!title.trim() || items.length === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl shadow-md shadow-indigo-100 dark:shadow-none transition-all text-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Lista</span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs cursor-pointer"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
