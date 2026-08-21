import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DndSettings, Priority, Task } from "../types";
import * as ui from "../lib/ui";

interface PautaProps {
  /** Tarefas do dia: pendentes e as concluídas de hoje, sem as arquivadas. */
  tasks: Task[];
  /** Minutos desde 00:00. Vem do setInterval de 1s que o App já roda. */
  minutoAtual: number;
  dndSettings: DndSettings;
  onAbrirTarefa: (id: string) => void;
  /** Arrastar da bandeja para a pauta grava o reminderTime. */
  onDefinirHorario: (id: string, hhmm: string) => void;
  recolhida: boolean;
  onAlternarRecolhida: () => void;
}

const FAIXAS: { prioridade: Priority; rotulo: string }[] = [
  { prioridade: "Alta", rotulo: "alta" },
  { prioridade: "Média", rotulo: "méd" },
  { prioridade: "Baixa", rotulo: "baixa" },
];

/** "HH:MM" → minutos desde 00:00. Devolve null para valor vazio ou torto. */
export function paraMinutos(hhmm: string | null | undefined): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

/** minutos → "HH:MM", grudado no múltiplo de 5 mais perto. */
export function paraHorario(minutos: number): string {
  const limitado = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutos / 5) * 5));
  const h = Math.floor(limitado / 60);
  const m = limitado % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Janela do dia: 06:00–24:00, esticada se houver tarefa fora dela. */
export function janelaDoDia(minutosDasTarefas: number[]): { inicio: number; fim: number } {
  let inicio = 6 * 60;
  let fim = 24 * 60;
  for (const m of minutosDasTarefas) {
    if (m < inicio) inicio = Math.floor(m / 60) * 60;
    if (m > fim) fim = Math.ceil(m / 60) * 60;
  }
  return { inicio, fim };
}

const FUNDO_PONTO: Record<Priority, string> = {
  Alta: "bg-gravando",
  Média: "bg-dial",
  Baixa: "bg-fita dark:bg-fita-clara",
};

const BORDA_PONTO: Record<Priority, string> = {
  Alta: "border-gravando",
  Média: "border-dial",
  Baixa: "border-fita dark:border-fita-clara",
};

interface PontoProps {
  task: Task;
  estilo?: React.CSSProperties;
  onAbrir: () => void;
  arrastavel?: boolean;
  /** Segundos de atraso na entrada: os pontos chegam depois das linhas. */
  atraso?: number;
}

function Ponto({ task, estilo, onAbrir, arrastavel, atraso = 0 }: PontoProps): React.ReactElement {
  const prioridade = task.priority;
  return (
    <motion.button
      type="button"
      style={estilo}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, delay: atraso }}
      draggable={arrastavel}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/pauta-task-id", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onAbrir}
      aria-label={`${task.title}, ${task.reminderTime || "sem hora"}, prioridade ${prioridade}, ${
        task.completed ? "concluída" : "pendente"
      }`}
      title={`${task.reminderTime ? task.reminderTime + " · " : ""}${task.title}`}
      className={`absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full cursor-pointer ${ui.foco}`}
    >
      <span
        className={`h-3 w-3 rounded-full transition-transform hover:scale-125 ${
          task.completed
            ? `border-2 bg-transparent ${BORDA_PONTO[prioridade]}`
            : FUNDO_PONTO[prioridade]
        }`}
      />
    </motion.button>
  );
}

