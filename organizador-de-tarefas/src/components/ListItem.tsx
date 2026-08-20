import React, { useState } from "react";
import { 
  Trash2, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp, 
  ListOrdered, 
  Hash,
  Clock,
  Edit2,
  X,
  CheckCircle2,
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
  Smile,
  List as ListIcon
} from "lucide-react";
import { List, ListEntry } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ListForm } from "./ListForm";

const ICON_MAP: Record<string, any> = {
  "list": ListIcon,
  "shopping-cart": ShoppingCart,
  "plane": Plane,
  "briefcase": Briefcase,
  "graduation-cap": GraduationCap,
  "utensils": Utensils,
  "dumbbell": Dumbbell,
  "heart": Heart,
  "home": Home,
  "code": Code,
  "coffee": Coffee,
  "smile": Smile,
};

interface ListItemProps {
  list: List;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<List>) => void;
}

export const ListItem: React.FC<ListItemProps> = ({ list, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const formattedDate = new Date(list.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const toggleItem = (itemId: string) => {
    const newItems = list.items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdate(list.id, { items: newItems });
  };

  const totalItems = list.items?.length || 0;
  const progress = totalItems > 0 
    ? Math.round((list.items.filter(i => i.completed).length / totalItems) * 100)
    : 0;

  const getTypeIcon = () => {
    switch (list.type) {
      case "numbered": return <ListOrdered className="w-3.5 h-3.5" />;
      case "checklist": return <CheckSquare className="w-3.5 h-3.5" />;
      case "mixed": return <Hash className="w-3.5 h-3.5" />;
    }
  };

  const getTypeText = () => {
    switch (list.type) {
      case "numbered": return "Numerada";
      case "checklist": return "Checklist";
      case "mixed": return "Mista";
    }
  };

  const IconComponent = ICON_MAP[list.icon || "list"] || ListIcon;

  if (isEditing) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 h-fit bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 shadow-md p-5"
      >
        <ListForm 
          initialData={list} 
          onAddList={() => {}} 
          onUpdateList={(id, updates) => {
            onUpdate(id, updates);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          isCompact={true}
        />
      </motion.div>
    );
  }

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
              <div className="flex items-center gap-1.5 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                <IconComponent className="w-3.5 h-3.5" />
                <div className="w-px h-3 bg-indigo-200 dark:bg-indigo-800 mx-1" />
                {getTypeIcon()}
                <span>{getTypeText()}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {formattedDate}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate pr-1 font-display" title={list.title}>
              {list.title}
            </h4>

            <div className="mt-3.5 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter shrink-0">
                {progress}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Editar lista"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(list.id)}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-800/20 rounded-xl transition-all cursor-pointer"
              title="Excluir lista"
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
              <div className="mt-5 pt-5 border-t border-slate-50 dark:border-slate-800 space-y-3">
                {list.items.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3 group">
                    <button
                      onClick={() => (list.type === "checklist" || list.type === "mixed") && toggleItem(item.id)}
                      disabled={list.type === "numbered"}
                      className={`mt-0.5 shrink-0 transition-colors ${
                        list.type === "numbered" 
                          ? "w-5 h-5 flex items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 rounded" 
                          : "hover:scale-110 active:scale-95"
                      }`}
                    >
                      {list.type === "numbered" ? (
                        index + 1
                      ) : item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-500/10" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                    
                    <div className="flex-1 flex items-center gap-2">
                      {list.type === "mixed" && (
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 mr-1 mt-0.5">
                          {index + 1}.
                        </span>
                      )}
                      <span className={`text-sm leading-tight transition-all ${
                        item.completed 
                          ? "text-slate-400 line-through decoration-slate-300 dark:decoration-slate-700" 
                          : "text-slate-600 dark:text-slate-300"
                      }`}>
                        {item.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-all py-1.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-lg"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Ver Menos
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              {list.items.length} itens • Ver Mais
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
