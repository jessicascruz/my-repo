# Task: Smart Note Organizer MVP

Status: 🟢 EM PLANEJAMENTO
Prioridade: P0

## 🎯 Objetivo
Um organizador de notas inteligente que utiliza o Gemini 1.5 Pro para estruturar textos brutos em blocos compatíveis com o Editor.js, persistindo no SQLite (EF Core).

## 🛠️ Stack Tecnológica
- **Backend**: ASP.NET Core 10, Entity Framework Core, SQLite.
- **Frontend**: React (Vite), Tailwind CSS, Editor.js.
- **IA**: Google Gemini API (`gemini-1.5-pro`).

## 📋 Backlog de Tarefas

### Fase 1: Infraestrutura & Backend
- [x] 🏗️ Criar solução ASP.NET Core 10 Web API.
- [x] 📦 Configurar Entity Framework Core com SQLite.
- [x] 🛠️ Implementar `GeminiService` (HttpClient + Prompt Engineering).
- [x] 🔌 Configurar CORS para o frontend Vite.
- [x] 🛣️ Criar endpoint `POST /api/notes/generate` e `PUT /api/notes/{id}`.

### Fase 2: Frontend (React)
- [x] 🚀 Scaffold do projeto Vite + Tailwind.
- [x] 🎣 Criar custom hook `useEditor` para gerenciamento do Editor.js.
- [x] 🎨 Layout Dark Mode (Sidebar + Editor + Input).
- [x] 📤 Componente de upload/texto para envio à API.

### Fase 3: Integração & Testes
- [x] 🔗 Ligar frontend ao backend.
- [ ] 🧪 Testar fluxo de geração -> edição -> salvamento.
- [ ] 🧹 Refinamento visual (Typography & Transitions).

## 📝 Notas de Design
- **Prompt System**: `Transforme este conteúdo em uma estrutura de notas organizada...`.
- **UI**: Minimalista, focado no conteúdo (Zen Mode).
