export const downloadBackup = (tasks: any[], categories: string[]) => {
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
  
  // Isto precisa ser chamado em resposta a uma interação ou ser um link
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
