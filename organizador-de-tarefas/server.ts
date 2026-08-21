import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { mountLocalDb } from "./server-db";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Use JSON and URL-encoded body parsers with a higher payload limit for audio files
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Request logger middleware
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.path}`);
    next();
  });

  // API Route - Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Backend de dados local (SQLite). Com VITE_DATA_BACKEND=firebase (padrão)
  // nada disso é montado e o front continua falando direto com o Firestore.
  if (process.env.VITE_DATA_BACKEND === "sqlite") {
    mountLocalDb(app);
  }

  // Local Fallback Parser Helper for Portuguese Tasks
  function fallbackParseText(text: string) {
    // Split on typical punctuation or coordinating conjunction " e " (with word boundary)
    const chunks = text.split(/[.;\n]|\s+\be\b\s+/i).map(s => s.trim()).filter(s => s.length > 3);
    const tasks: any[] = [];

    for (const chunk of chunks) {
      const lower = chunk.toLowerCase();

      // Clean typical introductory obligation verbs
      let title = chunk
        .replace(/^(preciso\s+de|preciso|tenho\s+que|lembrar\s+de|não\s+esquecer\s+de|nao\s+esquecer\s+de|devo|vou|gostaria\s+de)\s+/i, "")
        .trim();

      if (title.length === 0) continue;

      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);

      // Limit title to max 8 words
      const words = title.split(/\s+/);
      if (words.length > 8) {
        title = words.slice(0, 8).join(" ") + "...";
      }

      // Determine Category standard options: "Trabalho" | "Pessoal" | "Estudos" | "Saúde" | "Finanças" | "Casa" | "Outros" | "Geral"
      let category = "Geral";
      if (/\b(projeto|reunião|reuniao|equipe|relatório|relatorio|cliente|trabalho|empresa|office|patrão|patrao|entrega|feed|entregar|trabalhar|demandas|demanda|sprint|slack|email|e-mail)\b/i.test(lower)) {
        category = "Trabalho";
      } else if (/\b(médico|medico|remédio|remedio|academia|exercício|exercicio|treinar|treino|saúde|saude|dentista|consulta|caminhar|psicólogo|cardiologista|fisioterapia|corrida)\b/i.test(lower)) {
        category = "Saúde";
      } else if (/\b(pagar|boleto|banco|dinheiro|finanças|financas|conta|energia|luz|água|agua|comprar|fatura|cartão|cartao|custo|custar|preço|preco|gastar|gasto|transferência|pix)\b/i.test(lower)) {
        category = "Finanças";
      } else if (/\b(estudar|prova|aula|faculdade|curso|capítulo|capitulo|ler|estudos|escola|livro|exercícios|tema|tcc|lição|licao)\b/i.test(lower)) {
        category = "Estudos";
      } else if (/\b(casa|limpar|lavar|louça|louca|arrumar|cozinha|mercado|supermercado|aspirar|faxina|roupa|quintal|compras|padaria|pão|pao|leite|feira)\b/i.test(lower)) {
        category = "Casa";
      } else if (/\b(pessoal|passear|amigo|família|familia|mãe|mae|pai|cachorro|pet|gato|cinema|jantar|namorad|filho|filha|aniversário|aniversario|festa|almoçar)\b/i.test(lower)) {
        category = "Pessoal";
      } else if (/\b(outro|outros|tag|avulso|geral)\b/i.test(lower)) {
        category = "Outros";
      }

      // Determine Priority standard options: "Alta" | "Média" | "Baixa"
      let priority = "Média";
      if (
        /\b(urgente|importante|alta|prioridade|correr|imediato|rápido|rapido|assim\s+que|hoje|agora|prazo|amanhã\s+cedo|amanha\s+cedo)\b/i.test(lower) ||
        lower.includes("prazo") ||
        lower.includes("amanhã cedo") ||
        lower.includes("amanha cedo") ||
        lower.includes("urgente")
      ) {
        priority = "Alta";
      } else if (/\b(baixa|sossego|lazer|bobeira|tranquilo|depois|depois\s+eu\s+vejo|quando\s+der|livre|algum\s+dia)\b/i.test(lower)) {
        priority = "Baixa";
      }

      // Extract raw times patterns in Portuguese
      let reminderTime: string | null = null;
      const timeMatch = lower.match(/(?:às|as|de|à|das|horário|horario|às\s+|as\s+)\s*(\d{1,2})(?:\s*h\s*|\s*:\s*)(\d{2})?\b/) || lower.match(/\b(\d{1,2})h(\d{2})?\b/) || lower.match(/\b(\d{1,2}):(\d{2})\b/);
      if (timeMatch) {
        const hourNum = parseInt(timeMatch[1], 10);
        const minStr = timeMatch[2] || "00";
        if (hourNum >= 0 && hourNum < 24) {
          reminderTime = `${hourNum.toString().padStart(2, "0")}:${minStr.padStart(2, "0")}`;
        }
      } else {
        // Human written times
        if (/\b(uma|1)\s*(da\s+tarde|tarde)\b/i.test(lower)) reminderTime = "13:00";
        else if (/\b(duas|2)\s*(da\s+tarde|tarde)\b/i.test(lower)) reminderTime = "14:00";
        else if (/\b(três|tres|3)\s*(da\s+tarde|tarde)\b/i.test(lower)) reminderTime = "15:00";
        else if (/\b(quatro|4)\s*(da\s+tarde|tarde)\b/i.test(lower)) reminderTime = "16:00";
        else if (/\b(cinco|5)\s*(da\s+tarde|tarde)\b/i.test(lower)) reminderTime = "17:00";
        else if (/\b(seis|6)\s*(da\s+tarde|tarde|noite)\b/i.test(lower)) reminderTime = "18:00";
        else if (/\b(sete|7)\s*(da\s+noite|noite)\b/i.test(lower)) reminderTime = "19:00";
        else if (/\b(oito|8)\s*(da\s+noite|noite)\b/i.test(lower)) reminderTime = "20:00";
        else if (/\b(nove|9)\s*(da\s+noite|noite)\b/i.test(lower)) reminderTime = "21:00";
        else if (/\b(dez|10)\s*(da\s+noite|noite)\b/i.test(lower)) reminderTime = "22:00";
        else if (/\b(meia-noite|meia\s+noite|24\s*h)\b/i.test(lower)) reminderTime = "00:00";
        else if (/\b(meio-dia|meio\s+dia|12\s*h)\b/i.test(lower)) reminderTime = "12:00";
      }

      tasks.push({
        title,
        category,
        priority,
        reminderTime,
      });
    }

    return tasks;
  }

  // API Route - Audio Task Analysis and Extraction
  app.post("/api/tasks/analyze-audio", async (req: any, res: any) => {
    try {
      const { audioData, mimeType } = req.body;

      if (!audioData) {
        return res.status(400).json({ error: "O áudio não chegou. Grave de novo." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.status(403).json({
          error: "GEMINI_API_KEY_NOT_CONFIGURED",
          message: "Sem chave do Gemini no servidor: o áudio não pode ser transcrito. Digite o seu dia que as tarefas saem do texto.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Você é um assistente de produtividade especializado e de alto nível em inteligência organizacional para organização diária de tarefas em português do Brasil.
Analise com extrema atenção o arquivo de áudio anexado e transcreva o que o usuário disse sobre as tarefas do seu dia.
Seu objetivo é transcrever o áudio com precisão e extrair uma Fila de Atividades com alto índice de inteligência contextual.

Instruções fundamentais para Melhoria no Processamento de Áudio de IA:
1. Resiliência a Ruído e Vícios de Linguagem: Filtre ativamente ruídos de fundo, suspiros, hesitações ou repetições naturais de fala. Desconsidere marcadores de fala conversacionais (ex: "ééé", "tipo assim", "né", "hã", "então", "deixa eu ver").
2. Correção de Expressões Coloquiais: Identifique expressões idiomáticas informais em português do Brasil e adapte seus títulos de tarefas correspondentes para que sejam profissionais e claros (ex: "dar um tapa no quarto" -> "Arrumar e limpar o quarto").
3. Detecção de Negativa ou Desistência: Se o usuário mencionar uma tarefa e depois cancelar a si mesmo de imediato (ex: "esqueci de falar que preciso comprar leite, ah não deixa, eu já comprei"), ignore essa tarefa ou preserve somente se confirmada.
4. Identificação de Prazos Ocultos ou Lembretes: Se o usuário disser "na hora do almoço", presuma das 12:00 às 13:00 e defina o lembrete como "12:00". Se disser "final da tarde", defina "18:00". Se disser "à noite", defina "20:00". Se disser "logo cedo", defina "08:00". Trate horários explícitos no formato de 24h, ex: "3 da tarde" -> "15:00".
5. Extração de Notas e Detalhamento: Caso o usuário explique especificações ou condições relativas à tarefa (ex: "Ligar para Maria falando sobre o boleto que vence amanhã"), extraia a parte explicativa para compor o campo "notes" daquela tarefa ("Falar sobre o boleto vencido").
6. Geração de Subtarefas Inteligentes: Se for dito uma tarefa complexa (ex: "tenho que organizar minhas finanças do mês: pagar luz, internet e ver a fatura do cartão"), extraia "Organizar finanças do mês" como tarefa principal, e adicione como subtasks individuais: "Pagar conta de luz", "Pagar conta de internet", "Verificar fatura do cartão". Caso o usuário não cite subtasks diretamente mas a tarefa principal sugira uma quebra lógica de passos, sinta-se à vontade para propor de 2 a 3 subtarefas inteligentes em português para ajudar no cumprimento da atividade!
7. Categorias Válidas: Escolha obrigatoriamente uma destas opções padronizadas para cada tarefa: "Trabalho", "Pessoal", "Estudos", "Saúde", "Finanças", "Casa", "Geral" ou "Outros". Estude o contexto do relato para evitar fallbacks desnecessários para "Outros" ou "Geral".
8. Tags Contextuais: Extraia de 1 a 3 tags semânticas e curtas para agregar valor organizativo (ex: "foco", "boleto", "urgente", "pessoal", "estudo").

Retorne a resposta final na estrutura especificada no JSON Schema. Certifique-se de preencher a transcrição completa de forma natural do áudio analisado.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          transcription: {
            type: Type.STRING,
            description: "Texto completo transcrito do áudio de forma exata e contínua."
          },
          tasks: {
            type: Type.ARRAY,
            description: "Lista de tarefas extraídas inteligentemente do áudio.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Título curto da tarefa (máximo de 8 palavras) sintetizado em português."
                },
                category: {
                  type: Type.STRING,
                  description: "Categoria estrita da tarefa: 'Trabalho', 'Pessoal', 'Estudos', 'Saúde', 'Finanças', 'Casa', 'Geral', 'Outros'."
                },
                priority: {
                  type: Type.STRING,
                  description: "Prioridade: 'Alta', 'Média', 'Baixa'."
                },
                reminderTime: {
                  type: Type.STRING,
                  description: "Horário mencionado 'HH:MM' (24h) ou null se inexistente.",
                  nullable: true
                },
                notes: {
                  type: Type.STRING,
                  description: "Detalhamento, notas ou anotações extras relevantes da tarefa. Se inexistente, null.",
                  nullable: true
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Até 3 tags simples e acentuadas do contexto."
                },
                subtasks: {
                  type: Type.ARRAY,
                  description: "Lista de subtarefas/etapas menores complementares.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Título da subtarefa." },
                      completed: { type: Type.BOOLEAN, description: "Deves ser sempre false." }
                    },
                    required: ["title", "completed"]
                  }
                }
              },
              required: ["title", "category", "priority"]
            }
          }
        },
        required: ["transcription", "tasks"]
      };

      const cleanMimeType = (mimeType || "audio/webm").split(";")[0].trim();

      // gemini-3.5-flash natively supports multi-modal audio input
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: audioData,
                mimeType: cleanMimeType,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Resposta de áudio vazia do Gemini.");
      }

      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("Erro na análise de áudio:", error);
      res.status(500).json({
        error: "O áudio não pôde ser analisado. Grave de novo, mais curto, ou use o modo digitar. Detalhe: " + error.message,
      });
    }
  });

  // API Route - Audio Transcription Only (Quick Note)
  app.post("/api/tasks/transcribe-audio", async (req: any, res: any) => {
    try {
      const { audioData, mimeType } = req.body;

      if (!audioData) {
        return res.status(400).json({ error: "O áudio não chegou. Grave de novo." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.status(403).json({
          error: "GEMINI_API_KEY_NOT_CONFIGURED",
          message: "Sem chave do Gemini no servidor. Configure GEMINI_API_KEY para usar áudio.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Você é um assistente de produtividade. Transcreva o seguinte áudio de forma exata de acordo com o que foi dito, em português do Brasil.
Retorne APENAS a transcrição pura do áudio, de forma natural, sem cabeçalhos, sem aspas, e sem textos introdutórios ou explicativos.`;

      const cleanMimeType = (mimeType || "audio/webm").split(";")[0].trim();

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: audioData,
                mimeType: cleanMimeType,
              },
            },
            { text: prompt },
          ],
        },
      });

      const transcription = response.text?.trim() || "";
      res.json({ transcription });
    } catch (error: any) {
      console.error("Erro na transcrição de áudio:", error);
      res.status(500).json({
        error: "O áudio não pôde ser transcrito. Grave de novo, mais curto. Detalhe: " + error.message,
      });
    }
  });

  // API Route - Text Task Analysis and Extraction
  app.post("/api/tasks/analyze-text", async (req: any, res: any) => {
    try {
      const { text } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: "O texto não chegou. Escreva o seu dia e envie de novo." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        // Fallback gracefully to the high-quality local heuristic parser
        const extractedTasks = fallbackParseText(text);
        return res.json({
          tasks: extractedTasks,
          isLocalFallback: true,
          message: "Análise realizada com sucesso usando o processador local heurístico de português (GEMINI_API_KEY não configurada no servidor).",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Você é um assistente de produtividade especializado e de alto nível em inteligência organizacional para organização diária de tarefas em português do Brasil.
Analise a seguinte descrição de texto contendo as tarefas que o usuário precisa fazer hoje:
"${text}"

Seu objetivo é extrair uma lista de tarefas.
Instruções:
1. Extração de Notas e Detalhamento: Caso a descrição explique especificações ou condições relativas à tarefa, extraia a parte explicativa para compor o campo "notes" daquela tarefa.
2. Geração de Subtarefas Inteligentes: Se for dita uma tarefa complexa ou com múltiplos passos, extraia a principal, e adicione como subtasks lógicas as etapas menores em português. Caso a tarefa principal sugira uma quebra lógica de passos, sinta-se à vontade para propor de 2 a 3 subtarefas inteligentes em português para ajudar no cumprimento da atividade!
3. Categorias Válidas: Escolha obrigatoriamente uma destas opções padronizadas para cada tarefa: "Trabalho", "Pessoal", "Estudos", "Saúde", "Finanças", "Casa", "Geral" ou "Outros".
4. Tags Contextuais: Extraia de 1 a 3 tags semânticas e curtas para agregar valor organizativo (ex: "foco", "boleto", "urgente", "pessoal", "estudo").
5. Identificação de Lembretes: Extraia horários implícitos ou explícitos no formato de 24h (por exemplo, "às três da tarde" -> "15:00", ou períodos aproximados como "final de tarde" -> "18:00").

Retorne a resposta final de acordo com a especificação do JSON Schema.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            description: "Lista de tarefas extraídas inteligentemente do texto.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Título curto da tarefa (máximo de 8 palavras) sintetizado em português."
                },
                category: {
                  type: Type.STRING,
                  description: "Categoria estrita da tarefa: 'Trabalho', 'Pessoal', 'Estudos', 'Saúde', 'Finanças', 'Casa', 'Geral', 'Outros'."
                },
                priority: {
                  type: Type.STRING,
                  description: "Prioridade: 'Alta', 'Média', 'Baixa'."
                },
                reminderTime: {
                  type: Type.STRING,
                  description: "Horário mencionado 'HH:MM' (24h) ou null se inexistente.",
                  nullable: true
                },
                notes: {
                  type: Type.STRING,
                  description: "Detalhamento, notas ou anotações extras relevantes da tarefa. Se inexistente, null.",
                  nullable: true
                },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Até 3 tags simples e acentuadas do contexto."
                },
                subtasks: {
                  type: Type.ARRAY,
                  description: "Lista de subtarefas/etapas menores complementares.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Título da subtarefa." },
                      completed: { type: Type.BOOLEAN, description: "Deves ser sempre false." }
                    },
                    required: ["title", "completed"]
                  }
                }
              },
              required: ["title", "category", "priority"]
            }
          }
        },
        required: ["tasks"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Resposta de texto vazia do Gemini.");
      }

      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("Erro na análise de texto:", error);
      res.status(500).json({
        error: "O texto não pôde ser analisado. Descreva as tarefas em português, com verbo e hora. Detalhe: " + error.message,
      });
    }
  });
  
   // API Route - Suggest Subtasks using Gemini
  app.post("/api/tasks/suggest-subtasks", async (req: any, res: any) => {
    try {
      const { taskTitle } = req.body;

      if (!taskTitle || !taskTitle.trim()) {
        return res.status(400).json({ error: "O título da tarefa não chegou." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.status(403).json({
          error: "GEMINI_API_KEY_NOT_CONFIGURED",
          message: "Sem chave do Gemini no servidor. Configure GEMINI_API_KEY para usar áudio.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Sugira 3 subtarefas menores, concretas, completas e muito descritivas para a seguinte tarefa: "${taskTitle}".
      Importante:
      1. Os títulos das subtarefas devem ser completos e detalhados.
      2. NÃO utilize reticências (...) em nenhum dos títulos.
      Retorne SOMENTE um JSON válido exatamente com este formato:
      {
        "subtasks": ["subtarefa 1", "subtarefa 2", "subtarefa 3"]
      }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Resposta vazia do Gemini.");
      }

      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("Erro ao sugerir subtarefas:", error);
      res.status(500).json({
        error: "As subtarefas não foram geradas. Tente de novo em alguns segundos. Detalhe: " + error.message,
      });
    }
  });

  // Global Error catching middleware to ensure any server-side exceptions on /api return JSON instead of HTML stack traces

  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Express Error Handler caught:", err);
    if (res.headersSent) {
      return next(err);
    }
    
    // If it's an API route, return structured JSON, otherwise delegate to default handlers
    if (req.path.startsWith("/api")) {
      return res.status(err.status || err.statusCode || 500).json({
        error: err.name || "ServerError",
        message: err.message || "Ocorreu um erro inesperado no servidor ao processar sua solicitação.",
      });
    }
    
    next(err);
  });

  // Vite middleware for development (after API routes)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
