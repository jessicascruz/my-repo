// Vocabulário visual da interface: strings de classe Tailwind, nada mais.
// Sem componente-invólucro, sem cva, sem dependência nova — os componentes
// de src/components/ já são apresentacionais e passam a compor daqui.
//
// Ao mudar um valor aqui, ele muda em toda a interface. É de propósito.

/** Obrigatório em tudo que é clicável ou focável. */
export const foco =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fita dark:focus-visible:outline-fita-clara focus:outline-none";

/** Superfície elevada: card, painel, linha de lista. Borda separa, não sombra. */
export const superficie =
  "bg-pauta-alta dark:bg-tinta-alta border border-linha dark:border-tinta-linha rounded-pauta";

/** Superfície recuada — usada para bandeja, fundo de campo, faixa de silêncio. */
export const superficieBaixa = "bg-pauta-baixa dark:bg-tinta-fundo";

const btnBase = `inline-flex items-center justify-center gap-2 rounded-pauta px-4 py-2 text-[15px] font-medium cursor-pointer transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${foco}`;

/** Ação principal da tela. Único acento livre em qualquer tamanho. */
export const btnPrimario = `${btnBase} bg-fita text-pauta-alta hover:bg-fita/88 dark:bg-fita-clara dark:text-tinta dark:hover:bg-fita-clara/88`;

/** Ação secundária. Borda em vez de preenchimento. */
export const btnFantasma = `${btnBase} border border-linha dark:border-tinta-linha text-tinta dark:text-pauta hover:bg-pauta-baixa dark:hover:bg-tinta-linha`;

/** Destrutivo: excluir, limpar tudo. */
export const btnPerigo = `${btnBase} border border-gravando/45 text-gravando dark:text-gravando-clara hover:bg-gravando hover:text-pauta-alta hover:border-gravando dark:hover:bg-gravando-clara dark:hover:text-tinta`;

/** Botão só de ícone — alvo de 44px no mobile, 36px no desktop. */
export const btnIcone = `inline-flex items-center justify-center h-11 w-11 sm:h-9 sm:w-9 rounded-pauta text-tinta/70 dark:text-pauta/70 hover:bg-pauta-baixa dark:hover:bg-tinta-linha cursor-pointer transition-colors ${foco}`;

/** Etiqueta de dado: categoria, tag, contador. */
export const chip =
  "inline-flex items-center gap-1.5 rounded-pauta border border-linha dark:border-tinta-linha px-2 py-0.5 font-mono text-[11px] tracking-[0.06em] text-tinta/70 dark:text-pauta/70";

/** Campo de formulário: input, textarea, select. */
export const campo = `w-full rounded-pauta border border-linha dark:border-tinta-linha bg-pauta-alta dark:bg-tinta-fundo px-3 py-2 text-[15px] text-tinta dark:text-pauta placeholder:text-tinta/40 dark:placeholder:text-pauta/40 ${foco}`;

/** Rótulo de campo ou de seção, sempre em caixa alta e mono. */
export const rotulo =
  "block font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-tinta/55 dark:text-pauta/55";

/** Casca de modal: overlay + painel. Sombra só aqui e no console. */
export const cascaModalOverlay =
  "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-tinta/45 dark:bg-tinta-fundo/70 p-0 sm:p-6";
export const cascaModalPainel = `${superficie} relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl rounded-t-[10px] sm:rounded-pauta`;

// ── Escala de tipo: seis degraus de leitura, dois utilitários ────────────────
export const displayXl =
  "font-display font-extrabold tracking-[-0.03em] leading-[0.96] text-[clamp(38px,7vw,64px)]";
export const displayLg =
  "font-display font-extrabold tracking-[-0.02em] leading-[1.08] text-[clamp(24px,4vw,34px)]";
export const displayMd = "font-display font-semibold tracking-[-0.01em] text-[19px]";
export const corpoLg = "text-[17px] leading-relaxed";
export const corpo = "text-[15px]";
export const corpoSm = "text-[13.5px]";
/** Rótulo utilitário em caixa alta. */
export const monoRot = "font-mono text-[11px] font-medium uppercase tracking-[0.1em]";
/** Medida: horário, cronômetro, contador. Monoespaçado alinha em coluna. */
export const monoNum = "font-mono text-[13px] tabular-nums";
export const monoNumLg = "font-mono text-[15px] tabular-nums";

/** Texto de apoio. */
export const suave = "text-tinta/70 dark:text-pauta/70";
export const fraco = "text-tinta/45 dark:text-pauta/45";

/**
 * Marca de prioridade — mesma gramática na pauta, na lista e no calendário.
 * A cor vive no preenchimento e na borda, nunca no texto: `dial` sobre papel
 * dá ~1,9:1 e `gravando` ~4,0:1, então rótulo de prioridade é sempre neutro
 * (`suave`) e quem carrega a cor é o ponto ou o filete de 3px.
 * `corIconePrioridade` só para ícone ou texto de 18px ou mais.
 */
export const corIconePrioridade = {
  Alta: "text-gravando dark:text-gravando-clara",
  Média: "text-tinta dark:text-dial-clara",
  Baixa: "text-fita dark:text-fita-clara",
} as const;

/**
 * Rampa de categorias para os gráficos. As categorias são dados do usuário e
 * podem crescer, então em vez de oito cores inventadas há uma rampa derivada
 * de `fita`, variando luminosidade e saturação. Os passos alternam claro e
 * escuro de propósito: vizinhos na rosca ficam distinguíveis mesmo com doze
 * categorias. A luminosidade fica entre 38% e 80% para funcionar tanto sobre
 * papel quanto sobre tinta — uma rampa só, nos dois temas.
 *
 * Cor não é o rótulo: o rótulo é o rótulo, sempre escrito.
 */
const PASSOS_RAMPA: [number, number, number][] = [
  [167, 62, 40],
  [164, 42, 72],
  [170, 55, 50],
  [162, 38, 80],
  [168, 68, 44],
  [165, 45, 66],
  [172, 58, 56],
  [158, 32, 76],
  [166, 72, 38],
  [163, 40, 70],
  [169, 50, 60],
  [174, 36, 78],
];

/** `dial` fica reservado para "Outros". */
export const COR_OUTROS = "#f0a828";

export function corDaCategoria(nome: string, indice: number): string {
  if (nome === "Outros") return COR_OUTROS;
  const [h, s, l] = PASSOS_RAMPA[indice % PASSOS_RAMPA.length];
  return `hsl(${h} ${s}% ${l}%)`;
}

/** Cores fixas dos gráficos, iguais aos tokens do @theme. */
export const CORES_GRAFICO = {
  fita: "#0e5c4a",
  fitaClara: "#34a98b",
  dial: "#f0a828",
  gravando: "#e2453a",
  linha: "#c6c1b3",
  linhaEscura: "#2a2e35",
} as const;

export const fundoPrioridade = {
  Alta: "bg-gravando",
  Média: "bg-dial",
  Baixa: "bg-fita dark:bg-fita-clara",
} as const;
