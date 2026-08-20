import React, { useState, useMemo } from "react";
import { 
  ListTodo, 
  Search, 
  Plus, 
  X, 
  LayoutGrid, 
  List as ListIcon,
  Filter,
  CheckSquare,
  ListOrdered,
  Hash
} from "lucide-react";
import { List } from "../types";
import { ListForm } from "./ListForm";
import { ListItem } from "./ListItem";
import { motion, AnimatePresence } from "motion/react";

interface ListViewProps {
  lists: List[];
  onAddList: (list: Omit<List, "id" | "userId" | "createdAt">) => void;
  onUpdateList: (id: string, updates: Partial<List>) => void;
  onDeleteList: (id: string) => void;
}

export function ListView({ lists, onAddList, onUpdateList, onDeleteList }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<List["type"] | "all">("all");
  const [isAddingList, setIsAddingList] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredLists = useMemo(() => {
    return lists.filter((list) => {
      const matchesSearch = list.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || list.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [lists, searchQuery, filterType]);

  const handleAddList = (list: Omit<List, "id" | "userId" | "createdAt">) => {
    onAddList(list);
    setIsAddingList(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-indigo-500" />
            Suas Listas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Crie checklists, listas numeradas ou mistas para se organizar.
          </p>
        </div>
        
        {!isAddingList && (
          <button
            onClick={() => setIsAddingList(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Nova Lista
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAddingList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ListForm onAddList={handleAddList} onCancel={() => setIsAddingList(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar listas pelo título..."
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
              onClick={() => setFilterType("checklist")}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                filterType === "checklist"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CheckSquare className="w-3 h-3 text-indigo-500" />
              <span>Checklist</span>
            </button>
            <button
              onClick={() => setFilterType("numbered")}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                filterType === "numbered"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListOrdered className="w-3 h-3 text-indigo-500" />
              <span>Numerada</span>
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
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lists Grid/List */}
      <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
        <AnimatePresence mode="popLayout">
          {filteredLists.map((list) => (
            <ListItem
              key={list.id}
              list={list}
              onDelete={onDeleteList}
              onUpdate={onUpdateList}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredLists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
            <ListTodo className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">
              {searchQuery || filterType !== "all" ? "Nenhuma lista encontrada" : "Você ainda não tem listas"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {searchQuery || filterType !== "all" 
                ? "Tente ajustar seus filtros ou termos de pesquisa." 
                : "Organize seus pensamentos em listas estruturadas. Comece agora!"}
            </p>
          </div>
          {!searchQuery && filterType === "all" && !isAddingList && (
            <button
              onClick={() => setIsAddingList(true)}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
            >
              Criar minha primeira lista
            </button>
          )}
        </div>
      )}
    </div>
  );
}
