// Check mínimo do backend SQLite: sobe o Express em porta efêmera,
// exercita CRUD + prefs contra um banco temporário. Rode: npm run test:db
import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";
import express from "express";
import { mountLocalDb, openDb } from "./server-db";

const dbFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "tasks-db-")), "test.db");
const app = express();
app.use(express.json());
mountLocalDb(app, openDb(dbFile));

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${(server.address() as any).port}/api/db`;
  const json = async (p: string, init?: RequestInit) => {
    const r = await fetch(base + p, { headers: { "Content-Type": "application/json" }, ...init });
    return r.status === 204 ? null : await r.json();
  };

  try {
    assert.deepStrictEqual(await json("/tasks"), [], "coleção começa vazia");
    assert.deepStrictEqual(await json("/prefs"), {}, "prefs começam vazias");

    const task = await json("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Pagar boleto", priority: "Alta", completed: false }),
    });
    assert.ok(task.id && task.createdAt, "POST devolve id e createdAt");

    const updated = await json(`/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });
    assert.strictEqual(updated.completed, true, "PATCH aplica update");
    assert.strictEqual(updated.title, "Pagar boleto", "PATCH preserva campos não enviados");
    assert.ok(updated.updatedAt, "PATCH carimba updatedAt");

    const all = await json("/tasks");
    assert.strictEqual(all.length, 1, "listagem reflete a escrita");

    await json("/prefs", { method: "PATCH", body: JSON.stringify({ darkMode: true }) });
    const prefs = await json("/prefs", {
      method: "PATCH",
      body: JSON.stringify({ categories: ["Trabalho"] }),
    });
    assert.deepStrictEqual(prefs, { darkMode: true, categories: ["Trabalho"] }, "prefs fazem merge");

    await json(`/tasks/${task.id}`, { method: "DELETE" });
    assert.deepStrictEqual(await json("/tasks"), [], "DELETE remove o doc");

    const bad = await fetch(`${base}/hackers`);
    assert.strictEqual(bad.status, 404, "coleção fora da whitelist é rejeitada");

    console.log("OK: server-db passou em todos os checks");
    server.close();
  } catch (err) {
    console.error(err);
    server.close();
    process.exit(1);
  }
});
