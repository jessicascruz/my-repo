import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { AppUser, DataStore, List, Note, Task, UserPrefs } from "../types";

// Backend SQLite local (rotas /api/db em server-db.ts).
// ponytail: sem sessão real — app local, um usuário só. Se um dia precisar de
// login, é aqui e no server-db.ts (LOCAL_USER_ID) que o uid deixa de ser fixo.
const LOCAL_USER: AppUser = {
  uid: "local",
  displayName: "Modo local",
  email: "sqlite",
  photoURL: null,
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/db${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[${init?.method || "GET"} ${path}] ${res.status}: ${body}`);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export function useLocalStore(): DataStore {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);

  useEffect(() => {
    Promise.all([
      api<Task[]>("/tasks"),
      api<Note[]>("/notes"),
      api<List[]>("/lists"),
      api<UserPrefs>("/prefs"),
    ])
      .then(([t, n, l, p]) => {
        setTasks(t);
        setNotes(n);
        setLists(l);
        setUserPrefs(p);
      })
      .catch((err) => console.error("Falha ao carregar dados locais:", err))
      .finally(() => setLoading(false));
  }, []);

  // ponytail: sem onSnapshot aqui. O estado é atualizado com a resposta do
  // servidor após cada escrita — basta para um app local de um usuário só.
  const makeCrud = <T extends { id: string }>(
    collection: string,
    setItems: Dispatch<SetStateAction<T[]>>
  ) => ({
    add: async (item: any) => {
      const created = await api<T>(`/${collection}`, {
        method: "POST",
        body: JSON.stringify(item),
      });
      setItems((prev) => [created, ...prev]);
    },
    update: async (id: string, updates: any) => {
      const updated = await api<T>(`/${collection}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    },
    remove: async (id: string) => {
      await api<void>(`/${collection}/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== id));
    },
  });

  const taskCrud = makeCrud<Task>("tasks", setTasks);
  const noteCrud = makeCrud<Note>("notes", setNotes);
  const listCrud = makeCrud<List>("lists", setLists);

  const updateUserPrefs = useCallback(async (updates: UserPrefs) => {
    const merged = await api<UserPrefs>("/prefs", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    setUserPrefs(merged);
  }, []);

  return {
    user: LOCAL_USER,
    loading,
    tasks,
    notes,
    lists,
    userPrefs,
    addTask: taskCrud.add,
    updateTask: taskCrud.update,
    deleteTask: taskCrud.remove,
    addNote: noteCrud.add,
    updateNote: noteCrud.update,
    deleteNote: noteCrud.remove,
    addList: listCrud.add,
    updateList: listCrud.update,
    deleteList: listCrud.remove,
    updateUserPrefs,
  };
}
