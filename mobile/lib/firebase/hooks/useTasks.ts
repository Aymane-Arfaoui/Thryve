import { useFirebase } from '../context';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface Task {
  id: string;
  name: string;
  dueDate: string;
  priority: string;
  completed: boolean;
  createdAt: string;
}

export function useTasks() {
  const { db } = useFirebase();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Get real-time updates of tasks
    const unsubscribe = onSnapshot(
      doc(db, 'user_goals', user.id),
      (doc) => {
        if (doc.exists()) {
          setTasks(doc.data()?.tasks || []);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    if (!user) return;
    
    const taskToAdd = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const userRef = doc(db, 'user_goals', user.id);
    await updateDoc(userRef, {
      tasks: [...tasks, taskToAdd]
    });
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );

    const userRef = doc(db, 'user_goals', user.id);
    await updateDoc(userRef, { tasks: updatedTasks });
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    const updatedTasks = tasks.filter(task => task.id !== taskId);
    const userRef = doc(db, 'user_goals', user.id);
    await updateDoc(userRef, { tasks: updatedTasks });
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask
  };
} 