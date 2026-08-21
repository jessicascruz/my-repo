import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import * as ui from "../lib/ui";

interface ModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  /** Linha de apoio abaixo do título. */
  descricao?: string;
  /** Some com o X quando a decisão é obrigatória. Esc continua fechando. */
  semBotaoFechar?: boolean;
  /** Classe de largura máxima no desktop. */
  largura?: string;
  children: React.ReactNode;
}

/**
 * Casca de modal em <dialog> nativo. O elemento já entrega, de graça e sem
 * biblioteca: fechar no Esc, foco preso dentro do painel, fundo inerte e o
 * foco devolvido ao gatilho na saída. É por isso que existe este componente
 * — comportamento, não estilo.
 */
export function Modal({
  aberto,
  onFechar,
  titulo,
  descricao,
  semBotaoFechar,
  largura = "sm:max-w-lg",
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        // Esc: o navegador fecharia o <dialog> sem avisar o React.
        e.preventDefault();
        onFechar();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onFechar();
      }}
      className={`m-auto w-[min(100vw-1.5rem,32rem)] max-w-none p-0 ${largura} max-h-[90vh] overflow-y-auto rounded-pauta border border-linha bg-pauta-alta text-tinta shadow-2xl backdrop:bg-tinta/45 dark:border-tinta-linha dark:bg-tinta-alta dark:text-pauta dark:backdrop:bg-tinta-fundo/70`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-linha px-5 py-4 dark:border-tinta-linha">
        <div>
          <h2 id={idTitulo} className={ui.displayMd}>
            {titulo}
          </h2>
          {descricao && <p className={`mt-1 ${ui.corpoSm} ${ui.suave}`}>{descricao}</p>}
        </div>
        {!semBotaoFechar && (
          <button onClick={onFechar} title="Fechar" className={`${ui.btnIcone} shrink-0`}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}

/** Seção nomeada dentro de um modal comprido. */
export function SecaoModal({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-linha py-4 first:pt-0 last:border-b-0 last:pb-0 dark:border-tinta-linha">
      <h3 className={`${ui.rotulo} mb-3`}>{titulo}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
