import { useState, useEffect } from "react";
import { downloadBackup } from "../lib/backup";

export function useBackupScheduler(tasks: any[], categories: string[]) {
  const [backupAlert, setBackupAlert] = useState<{ message: string; action: () => void } | null>(null);

  useEffect(() => {
    const checkSchedule = () => {
      const saved = localStorage.getItem("backup_schedule");
      if (!saved) return;
      const { frequency, time } = JSON.parse(saved); // time: "HH:MM"
      
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMin = now.getMinutes().toString().padStart(2, "0");
      const currentTimeString = `${currentHour}:${currentMin}`;

      if (currentTimeString === time) {
          // Trigger alert
          setBackupAlert({
              message: "Backup agendado está pronto! Clique aqui para baixar.",
              action: () => {
                  downloadBackup(tasks, categories);
                  setBackupAlert(null);
                  localStorage.setItem("last_backup_downloaded", new Date().toISOString());
              }
          });
      }
    };

    const interval = setInterval(checkSchedule, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, categories]);

  return backupAlert;
}
