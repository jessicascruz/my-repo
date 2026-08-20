// Qual backend de dados está ativo. Definido por VITE_DATA_BACKEND no .env
// (mesma variável lida pelo server.ts para montar ou não /api/db).
export const BACKEND: "firebase" | "sqlite" =
  import.meta.env.VITE_DATA_BACKEND === "sqlite" ? "sqlite" : "firebase";
