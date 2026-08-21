import React, { useEffect, useState } from "react";
import { LogIn, Mic } from "lucide-react";
import { login } from "../lib/session";
import { Pauta } from "./Pauta";
import * as ui from "../lib/ui";

/**
 * A tela de entrada mostra o que o app faz: uma pauta vazia com o cursor
 * andando com o relógio, o console de voz desabilitado e o convite. Sem card
 * centralizado com brilho em gradiente.
 */
export const Login: React.FC = () => {
  const [minutoAtual, setMinutoAtual] = useState(() => {
    const agora = new Date();
    return agora.getHours() * 60 + agora.getMinutes();
  });

  useEffect(() => {
    const intervalo = setInterval(() => {
      const agora = new Date();
      setMinutoAtual(agora.getHours() * 60 + agora.getMinutes());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const entrar = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-pauta font-sans text-tinta dark:bg-tinta-fundo dark:text-pauta">
      <header className="h-14 shrink-0 border-b border-linha dark:border-tinta-linha">
        <div className="mx-auto flex h-full max-w-[76rem] items-center px-4 sm:px-6">
          <span className="font-display text-[17px] font-extrabold tracking-[-0.02em]">
            EchoPlan
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[76rem] flex-1 px-4 pb-32 sm:px-6">
        <div className="mx-auto max-w-[68rem] pt-12 sm:pt-20">
          <h1 className={ui.displayXl}>
            Fale.<br />O resto é com a gente.
          </h1>
          <p className={`mt-4 max-w-[54ch] ${ui.corpoLg} ${ui.suave}`}>
            Diga em voz alta o que você tem para fazer hoje. O EchoPlan transcreve, separa por
            prioridade e marca a hora de cada uma na pauta do dia.
          </p>

          <div className="mt-10">
            <Pauta
              tasks={[]}
              minutoAtual={minutoAtual}
              dndSettings={{
                enabled: false,
                startTime: "22:00",
                endTime: "07:00",
                muteLowPriority: false,
              }}
              onAbrirTarefa={() => {}}
              onDefinirHorario={() => {}}
              recolhida={false}
            />
          </div>

          <button onClick={entrar} className={`${ui.btnPrimario} mt-8`}>
            <LogIn className="h-4 w-4" />
            Entrar com Google
          </button>
        </div>
      </main>

      {/* O console, ainda desligado: dá para ver onde a voz vai morar. */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-linha bg-pauta-alta dark:border-tinta-linha dark:bg-tinta-alta">
        <div className="mx-auto flex min-h-14 max-w-[68rem] items-center gap-3 px-4 py-3 sm:px-6">
          <span
            aria-hidden="true"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gravando/45 text-pauta-alta"
          >
            <Mic className="h-5 w-5" />
          </span>
          <p className={`${ui.corpoSm} ${ui.suave}`}>Entre para começar a gravar.</p>
        </div>
      </div>
    </div>
  );
};
