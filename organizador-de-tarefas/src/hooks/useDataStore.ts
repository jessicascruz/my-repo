import { BACKEND } from "../lib/backend";
import { useFirebase } from "./useFirebase";
import { useLocalStore } from "./useLocalStore";
import type { DataStore } from "../types";

// Escolha feita em tempo de módulo (BACKEND nunca muda em runtime),
// então nenhum hook é chamado condicionalmente.
export const useDataStore: () => DataStore =
  BACKEND === "sqlite" ? useLocalStore : useFirebase;