export function Pauta({
  tasks,
  minutoAtual,
  dndSettings,
  onAbrirTarefa,
  onDefinirHorario,
  recolhida,
  onAlternarRecolhida,
}: PautaProps) {
  const semMovimento = useReducedMotion();
  const trilhaRef = useRef<HTMLDivElement>(null);
  const roloRef = useRef<HTMLDivElement>(null);
  const [alvoDeSolta, setAlvoDeSolta] = useState<Priority | null>(null);

  const agendadas = tasks.filter((t) => paraMinutos(t.reminderTime) !== null);
  const semHora = tasks.filter((t) => paraMinutos(t.reminderTime) === null);

  const { inicio, fim } = janelaDoDia(agendadas.map((t) => paraMinutos(t.reminderTime)!));
  const vao = fim - inicio;
  // 2% de folga em cada ponta para o ponto do primeiro e do último horário não
  // sair pela borda. Régua, marcas, silêncio e pontos usam a mesma conta.
  const FOLGA = 0.02;
  const fracao = (minutos: number) => FOLGA + (1 - 2 * FOLGA) * ((minutos - inicio) / vao);
  const pct = (minutos: number) => `${(fracao(minutos) * 100).toFixed(3)}%`;
  const larguraPct = (de: number, ate: number) =>
    `${((1 - 2 * FOLGA) * ((ate - de) / vao) * 100).toFixed(3)}%`;

  // Régua: uma marca a cada 3 horas.
  const horas: number[] = [];
  for (let h = Math.ceil(inicio / 180) * 180; h <= fim; h += 180) horas.push(h);

  // Janela de silêncio: pode dar duas faixas quando vira a meia-noite.
  const dndInicio = dndSettings.enabled ? paraMinutos(dndSettings.startTime) : null;
  const dndFim = dndSettings.enabled ? paraMinutos(dndSettings.endTime) : null;
  const faixasDeSilencio: [number, number][] =
    dndInicio === null || dndFim === null
      ? []
      : dndInicio <= dndFim
      ? [[dndInicio, dndFim]]
      : [
          [dndInicio, fim],
          [inicio, dndFim],
        ];

  const cursorVisivel = minutoAtual >= inicio && minutoAtual <= fim;

  // Ao abrir, centra o agora — importante no mobile, onde a pauta rola.
  useEffect(() => {
    const rolo = roloRef.current;
    if (recolhida || !rolo || !cursorVisivel) return;
    const alvo = fracao(minutoAtual) * rolo.scrollWidth - rolo.clientWidth / 2;
    rolo.scrollLeft = Math.max(0, alvo);
    // Só no primeiro desenho: depois disso quem manda na rolagem é quem lê.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recolhida]);

  const minutosDoEvento = (clientX: number) => {
    const trilha = trilhaRef.current;
    if (!trilha) return null;
    const caixa = trilha.getBoundingClientRect();
    if (caixa.width === 0) return null;
    const f = Math.max(0, Math.min(1, (clientX - caixa.left) / caixa.width));
    return inicio + f * vao;
  };

  const soltar = (e: React.DragEvent) => {
    e.preventDefault();
    setAlvoDeSolta(null);
    const id = e.dataTransfer.getData("text/pauta-task-id");
    const minutos = minutosDoEvento(e.clientX);
    if (!id || minutos === null) return;
    onDefinirHorario(id, paraHorario(minutos));
  };

  return (
    <section aria-labelledby="pauta-titulo" className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="pauta-titulo" className={`${ui.monoRot} ${ui.suave}`}>
          a pauta do dia
        </h2>
        <button
          onClick={onAlternarRecolhida}
          aria-expanded={!recolhida}
          className={`${ui.monoRot} ${ui.suave} flex cursor-pointer items-center gap-1 rounded-pauta px-2 py-1 hover:bg-pauta-baixa dark:hover:bg-tinta-linha ${ui.foco}`}
        >
          {recolhida ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          <span>{recolhida ? "abrir" : "recolher"}</span>
        </button>
      </div>

      {!recolhida && (
        <div className={`${ui.superficie} overflow-hidden`}>
          <div ref={roloRef} className="overflow-x-auto">
            <div className="min-w-[620px] px-4 pb-3 pt-6">
              {/* Régua de horas */}
              <div className="relative ml-16 mr-2 h-4">
                {horas.map((h) => (
                  <span
                    key={h}
                    style={{ left: pct(h) }}
                    className={`absolute -translate-x-1/2 ${ui.monoNum} ${ui.fraco}`}
                  >
                    {String(Math.floor(h / 60)).padStart(2, "0")}
                  </span>
                ))}
              </div>

              {/* Faixas */}
              <div className="relative">
                {/* Trilha: a área onde o tempo é posição. Mede o drop. */}
                <div ref={trilhaRef} className="absolute inset-y-0 left-16 right-2" />

                {FAIXAS.map(({ prioridade, rotulo }, i) => (
                  <div key={prioridade} className="flex h-10 items-center">
                    <span className={`w-16 shrink-0 pr-2 text-right ${ui.monoRot} ${ui.fraco}`}>
                      {rotulo}
                    </span>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setAlvoDeSolta(prioridade);
                      }}
                      onDragLeave={() => setAlvoDeSolta(null)}
                      onDrop={soltar}
                      className={`relative mr-2 h-full flex-1 ${
                        alvoDeSolta === prioridade ? "bg-fita/8 dark:bg-fita-clara/10" : ""
                      }`}
                    >
                      {/* Silêncio: a configuração fica visível, não escondida em Ajustes */}
                      {faixasDeSilencio.map(([de, ate], k) => (
                        <span
                          key={k}
                          aria-hidden="true"
                          style={{ left: pct(de), width: larguraPct(de, ate) }}
                          className="absolute inset-y-0 bg-pauta-baixa dark:bg-tinta-fundo"
                        />
                      ))}

                      {/* Marcas de 3h */}
                      {horas.map((h) => (
                        <span
                          key={h}
                          aria-hidden="true"
                          style={{ left: pct(h) }}
                          className="absolute inset-y-1 w-px bg-linha/70 dark:bg-tinta-linha"
                        />
                      ))}

                      {/* A linha da pauta */}
                      <motion.span
                        aria-hidden="true"
                        initial={semMovimento ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.32, delay: i * 0.06, ease: "easeOut" }}
                        className="absolute inset-x-0 top-1/2 h-px origin-left bg-linha dark:bg-tinta-linha"
                      />

                      {agendadas
                        .filter((t) => t.priority === prioridade)
                        .sort(
                          (a, b) => paraMinutos(a.reminderTime)! - paraMinutos(b.reminderTime)!
                        )
                        .map((t, j) => (
                          <React.Fragment key={t.id}>
                            <Ponto
                              task={t}
                              estilo={{ left: pct(paraMinutos(t.reminderTime)!), top: "50%" }}
                              onAbrir={() => onAbrirTarefa(t.id)}
                              atraso={semMovimento ? 0 : 0.38 + j * 0.04}
                            />
                          </React.Fragment>
                        ))}
                    </div>
                  </div>
                ))}

                {/* Cursor: o agora. Anda com o relógio, é informação e não enfeite. */}
                {cursorVisivel && (
                  <div className="pointer-events-none absolute inset-y-0 left-16 right-2">
                    <div
                      style={{ left: pct(minutoAtual) }}
                      className="absolute -top-1 bottom-0 w-px bg-tinta dark:bg-pauta"
                    >
                      <span className="absolute -left-[3px] -top-1 h-1.5 w-1.5 rotate-45 bg-tinta dark:bg-pauta" />
                    </div>
                  </div>
                )}
              </div>

              {/* Cursor: rótulo do agora */}
              {cursorVisivel && (
                <div className="relative ml-16 mr-2 mt-1 h-4">
                  <span
                    style={{ left: pct(minutoAtual) }}
                    className={`absolute ${ui.monoNum}`}
                  >
                    agora {paraHorario(minutoAtual)}
                  </span>
                </div>
              )}

              {/* Bandeja: tarefa sem hora tem lugar honesto, não se mistura */}
              <div className="mt-3 flex items-center gap-3 border-t border-linha pt-3 dark:border-tinta-linha">
                <span
                  className={`w-16 shrink-0 pr-2 text-right leading-none ${ui.monoRot} ${ui.fraco}`}
                >
                  sem hora
                </span>
                <div className="relative flex h-6 flex-1 items-center gap-2">
                  {semHora.length === 0 ? (
                    <span className={`${ui.corpoSm} ${ui.fraco}`}>
                      Nada sem hora. Arraste um ponto daqui para a pauta para marcar.
                    </span>
                  ) : (
                    semHora.map((t) => (
                      <span key={t.id} className="relative h-6 w-6 shrink-0">
                        <Ponto
                          task={t}
                          estilo={{ left: "50%", top: "50%" }}
                          onAbrir={() => onAbrirTarefa(t.id)}
                          arrastavel
                        />
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
