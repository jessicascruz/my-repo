import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DatabaseSync } from "node:sqlite";
import type { Express } from "express";

// Backend local SQLite: espelha o contrato do Firestore usado por useFirebase.
// ponytail: um único usuário local ("local"). A coluna user_id existe para
// permitir multi-usuário depois, sem migração de schema.
export const LOCAL_USER_ID = "local";

const COLLECTIONS = ["tasks", "notes", "lists"] as const;
type Collection = (typeof COLLECTIONS)[number];

// ponytail: documentos guardados como JSON. types.ts continua sendo o único
// schema; colunas separadas só se precisarmos filtrar/ordenar por outro campo.
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS docs (
    collection TEXT NOT NULL,
    id         TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    created_at TEXT NOT NULL,
    data       TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  );
  CREATE INDEX IF NOT EXISTS docs_by_user ON docs (collection, user_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS prefs (
    user_id TEXT PRIMARY KEY,
    data    TEXT NOT NULL
  );
`;

export function openDb(file = process.env.SQLITE_PATH || "data/app.db") {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  return db;
}

export function mountLocalDb(app: Express, db = openDb()) {
  const isCollection = (c: string): c is Collection =>
    (COLLECTIONS as readonly string[]).includes(c);

  const readPrefs = () => {
    const row = db.prepare("SELECT data FROM prefs WHERE user_id = ?").get(LOCAL_USER_ID) as
      | { data: string }
      | undefined;
    return row ? JSON.parse(row.data) : {};
  };

  app.get("/api/db/prefs", (_req, res) => {
    res.json(readPrefs());
  });

  app.patch("/api/db/prefs", (req, res) => {
    const merged = { ...readPrefs(), ...req.body };
    db.prepare(
      "INSERT INTO prefs (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data"
    ).run(LOCAL_USER_ID, JSON.stringify(merged));
    res.json(merged);
  });

  app.get("/api/db/:collection", (req, res) => {
    const { collection } = req.params;
    if (!isCollection(collection)) return res.status(404).json({ error: "Coleção desconhecida" });
    const rows = db
      .prepare(
        "SELECT data FROM docs WHERE collection = ? AND user_id = ? ORDER BY created_at DESC"
      )
      .all(collection, LOCAL_USER_ID) as { data: string }[];
    res.json(rows.map((r) => JSON.parse(r.data)));
  });

  app.post("/api/db/:collection", (req, res) => {
    const { collection } = req.params;
    if (!isCollection(collection)) return res.status(404).json({ error: "Coleção desconhecida" });
    const doc = {
      ...req.body,
      id: crypto.randomUUID(),
      userId: LOCAL_USER_ID,
      createdAt: new Date().toISOString(),
    };
    db.prepare(
      "INSERT INTO docs (collection, id, user_id, created_at, data) VALUES (?, ?, ?, ?, ?)"
    ).run(collection, doc.id, LOCAL_USER_ID, doc.createdAt, JSON.stringify(doc));
    res.status(201).json(doc);
  });

  app.patch("/api/db/:collection/:id", (req, res) => {
    const { collection, id } = req.params;
    if (!isCollection(collection)) return res.status(404).json({ error: "Coleção desconhecida" });
    const row = db
      .prepare("SELECT data FROM docs WHERE collection = ? AND id = ? AND user_id = ?")
      .get(collection, id, LOCAL_USER_ID) as { data: string } | undefined;
    if (!row) return res.status(404).json({ error: "Documento não encontrado" });
    const updated = { ...JSON.parse(row.data), ...req.body, id, updatedAt: new Date().toISOString() };
    db.prepare("UPDATE docs SET data = ? WHERE collection = ? AND id = ?").run(
      JSON.stringify(updated),
      collection,
      id
    );
    res.json(updated);
  });

  app.delete("/api/db/:collection/:id", (req, res) => {
    const { collection, id } = req.params;
    if (!isCollection(collection)) return res.status(404).json({ error: "Coleção desconhecida" });
    db.prepare("DELETE FROM docs WHERE collection = ? AND id = ? AND user_id = ?").run(
      collection,
      id,
      LOCAL_USER_ID
    );
    res.status(204).end();
  });

  console.log("[db] backend SQLite local montado em /api/db");
}
