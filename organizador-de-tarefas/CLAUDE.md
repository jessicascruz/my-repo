# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm install
npm run dev      # tsx server.ts → Express + Vite middleware na porta 3000 (API e front no mesmo host; PORT muda a porta)
npm run lint     # tsc --noEmit (única verificação automatizada do projeto — não há testes)
npm run build    # vite build + esbuild bundle de server.ts → dist/server.cjs
npm run test:db  # check do backend SQLite local (tsx server-db.test.ts)
npm start        # node dist/server.cjs — exige NODE_ENV=production, senão o server sobe o Vite em middleware mode
```

`.env` local precisa de `GEMINI_API_KEY` (ver `.env.example`). Sem a chave o app continua funcionando em modo degradado (ver "Fallback sem Gemini").

## Arquitetura

App de organização de tarefas por voz, gerado no Google AI Studio (`metadata.json` declara permissão de microfone e `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`). Três camadas:

**1. `server.ts` (Express, arquivo único ~540 linhas)** — hospeda API + front no mesmo processo/porta. Em dev injeta `vite.middlewares`; em prod serve `dist/` com fallback SPA. Existe para manter `GEMINI_API_KEY` no servidor: o front **nunca** chama Gemini direto, sempre via `/api/*`.

Endpoints (todos `POST`, exceto health):
| Rota | Uso |
|---|---|
| `/api/tasks/analyze-audio` | áudio base64 → transcrição + tarefas estruturadas |
| `/api/tasks/transcribe-audio` | áudio base64 → só transcrição (notas rápidas) |
| `/api/tasks/analyze-text` | texto livre → tarefas estruturadas |
| `/api/tasks/suggest-subtasks` | título → 3 subtarefas |

Modelo: `gemini-3.5-flash` com `responseMimeType: application/json` + `responseSchema` explícito. Áudio vai como `inlineData` base64 — daí o `limit: "50mb"` nos body parsers. Os prompts são longos, em pt-BR, e codificam regras de negócio (categorias válidas, mapeamento de horários vagos tipo "final da tarde" → `18:00`, geração de subtarefas). **Ao mudar categorias ou prioridades, atualize os prompts, o `responseSchema` e `fallbackParseText` juntos** — eles duplicam a mesma lista.

**2. Camada de dados plugável — `src/hooks/useDataStore.ts`** escolhe o backend em tempo de módulo pela env `VITE_DATA_BACKEND` (lida pelo front e pelo `server.ts`):

| Valor | Implementação | Auth |
|---|---|---|
| `firebase` (padrão) | `src/hooks/useFirebase.ts` → Firestore em tempo real | popup Google |
| `sqlite` | `src/hooks/useLocalStore.ts` → `fetch` em `/api/db/*` (`server-db.ts`, `node:sqlite`) | nenhuma — usuário fixo `local` |

O contrato comum é a interface `DataStore` em `src/types.ts`; qualquer novo campo precisa existir nos dois hooks. `src/lib/session.ts` faz `login`/`logout` com **import dinâmico** do Firebase — no modo sqlite o SDK nunca é carregado. `src/lib/backend.ts` exporta a flag `BACKEND`.

`server-db.ts` guarda documentos como JSON numa tabela única `docs (collection, id, user_id, created_at, data)` + tabela `prefs` — `types.ts` continua sendo o único schema. Banco em `SQLITE_PATH` (default `data/app.db`). Check: `npm run test:db`. No modo sqlite não há `onSnapshot`: o estado do hook é atualizado com a resposta de cada escrita.

**Firestore (modo `firebase`) — `src/hooks/useFirebase.ts`** é a camada de dados. Não há Redux/Context; o hook expõe `onSnapshot` em tempo real de `users/{uid}/{tasks,notes,lists}` e do doc `users/{uid}` (preferências), mais os CRUDs. Regras:
- Todo write passa por `stripUndefined()` (`src/lib/firebase.ts`) — Firestore rejeita `undefined`.
- Erros passam por `handleFirestoreError()`, que **relança** um `Error` com JSON de diagnóstico (uid, email, path, operação) — formato esperado pelo tooling do AI Studio, não mude a forma.
- O doc do usuário é criado com defaults na primeira leitura, se não existir.
- Auth só via popup Google (`loginWithGoogle`); `App.tsx` renderiza `<Login />` quando `user` é null.

**3. `src/App.tsx` (~1800 linhas)** — monolito que concentra estado de UI, todos os `handleX`, filtros, abas e export (PDF/CSV/JSON), import de backup e drag-and-drop de reordenação. Os componentes em `src/components/` são apresentacionais e recebem callbacks.

Quatro abas: `diarias | notas | listas | arquivo`. `arquivo` é um destino só, com um sub-modo em `arquivoModo` (`concluidas | arquivadas | calendario`) e filtro de período em `historyDate` — foi ali que histórico, arquivadas e calendário se juntaram. As ações de uma-vez-por-mês (planner, resumo, backup, CSV, importar) moram num menu na barra de topo; não há mais sidebar.

Preferências (`categories`, `dndSettings`, `visibleCards`, `darkMode`) **não têm state local**: `App.tsx` define wrappers `setCategories`/`setDndSettings`/`setVisibleCards`/`setDarkMode` que escrevem direto em `updateUserPrefs` e leem de `userPrefs` com fallback de default. Persistência é imediata.

## Pontos que costumam morder

**Lembretes** — `App.tsx` roda um `setInterval` de 1 segundo comparando `task.reminderTime` com o `HH:MM` atual. A cada tick ele também **reseta `reminderTriggered` no Firestore** para tarefas cujo minuto já passou, ou seja, o loop escreve no banco. Três gates de silenciamento se combinam: janela DND (`dndSettings.enabled` + start/end, com wrap de meia-noite), janela de lembretes ativos (`activeRemindersEnabled` + dias da semana) e `muteLowPriority`. Notificação do SO via `Notification` API + `navigator.vibrate`.

**Recorrência** — não há scheduler. Ao concluir uma task com `isRecurring`, `handleToggleComplete` cria uma **nova** task cópia imediatamente (`recurrence` é só metadado descritivo).

**Dark mode / Tailwind v4** — sem `tailwind.config`. Plugin `@tailwindcss/vite`, tokens em `@theme` dentro de `src/index.css`, e a variante dark é custom: `@variant dark (&:where(.dark, .dark *))`. A classe `dark` fica no `<html>`, aplicada por um `useEffect` em `App.tsx` a partir de `userPrefs.darkMode` — é o que faz `html.dark body` valer e habilita `color-scheme` nativo.

**Paleta e tokens** — nada de `slate`/`indigo`/`rose` da escala do Tailwind. Os tokens são em português e vêm do domínio: `pauta`/`pauta-alta`/`pauta-baixa`/`linha` (papel), `tinta`/`tinta-fundo`/`tinta-alta`/`tinta-linha` (texto no claro, fundo no escuro) e os acentos `fita`, `dial`, `gravando`, cada um com variante `-clara` para o escuro. Raio único: `rounded-pauta` (3px). Fontes: Bricolage Grotesque (display), Instrument Sans (corpo), DM Mono (medida).

**Três regras de contraste, medidas e não estimadas** — `dial` sobre papel dá **1,8:1** e `gravando` **3,65:1**, então nenhum dos dois é cor de texto: a cor vive no preenchimento (o ponto, o filete de 3px) e o rótulo é neutro. `fita` sobre papel dá 7,1:1 e é o único acento livre. Em `src/lib/ui.ts`, `suave` (70%) e `fraco` (65%) são o piso — abaixo disso o texto de apoio cai de 4,5:1.

**`src/lib/ui.ts`** — o vocabulário visual é um arquivo de strings de classe, não uma biblioteca de componentes: `foco`, `superficie`, `btnPrimario`, `btnFantasma`, `btnPerigo`, `btnIcone`, `chip`, `campo`, `rotulo`, a escala de tipo e a rampa de categorias dos gráficos. Mudar um valor ali muda a interface inteira. **Nunca ponha `focus:outline-none` junto do `focus-visible:outline-2`**: `:focus` casa ao mesmo tempo, e com a mesma especificidade o `outline-style: none` apaga o anel de foco inteiro.

**Alias `@`** aponta para a **raiz do projeto** (não `src/`), configurado em `vite.config.ts` e `tsconfig.json`. Usado em `import firebaseConfig from '@/firebase-applet-config.json'`.

**HMR** — `vite.config.ts` desliga HMR e file watching quando `DISABLE_HMR=true` (o AI Studio faz isso durante edições de agente). Não alterar.

**Idioma é parte do domínio** — categorias (`Trabalho`, `Saúde`, `Finanças`, …) e prioridades (`Alta`, `Média`, `Baixa`) são strings pt-BR **persistidas no Firestore** e comparadas literalmente no código. Acentos importam. Toda UI e mensagem de erro é pt-BR.

**Sobras da migração para Firestore** — `LOCAL_STORAGE_KEY` / `LOCAL_STORAGE_CATEGORIES_KEY` em `App.tsx` são legado e não são mais lidos. O `localStorage` só é usado de verdade em `useBackupScheduler` (`backup_schedule`, `last_backup_downloaded`) e no `SettingsModal` (agendamento do backup).

**A Pauta** — `src/components/Pauta.tsx` é o elemento assinatura: três faixas (Alta, Média, Baixa), régua de horas, cursor do agora e bandeja de tarefas sem `reminderTime`. É HTML posicionado, não SVG, porque **cada ponto precisa ser um `<button>` real** — alcançável por Tab, com `aria-label` completo e foco visível. O cursor é alimentado pelo minuto que `App.tsx` calcula dentro do `setInterval` de 1s dos lembretes: **não crie um timer novo**. A janela é 06:00–24:00, esticada quando há tarefa fora dela, com 2% de folga nas pontas para o ponto não sair pela borda — régua, marcas, faixa de silêncio e pontos usam a mesma função `fracao()`.

**Modais em `<dialog>` nativo** — `src/components/Modal.tsx` existe pelo comportamento, não pelo estilo: o elemento entrega fechar no Esc, foco preso, fundo inerte e foco devolvido ao gatilho, sem biblioteca. O `onCancel` precisa de `preventDefault()` porque o navegador fecharia o `<dialog>` sem avisar o React.

**Movimento** — `prefers-reduced-motion` é honrado em dois lugares: `MotionConfig reducedMotion="user"` em `src/main.tsx` para o `motion`, e um bloco em `index.css` para as animações em CSS. O confete só dispara no dia 100% concluído.

**Planner impresso** — `generatePlannerImage` em `App.tsx` desenha num `<canvas>` com **cores em hex literal**, fora do alcance do `@theme` e de qualquer grep por nome de cor. Se a paleta mudar, esse trecho precisa mudar à mão.

## Fallback sem Gemini

Sem `GEMINI_API_KEY` (ou com o valor placeholder `MY_GEMINI_API_KEY`):
- `analyze-text` cai no parser heurístico local `fallbackParseText` em `server.ts` — regex pt-BR que infere categoria, prioridade e horário — e responde `isLocalFallback: true`, que a UI sinaliza ao usuário.
- Endpoints de áudio retornam `403` com `error: "GEMINI_API_KEY_NOT_CONFIGURED"`.
- `AudioRecorder.tsx` (o console de voz ancorado no rodapé) tem um segundo nível de fallback: se o upload de áudio falha e o `SpeechRecognition` do browser capturou texto, ele reenvia esse texto para `analyze-text`.

## Ao adicionar uma coleção Firestore

Precisa tocar quatro lugares em sincronia: tipo em `src/types.ts`, listener + CRUD em `useFirebase.ts`, regra em `firestore.rules` (padrão `isOwner(userId)` sob `users/{userId}/…`) e schema em `firebase-blueprint.json` (documento de contrato do AI Studio).

`firebase-applet-config.json` contém a config web pública do Firebase e é versionado de propósito — não é segredo.
