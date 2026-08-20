import { useState, useEffect } from "react";
import { X, Download, Settings, Tags, Calendar, Clock, BellOff, Keyboard, Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DndSettings, VisibleCards } from "../types";

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
  { value: 0, label: "D" },
  { value: 1, label: "S" },
  { value: 2, label: "T" },
  { value: 3, label: "Q" },
  { value: 4, label: "Q" },
  { value: 5, label: "S" },
  { value: 6, label: "S" },
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col z-10"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-display text-base">
                Configurações
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6 overflow-y-auto max-h-[70vh]">
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Backup de Dados
                </h4>
                <button
                  onClick={exportData}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Download className="w-4 h-4" />
                  Exportar tudo como JSON
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Backup Agendado
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="col-span-1">
                    <label className="block text-[10px] text-slate-500 mb-1">Frequência</label>
                    <select
                      value={scheduleFrequency}
                      onChange={(e) => setScheduleFrequency(e.target.value as "daily" | "weekly")}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] text-slate-500 mb-1">Horário</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  O sistema irá te lembrar de baixar o backup no horário escolhido.
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  Notificações do Navegador
                </h4>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Status da Permissão</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        {notificationPermission === "granted" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Ativada</span>
                          </>
                        ) : notificationPermission === "denied" ? (
                          <>
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Bloqueada</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Pendente</span>
                          </>
                        )}
                      </div>
                    </div>

                    {notificationPermission !== "granted" && (
                      <button
                        onClick={requestNotificationPermission}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm"
                      >
                        Solicitar
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    {notificationPermission === "granted" 
                      ? "As notificações estão ativadas. Você receberá lembretes sonoros e visuais." 
                      : notificationPermission === "denied"
                      ? "As notificações foram bloqueadas no seu navegador. Você precisa redefini-las nas configurações do site."
                      : "Clique em solicitar para permitir que o navegador mostre lembretes de tarefas."}
                  </p>

                  <button
                    onClick={testNotification}
                    disabled={notificationPermission !== "granted"}
                    className="w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Enviar Notificação de Teste
                  </button>
                </div>
              </div>

              <div id="dnd-settings-section" className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BellOff className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    Não Perturbe
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      id="dnd-enable-toggle"
                      type="checkbox"
                      checked={dndSettings.enabled}
                      onChange={(e) =>
                        onUpdateDndSettings({ ...dndSettings, enabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>
                
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">
                  Silenciar lembretes e alarmes durante o período de silêncio configurado.
                </p>

                {dndSettings.enabled && (
                  <div className="grid grid-cols-2 gap-3 mb-2 animate-fadeIn duration-200">
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Início do Silêncio</label>
                      <input
                        id="dnd-start-time"
                        type="time"
                        value={dndSettings.startTime}
                        onChange={(e) =>
                          onUpdateDndSettings({ ...dndSettings, startTime: e.target.value })
                        }
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-750 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Fim do Silêncio</label>
                      <input
                        id="dnd-end-time"
                        type="time"
                        value={dndSettings.endTime}
                        onChange={(e) =>
                          onUpdateDndSettings({ ...dndSettings, endTime: e.target.value })
                        }
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-755 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Silenciar Lembretes de Prioridade Baixa */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/70 dark:border-slate-800/60">
                  <div className="flex flex-col pr-2">
                    <span className="text-xs font-semibold text-slate-705 dark:text-slate-250">Silenciar Prioridade Baixa</span>
                    <span className="text-[9px] text-slate-405 dark:text-slate-500">Nunca receber lembretes de tarefas de prioridade Baixa.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      id="mute-low-priority-toggle"
                      type="checkbox"
                      checked={dndSettings.muteLowPriority}
                      onChange={(e) =>
                        onUpdateDndSettings({ ...dndSettings, muteLowPriority: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>

                {/* Período de Lembretes Ativos Granular */}
                <div className="mt-4 pt-3 border-t border-slate-100/70 dark:border-slate-800/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-semibold text-slate-705 dark:text-slate-250">Período de Lembretes Ativos</span>
                      <span className="text-[9px] text-slate-405 dark:text-slate-500">Permitir lembretes apenas em horários e dias da semana específicos.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        id="active-reminders-toggle"
                        type="checkbox"
                        checked={dndSettings.activeRemindersEnabled || false}
                        onChange={(e) =>
                          onUpdateDndSettings({ ...dndSettings, activeRemindersEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {dndSettings.activeRemindersEnabled && (
                    <div className="animate-fadeIn duration-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Início dos Lembretes</label>
                          <input
                            id="active-reminders-start-time"
                            type="time"
                            value={dndSettings.activeRemindersStartTime ?? "08:00"}
                            onChange={(e) =>
                              onUpdateDndSettings({ ...dndSettings, activeRemindersStartTime: e.target.value })
                            }
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-755 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Fim dos Lembretes</label>
                          <input
                            id="active-reminders-end-time"
                            type="time"
                            value={dndSettings.activeRemindersEndTime ?? "18:00"}
                            onChange={(e) =>
                              onUpdateDndSettings({ ...dndSettings, activeRemindersEndTime: e.target.value })
                            }
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-755 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Dias de Lembretes Ativos</label>
                        <div className="flex gap-1.5 mt-1">
                          {WEEK_DAYS.map((day) => {
                            const isSelected = (dndSettings.activeRemindersDays ?? [1, 2, 3, 4, 5]).includes(day.value);
                            return (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => {
                                  const currentDays = dndSettings.activeRemindersDays ?? [1, 2, 3, 4, 5];
                                  let updated;
                                  if (currentDays.includes(day.value)) {
                                    updated = currentDays.filter((d) => d !== day.value);
                                  } else {
                                    updated = [...currentDays, day.value].sort();
                                  }
                                  onUpdateDndSettings({ ...dndSettings, activeRemindersDays: updated });
                                }}
                                className={`w-7 h-7 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer select-none ${
                                  isSelected
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div id="homescreen-cards-visibility-section" className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Cards da Tela Inicial
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4 font-normal">
                  Selecione quais cartões de status e gráficos devem ser renderizados na sua visualização principal.
                </p>

                <div className="space-y-4">
                  {/* Category Pie Chart */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-semibold text-slate-705 dark:text-slate-200">Distribuição de Categorias</span>
                      <span className="text-[9px] text-slate-405 dark:text-slate-500">Gráfico circular das tarefas realizadas hoje.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={visibleCards.categoryPieChart}
                        onChange={(e) =>
                          onUpdateVisibleCards({ ...visibleCards, categoryPieChart: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {/* Dicas de Hoje */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-semibold text-slate-705 dark:text-slate-200">Dicas e Insights de Foco</span>
                      <span className="text-[9px] text-slate-405 dark:text-slate-500">Sugestões e conselhos diários de produtividade.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={visibleCards.dicasHoje}
                        onChange={(e) =>
                          onUpdateVisibleCards({ ...visibleCards, dicasHoje: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {/* Daily Goal */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-semibold text-slate-705 dark:text-slate-200">Barra de Meta Diária</span>
                      <span className="text-[9px] text-slate-405 dark:text-slate-500">Exibe a porcentagem atual concluída do objetivo do dia.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={visibleCards.dailyGoal}
                        onChange={(e) =>
                          onUpdateVisibleCards({ ...visibleCards, dailyGoal: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {/* Weekly Progress */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-semibold text-slate-705 dark:text-slate-200">Histórico de 7 Dias</span>
                      <span className="text-[9px] text-slate-405 dark:text-slate-500">Gráfico de barras vertical do progresso semanal comparativo.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={visibleCards.weeklyProgress}
                        onChange={(e) =>
                          onUpdateVisibleCards({ ...visibleCards, weeklyProgress: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {/* Productivity Summary */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-semibold text-slate-705 dark:text-slate-200">Resumo de Produtividade</span>
                      <span className="text-[9px] text-slate-405 dark:text-slate-500">Resumo analítico das maiores conquistas e desempenho.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={visibleCards.productivitySummary}
                        onChange={(e) =>
                          onUpdateVisibleCards({ ...visibleCards, productivitySummary: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  {/* Sugestão de Tarefas */}
                  <div className="flex items-center justify-between font-normal">
                    <div className="flex flex-col pr-2">
                      <span className="text-xs font-semibold text-slate-705 dark:text-slate-200">Sugestão Automática de Foco</span>
                      <span className="text-[9px] text-slate-405 dark:text-slate-500">Recomendação dinâmica de tarefa prioritária para focar agora.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={visibleCards.sugestaoTarefa}
                        onChange={(e) =>
                          onUpdateVisibleCards({ ...visibleCards, sugestaoTarefa: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Categorias
                </h4>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCategories();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-semibold transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-900/40"
                >
                  <Tags className="w-4 h-4" />
                  Gerenciar Categorias
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  Atalhos de Teclado
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Criar Nova Tarefa</span>
                    <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-250 dark:border-slate-700 rounded-md">
                      Ctrl + N
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Salvar durante edição</span>
                    <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-250 dark:border-slate-700 rounded-md">
                      Ctrl + Enter
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Cancelar edição / Fechar</span>
                    <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-250 dark:border-slate-700 rounded-md">
                      Esc
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Renomear rapidamente</span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      Duplo clique no título
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
