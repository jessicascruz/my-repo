import React, { useState } from "react";
import {
  Trash2,
  Edit2,
  Check,
  CheckSquare,
  ListOrdered,
  Hash,
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
  List as ListIcon,
} from "lucide-react";
import { List } from "../types";
import { motion } from "motion/react";
import { ListForm } from "./ListForm";
import * as ui from "../lib/ui";

const ICON_MAP: Record<string, any> = {
  list: ListIcon,
  "shopping-cart": ShoppingCart,
  plane: Plane,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  utensils: Utensils,
  dumbbell: Dumbbell,
  heart: Heart,
  home: Home,
  code: Code,
  coffee: Coffee,
  smile: Smile,
};

const TIPO: Record<List["type"], { rotulo: string; Icone: any }> = {
  checklist: { rotulo: "checklist", Icone: CheckSquare },
  numbered: { rotulo: "numerada", Icone: ListOrdered },
  mixed: { rotulo: "mista", Icone: Hash },
};

interface ListItemProps {
  list: List;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<List>) => void;
}

/**
 * Cada tipo tem desenho próprio, não três variações do mesmo card:
 * numerada é sequência (sem marcar), checklist é caixa de marcar, mista tem
 * número e caixa. Os itens ficam sempre à vista — o conteúdo é a lista.
 */
export const ListItem: React.FC<ListItemProps> = ({ list, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const marcavel = list.type === "checklist" || list.type === "mixed";
  const numerada = list.type === "numbered" || list.type === "mixed";
  const total = list.items?.length || 0;
  const feitos = list.items.filter((i) => i.completed).length;

  const data = new Date(list.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  const IconeLista = ICON_MAP[list.icon || "list"] || ListIcon;
  const { rotulo, Icone: IconeTipo } = TIPO[list.type];

  const alternar = (itemId: string) => {
    if (!marcavel) return;
    onUpdate(list.id, {
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  if (isEditing) {
    return (
      <div className={`${ui.superficie} p-5`}>
        <ListForm
          initialData={list}
          onAddList={() => {}}
          onUpdateList={(id, updates) => {
            onUpdate(id, updates);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          isCompact
        />
      </div>
    );
  }

  return (
    <motion.section
      layout="position"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={`group ${ui.superficie} px-4 py-3.5`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <IconeLista className={`mt-1 h-4 w-4 shrink-0 ${ui.suave}`} aria-hidden="true" />

        <div className="min-w-0 flex-1 basis-40">
          <h3 className={`${ui.displayMd} break-words`}>{list.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={ui.chip}>
              <IconeTipo className="h-3 w-3 shrink-0" />
              {rotulo}
            </span>
            <span className={`${ui.monoNum} ${ui.fraco}`}>
              {marcavel ? `${feitos}/${total}` : `${total} itens`} · {data}
            </span>
          </div>
        </div>

        <div className="flex w-full items-center justify-end sm:w-auto sm:shrink-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button onClick={() => setIsEditing(true)} className={ui.btnIcone} title="Editar lista">
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(list.id)}
            className={`${ui.btnIcone} hover:text-gravando dark:hover:text-gravando-clara`}
            title="Excluir lista"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progresso: só onde marcar faz sentido */}
      {marcavel && total > 0 && (
        <div
          className="mt-2.5 h-[3px] w-full bg-pauta-baixa dark:bg-tinta-fundo"
          role="progressbar"
          aria-valuenow={feitos}
          aria-valuemax={total}
          aria-label={`${feitos} de ${total} concluídos`}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(feitos / total) * 100}%` }}
            transition={{ duration: 0.25 }}
            className="h-full bg-fita dark:bg-fita-clara"
          />
        </div>
      )}

      <ol className="mt-3 space-y-0.5 border-l border-linha pl-4 dark:border-tinta-linha">
        {list.items.map((item, index) => (
          <li key={item.id} className="flex items-start gap-2">
            {numerada && (
              <span className={`w-5 shrink-0 pt-0.5 text-right ${ui.monoNum} ${ui.fraco}`}>
                {index + 1}
              </span>
            )}

            {marcavel ? (
              <button
                onClick={() => alternar(item.id)}
                aria-pressed={item.completed}
                aria-label={item.text}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-pauta cursor-pointer sm:h-6 sm:w-6 ${ui.foco}`}
              >
                <span
                  className={`grid h-4 w-4 place-items-center rounded-[2px] border transition-colors ${
                    item.completed
                      ? "border-fita bg-fita text-pauta-alta dark:border-fita-clara dark:bg-fita-clara dark:text-tinta"
                      : "border-linha dark:border-tinta-linha"
                  }`}
                >
                  {item.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                </span>
              </button>
            ) : null}

            <span
              className={`flex-1 py-0.5 ${ui.corpo} ${
                item.completed ? `line-through ${ui.fraco}` : ""
              }`}
            >
              {item.text}
            </span>
          </li>
        ))}
      </ol>
    </motion.section>
  );
};
