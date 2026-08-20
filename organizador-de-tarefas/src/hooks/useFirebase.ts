import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, stripUndefined } from '../lib/firebase';
import { Task, DndSettings, VisibleCards, Note, List } from '../types';

export function useFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [userPrefs, setUserPrefs] = useState<{
    categories: string[];
    dndSettings: DndSettings;
    visibleCards: VisibleCards;
    darkMode: boolean;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Sync tasks
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/tasks`);
    });

    return unsubscribe;
  }, [user]);

  // Sync notes
  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    const notesRef = collection(db, 'users', user.uid, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(notesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/notes`);
    });

    return unsubscribe;
  }, [user]);

  // Sync lists
  useEffect(() => {
    if (!user) {
      setLists([]);
      return;
    }

    const listsRef = collection(db, 'users', user.uid, 'lists');
    const q = query(listsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as List[];
      setLists(listsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/lists`);
    });

    return unsubscribe;
  }, [user]);

  // Sync user preferences
  useEffect(() => {
    if (!user) {
      setUserPrefs(null);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserPrefs(snapshot.data() as any);
      } else {
        // Initialize user preferences if they don't exist
        const initialPrefs = {
          categories: [
            "Trabalho",
            "Pessoal",
            "Estudos",
            "Saúde",
            "Finanças",
            "Casa",
            "Geral",
            "Outros",
          ],
          dndSettings: {
            enabled: false,
            startTime: "22:00",
            endTime: "07:00",
            muteLowPriority: false,
            activeRemindersEnabled: false,
            activeRemindersStartTime: "08:00",
            activeRemindersEndTime: "18:00",
            activeRemindersDays: [1, 2, 3, 4, 5],
          },
          visibleCards: {
            categoryPieChart: true,
            dicasHoje: true,
            dailyGoal: true,
            weeklyProgress: true,
            productivitySummary: true,
            sugestaoTarefa: true,
          },
          darkMode: false,
        };
        setDoc(userRef, initialPrefs).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
        setUserPrefs(initialPrefs as any);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return unsubscribe;
  }, [user]);

  const addTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const newTaskRef = doc(tasksRef);
    const taskWithMeta = {
      ...task,
      id: newTaskRef.id,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(newTaskRef, stripUndefined(taskWithMeta));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/tasks/${newTaskRef.id}`);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    try {
      await updateDoc(taskRef, stripUndefined({
        ...updates,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    try {
      await deleteDoc(taskRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/tasks/${taskId}`);
    }
  };

  const updateUserPrefs = async (updates: any) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const notesRef = collection(db, 'users', user.uid, 'notes');
    const newNoteRef = doc(notesRef);
    const noteWithMeta = {
      ...note,
      id: newNoteRef.id,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(newNoteRef, stripUndefined(noteWithMeta));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/notes/${newNoteRef.id}`);
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    if (!user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', noteId);
    try {
      await updateDoc(noteRef, stripUndefined({
        ...updates,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/notes/${noteId}`);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', noteId);
    try {
      await deleteDoc(noteRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/notes/${noteId}`);
    }
  };

  const addList = async (list: Omit<List, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const listsRef = collection(db, 'users', user.uid, 'lists');
    const newListRef = doc(listsRef);
    const listWithMeta = {
      ...list,
      id: newListRef.id,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(newListRef, stripUndefined(listWithMeta));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/lists/${newListRef.id}`);
    }
  };

  const updateList = async (listId: string, updates: Partial<List>) => {
    if (!user) return;
    const listRef = doc(db, 'users', user.uid, 'lists', listId);
    try {
      await updateDoc(listRef, stripUndefined({
        ...updates,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/lists/${listId}`);
    }
  };

  const deleteList = async (listId: string) => {
    if (!user) return;
    const listRef = doc(db, 'users', user.uid, 'lists', listId);
    try {
      await deleteDoc(listRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/lists/${listId}`);
    }
  };

  return {
    user,
    loading,
    tasks,
    notes,
    lists,
    userPrefs,
    addTask,
    updateTask,
    deleteTask,
    addNote,
    updateNote,
    deleteNote,
    addList,
    updateList,
    deleteList,
    updateUserPrefs
  };
}
