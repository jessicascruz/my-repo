import { useState, useEffect } from "react";
import { Download, Tags, Bell } from "lucide-react";
import { DndSettings, VisibleCards } from "../types";
import { Modal, SecaoModal } from "./Modal";
import * as ui from "../lib/ui";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCategories: () => void;
  tasks: any[];
  categories: string[];
  dndSettings: DndSettings;
  onUpdateDndSettings: (settings: DndSettings) => void;
  visibleCards: VisibleCards;
  onUpdateVisibleCards: (cards: VisibleCards) => void;
}

const WEEK_DAYS = [
  { value: 0, label: "D", fullName: "Domingo" },
  { value: 1, label: "S", fullName: "Segunda" },
  { value: 2, label: "T", fullName: "Terça" },
  { value: 3, label: "Q", fullName: "Quarta" },
  { value: 4, label: "Q", fullName: "Quinta" },
  { value: 5, label: "S", fullName: "Sexta" },
  { value: 6, label: "S", fullName: "Sábado" },
];

export function SettingsModal({
  isOpen,
  onClose,
  onOpenCategories,
  tasks,
  categories,
  dndSettings,
  onUpdateDndSettings,
  visibleCards,
  onUpdateVisibleCards,
}: SettingsModalProps) {
  const [scheduleFrequency, setScheduleFrequency] = useState<"daily" | "weekly">("daily");
  const [scheduleTime, setScheduleTime] = useState<string>("09:00");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem("backup_schedule");
    if (saved) {
      const { frequency, time } = JSON.parse(saved);
      setScheduleFrequency(frequency);
      setScheduleTime(time);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "backup_schedule",
      JSON.stringify({ frequency: scheduleFrequency, time: scheduleTime })
    );
  }, [scheduleFrequency, scheduleTime]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === "granted") {
      new Notification("Permissão Concedida!", {
        body: "Você agora receberá lembretes das suas tarefas.",
        icon: "/favicon.ico"
      });
    }
  };

  const testNotification = () => {
    if (notificationPermission === "granted") {
      new Notification("Teste de Notificação", {
        body: "Este é um teste para confirmar que seus lembretes estão funcionando corretamente.",
        icon: "/favicon.ico"
      });
    }
  };

  const exportData = () => {
    const data = {
      tasks,
      categories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_tarefas_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const interruptor = (
    rotulo: string,
    apoio: string,
    marcado: boolean,
    ao: (v: boolean) => void
  ) => (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="min-w-0">
        <span className={`block ${ui.corpo}`}>{rotulo}</span>
        <span className={`block ${ui.corpoSm} ${ui.suave}`}>{apoio}</span>
      </span>
      <input
        type="checkbox"
        checked={marcado}
        onChange={(e) => ao(e.target.checked)}
        className={`mt-1 h-4 w-4 shrink-0 accent-fita ${ui.foco}`}
      />
    </label>
  );

  const campoHora = (rotulo: string, valor: string, ao: (v: string) => void) => (
    <div>
      <label className={`${ui.rotulo} mb-1`}>{rotulo}</label>
      <input
        type="time"
        value={valor}
        onChange={(e) => ao(e.target.value)}
        className={`${ui.campo} ${ui.monoNum}`}
      />
    </div>
  );

  return (
    <Modal aberto={isOpen} onFechar={onClose} titulo="Ajustes">
      <SecaoModal titulo="silêncio">
        {interruptor(
          "Janela de silêncio",
          "Nenhum lembrete dentro do período. A faixa aparece sombreada na pauta.",
          dndSettings.enabled,
          (v) => onUpdateDndSettings({ ...dndSettings, enabled: v })
        )}
        {dndSettings.enabled && (
          <div className="grid grid-cols-2 gap-3">
            {campoHora("começa", dndSettings.startTime, (v) =>
              onUpdateDndSettings({ ...dndSettings, startTime: v })
            )}
            {campoHora("termina", dndSettings.endTime, (v) =>
              onUpdateDndSettings({ ...dndSettings, endTime: v })
            )}
          </div>
        )}
        {interruptor(
          "Silenciar prioridade Baixa",
          "Tarefa de prioridade Baixa nunca toca lembrete.",
          dndSettings.muteLowPriority,
          (v) => onUpdateDndSettings({ ...dndSettings, muteLowPriority: v })
        )}
      </SecaoModal>

      <SecaoModal titulo="lembretes">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className={ui.corpo}>
            Notificações do sistema:{" "}
            <span className={ui.monoRot}>
              {notificationPermission === "granted"
                ? "ativas"
                : notificationPermission === "denied"
                ? "bloqueadas no navegador"
                : "sem resposta"}
            </span>
          </span>
          {notificationPermission === "granted" ? (
            <button onClick={testNotification} className={ui.btnFantasma}>
              <Bell className="h-4 w-4" />
              Testar
            </button>
          ) : notificationPermission === "default" ? (
            <button onClick={requestNotificationPermission} className={ui.btnPrimario}>
              Permitir
            </button>
          ) : null}
        </div>
        {notificationPermission === "denied" && (
          <p className={`${ui.corpoSm} ${ui.suave}`}>
            O navegador bloqueou as notificações deste site. Libere nas permissões dele para voltar
            a receber lembretes.
          </p>
        )}

        {interruptor(
          "Só em certos horários e dias",
          "Fora dessa janela, nenhum lembrete dispara.",
          dndSettings.activeRemindersEnabled || false,
          (v) => onUpdateDndSettings({ ...dndSettings, activeRemindersEnabled: v })
        )}

        {dndSettings.activeRemindersEnabled && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {campoHora("começa", dndSettings.activeRemindersStartTime ?? "08:00", (v) =>
                onUpdateDndSettings({ ...dndSettings, activeRemindersStartTime: v })
              )}
              {campoHora("termina", dndSettings.activeRemindersEndTime ?? "18:00", (v) =>
                onUpdateDndSettings({ ...dndSettings, activeRemindersEndTime: v })
              )}
            </div>
            <div>
              <span className={`${ui.rotulo} mb-1`}>dias</span>
              <div className="flex flex-wrap gap-1">
                {WEEK_DAYS.map((day) => {
                  const marcado = (dndSettings.activeRemindersDays ?? [1, 2, 3, 4, 5]).includes(
                    day.value
                  );
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={marcado}
                      aria-label={day.fullName}
                      onClick={() => {
                        const atuais = dndSettings.activeRemindersDays ?? [1, 2, 3, 4, 5];
                        onUpdateDndSettings({
                          ...dndSettings,
                          activeRemindersDays: atuais.includes(day.value)
                            ? atuais.filter((d) => d !== day.value)
                            : [...atuais, day.value].sort(),
                        });
                      }}
                      className={`h-8 w-8 cursor-pointer rounded-pauta border font-mono text-[12px] ${ui.foco} ${
                        marcado
                          ? "border-fita bg-fita text-pauta-alta dark:border-fita-clara dark:bg-fita-clara dark:text-tinta"
                          : "border-linha dark:border-tinta-linha"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </SecaoModal>

      <SecaoModal titulo="aparência">
        <p className={`${ui.corpoSm} ${ui.suave}`}>O que aparece na aba diárias.</p>
        {interruptor(
          "A pauta do dia",
          "A linha de tempo com as três faixas de prioridade.",
          visibleCards.pauta !== false,
          (v) => onUpdateVisibleCards({ ...visibleCards, pauta: v })
        )}
        {interruptor(
          "Distribuição por categoria",
          "Rosca das categorias concluídas hoje.",
          visibleCards.categoryPieChart,
          (v) => onUpdateVisibleCards({ ...visibleCards, categoryPieChart: v })
        )}
        {interruptor("Dicas de hoje", "Leitura curta sobre o seu ritmo.", visibleCards.dicasHoje, (v) =>
          onUpdateVisibleCards({ ...visibleCards, dicasHoje: v })
        )}
        {interruptor("Meta diária", "Barra de progresso do dia.", visibleCards.dailyGoal, (v) =>
          onUpdateVisibleCards({ ...visibleCards, dailyGoal: v })
        )}
        {interruptor(
          "Últimos sete dias",
          "Comparação com a sua média recente.",
          visibleCards.weeklyProgress,
          (v) => onUpdateVisibleCards({ ...visibleCards, weeklyProgress: v })
        )}
        {interruptor(
          "Resumo de produtividade",
          "Tempo entre criar e concluir.",
          visibleCards.productivitySummary,
          (v) => onUpdateVisibleCards({ ...visibleCards, productivitySummary: v })
        )}
        {interruptor(
          "Sugestão de foco",
          "Qual tarefa atacar agora.",
          visibleCards.sugestaoTarefa,
          (v) => onUpdateVisibleCards({ ...visibleCards, sugestaoTarefa: v })
        )}
      </SecaoModal>

      <SecaoModal titulo="categorias">
        <p className={`${ui.corpoSm} ${ui.suave}`}>
          {categories.length} categorias cadastradas.
        </p>
        <button
          onClick={() => {
            onClose();
            onOpenCategories();
          }}
          className={ui.btnFantasma}
        >
          <Tags className="h-4 w-4" />
          Gerenciar categorias
        </button>
      </SecaoModal>

      <SecaoModal titulo="backup">
        <p className={`${ui.corpoSm} ${ui.suave}`}>
          O app lembra de baixar um backup no horário escolhido, desde que esteja aberto.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`${ui.rotulo} mb-1`} htmlFor="backup-frequencia">
              frequência
            </label>
            <select
              id="backup-frequencia"
              value={scheduleFrequency}
              onChange={(e) => setScheduleFrequency(e.target.value as "daily" | "weekly")}
              className={ui.campo}
            >
              <option value="daily">Todo dia</option>
              <option value="weekly">Toda semana</option>
            </select>
          </div>
          {campoHora("horário", scheduleTime, setScheduleTime)}
        </div>
      </SecaoModal>

      <SecaoModal titulo="dados">
        <button onClick={exportData} className={ui.btnFantasma}>
          <Download className="h-4 w-4" />
          Baixar backup agora (JSON)
        </button>
      </SecaoModal>

      <SecaoModal titulo="atalhos">
        <dl className={`grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1.5 ${ui.corpoSm}`}>
          <dt className={ui.monoNum}>Ctrl + N</dt>
          <dd>Nova tarefa</dd>
          <dt className={ui.monoNum}>Ctrl + ⏎</dt>
          <dd>Salvar o que está aberto</dd>
          <dt className={ui.monoNum}>Esc</dt>
          <dd>Fechar</dd>
        </dl>
      </SecaoModal>
    </Modal>
  );
}
