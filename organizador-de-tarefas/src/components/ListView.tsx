import { useMemo, useState } from "react";
import { Plus, Search, X, CheckSquare, ListOrdered, Hash } from "lucide-react";
import { List } from "../types";
import { ListForm } from "./ListForm";
import { ListItem } from "./ListItem";
import { AnimatePresence } from "motion/react";
import * as ui from "../lib/ui";

interface ListViewProps {
  lists: List[];
  onAddList: (list: Omit<List, "id" | "userId" | "createdAt">) => void;
  onUpdateList: (id: string, updates: Partial<List>) => void;
  onDeleteList: (id: string) => void;
}

const FILTROS = [
  { id: "all", rotulo: "todas", Icone: null },
  { id: "checklist", rotulo: "checklist", Icone: CheckSquare },
  { id: "numbered", rotulo: "numerada", Icone: ListOrdered },
  { id: "mixed", rotulo: "mista", Icone: Hash },
] as const;

export function ListView({ lists, onAddList, onUpdateList, onDeleteList }: ListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<List["type"] | "all">("all");
  const [isAddingList, setIsAddingList] = useState(false);

  const filteredLists = useMemo(() => {
    const busca = searchQuery.toLowerCase();
    return lists.filter(
      (list) =>
        list.title.toLowerCase().includes(busca) &&
        (filterType === "all" || list.type === filterType)
    );
  }, [lists, searchQuery, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={ui.displayLg}>Listas</h2>
          <p className={`${ui.corpoSm} ${ui.suave}`}>
            Checklist para marcar, numerada para seguir em ordem, mista para as duas coisas.
          </p>
        </div>
        {!isAddingList && (
          <button onClick={() => setIsAddingList(true)} className={ui.btnPrimario}>
            <Plus className="h-4 w-4" />
            Nova lista
          </button>
        )}
      </div>

      {isAddingList && (
        <ListForm
          onAddList={(list) => {
            onAddList(list);
            setIsAddingList(false);
          }}
          onCancel={() => setIsAddingList(false)}
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
            aria-label="Pesquisar listas"
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

        <div className="flex flex-wrap items-center gap-1">
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

        <span className={`${ui.monoRot} ${ui.fraco} ml-auto`}>{filteredLists.length}</span>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredLists.map((list) => (
            <ListItem key={list.id} list={list} onDelete={onDeleteList} onUpdate={onUpdateList} />
          ))}
        </AnimatePresence>

        {filteredLists.length === 0 && (
          <div className={`${ui.superficie} p-10 text-center`}>
            <h3 className={`${ui.displayMd} mb-1`}>
              {searchQuery || filterType !== "all" ? "Nada com esse filtro" : "Nenhuma lista ainda"}
            </h3>
            <p className={`${ui.corpoSm} ${ui.suave} mx-auto max-w-sm`}>
              {searchQuery || filterType !== "all"
                ? "Limpe a busca ou escolha outro tipo."
                : "Toque em Nova lista para montar a primeira."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
