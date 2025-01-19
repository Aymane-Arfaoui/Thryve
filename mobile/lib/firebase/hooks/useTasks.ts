import { useFirebase } from '../context';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

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
  const userId = user?.sub || user?.id; // Check both sub and id fields
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to force refresh tasks
  const refreshTasks = async () => {
    if (!userId || !db) return;
    
    try {
      const docRef = doc(db, 'user_goals', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveTasks(Array.isArray(data?.activeTasks) ? data.activeTasks : []);
        setCompletedTasks(Array.isArray(data?.completedTasks) ? data.completedTasks : []);
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error instanceof FirebaseError ? error.code : error);
    }
  };

  // Real-time listener for tasks
  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      setActiveTasks([]);
      setCompletedTasks([]);
      return;
    }

    try {
      const docRef = doc(db, 'user_goals', userId);
      console.log('Attempting to connect to Firestore with docRef:', docRef.path);

      const unsubscribe = onSnapshot(
        docRef,
        async (doc) => {
          try {
            if (doc.exists()) {
              console.log('Document exists:', doc.data());
              const data = doc.data();
              setActiveTasks(Array.isArray(data?.activeTasks) ? data.activeTasks : []);
              setCompletedTasks(Array.isArray(data?.completedTasks) ? data.completedTasks : []);
            } else {
              console.log('Document does not exist, creating...');
              await setDoc(docRef, {
                activeTasks: [],
                completedTasks: []
              });
            }
          } catch (error) {
            console.error('Error processing doc data:', error instanceof FirebaseError ? error.code : error);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Firestore error:', error instanceof FirebaseError ? 
            { code: error.code, message: error.message } : 
            error
          );
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up listener:', error instanceof FirebaseError ? error.code : error);
    }
  }, [userId, db]);

  // Add new task
  const addTask = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    console.log('Adding task:', taskData);
    console.log('Current user:', user);
    console.log('DB instance:', db);
    console.log('User ID:', userId);

    if (!userId || !db) {
      console.error('Missing required instances:', {
        hasUser: !!user,
        hasUserId: !!userId,
        hasDb: !!db,
        userId: userId
      });
      return;
    }

    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    console.log('Formatted new task:', newTask);

    const userRef = doc(db, 'user_goals', userId);
    try {
      // First, check if document exists
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        // Create new document if it doesn't exist
        await setDoc(userRef, {
          activeTasks: [newTask],
          completedTasks: []
        });
        console.log('Created new document with task');
      } else {
        // Update existing document
        await updateDoc(userRef, {
          activeTasks: arrayUnion(newTask)
        });
        console.log('Updated existing document with task');
      }
      console.log('Task added successfully');
    } catch (error: unknown) {
      console.error('Error adding task:', error instanceof FirebaseError ? error.code : error);
    }
  };

  // Complete task
  const completeTask = async (taskId: string) => {
    if (!user) return;

    const task = activeTasks.find(t => t.id === taskId);
    if (!task) return;

    const completedTask = { ...task, completed: true };
    const userRef = doc(db, 'user_goals', userId);

    await updateDoc(userRef, {
      activeTasks: arrayRemove(task),
      completedTasks: arrayUnion(completedTask)
    });
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!userId || !db) return;
    
    const task = activeTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const userRef = doc(db, 'user_goals', userId);
    try {
      await updateDoc(userRef, {
        activeTasks: arrayRemove(task)
      });
    } catch (error: unknown) {
      console.error('Error deleting task:', error instanceof FirebaseError ? error.code : error);
    }
  };

  // Get dashboard tasks (2 most pressing active tasks)
  const getDashboardTasks = () => {
    if (!Array.isArray(activeTasks) || activeTasks.length === 0) return [];

    try {
      return [...activeTasks]
        .sort((a, b) => {
          if (!a?.dueDate || !b?.dueDate) return 0;

          const dateCompare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (dateCompare !== 0) return dateCompare;
          
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          const aPriority = (a?.priority?.toLowerCase?.() || 'low');
          const bPriority = (b?.priority?.toLowerCase?.() || 'low');
          return priorityOrder[aPriority] - priorityOrder[bPriority];
        });
    } catch (error) {
      console.error('Error in getDashboardTasks:', error);
      return [];
    }
  };

  return {
    activeTasks,
    completedTasks,
    loading,
    addTask,
    completeTask,
    deleteTask,
    getDashboardTasks,
    refreshTasks,
  };
} 