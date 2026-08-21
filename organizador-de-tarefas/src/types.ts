export type Priority = "Alta" | "Média" | "Baixa";

export type Category = string;

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  reminderTime: string | null; // Format "HH:MM" or null
  reminderTriggered: boolean; // Flag to prevent multi-triggering
  reminderDays?: number[]; // Days of the week for recurring reminders (0 = Sunday, 1 = Monday, etc.)
  createdAt: string;
  updatedAt?: string; // ISO date of last modification
  notes?: string; // Add notes field
  subtasks?: Subtask[]; // List of subtasks
  archived?: boolean; // Archived tasks flag
  tags?: string[]; // Multiple tags/labels
  isRecurring?: boolean;
  recurrence?: "diario" | "semanal" | "mensal" | null;
}

export interface Note {
  id: string;
  userId: string;
  content: string;
  transcription?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
}

export interface ListEntry {
  id: string;
  text: string;
  completed: boolean;
}

export interface List {
  id: string;
  userId: string;
  title: string;
  icon?: string;
  type: "numbered" | "checklist" | "mixed";
  items: ListEntry[];
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
}

export interface AnalyzeResponse {
  transcription?: string;
  tasks: Omit<Task, "id" | "completed" | "reminderTriggered" | "createdAt" | "updatedAt">[];
}

export interface DndSettings {
  enabled: boolean;
  startTime: string; // Format "HH:MM"
  endTime: string; // Format "HH:MM"
  muteLowPriority: boolean;
  activeRemindersEnabled?: boolean;
  activeRemindersStartTime?: string; // Format "HH:MM"
  activeRemindersEndTime?: string; // Format "HH:MM"
  activeRemindersDays?: number[]; // [0, 1, 2, 3, 4, 5, 6]
}

export interface VisibleCards {
  /** A pauta do dia. Ausente = aberta; é o elemento principal da aba diárias. */
  pauta?: boolean;
  categoryPieChart: boolean;
  dicasHoje: boolean;
  dailyGoal: boolean;
  weeklyProgress: boolean;
  productivitySummary: boolean;
  sugestaoTarefa: boolean;
}


// Contrato da camada de dados — implementado por useFirebase (Firestore)
// e useLocalStore (SQLite local). Ver src/hooks/useDataStore.ts.
export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface UserPrefs {
  categories?: string[];
  dndSettings?: DndSettings;
  visibleCards?: VisibleCards;
  darkMode?: boolean;
}

export interface DataStore {
  user: AppUser | null;
  loading: boolean;
  tasks: Task[];
  notes: Note[];
  lists: List[];
  userPrefs: UserPrefs | null;
  addTask: (task: Omit<Task, "id" | "userId" | "createdAt">) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addNote: (note: Omit<Note, "id" | "userId" | "createdAt">) => Promise<void>;
  updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  addList: (list: Omit<List, "id" | "userId" | "createdAt">) => Promise<void>;
  updateList: (listId: string, updates: Partial<List>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  updateUserPrefs: (updates: UserPrefs) => Promise<void>;
}
