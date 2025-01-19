import { useFirebase } from '../context';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

interface Habit {
  id: string;
  name: string;
  selectedDays: string[]; // ['monday', 'wednesday', etc.]
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
}

interface HabitLog {
  habitId: string;
  completedDates: string[]; // ISO date strings
}

export function useHabits() {
  const { db } = useFirebase();
  const { user } = useAuth();
  const userId = user?.sub || user?.id;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to habits and habit logs
  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      setHabits([]);
      setHabitLogs([]);
      return;
    }

    try {
      const habitsRef = doc(db, 'habits', userId);
      const habitLogsRef = doc(db, 'habit_logs', userId);

      const unsubscribeHabits = onSnapshot(habitsRef, (doc) => {
        if (doc.exists()) {
          setHabits(doc.data().habits || []);
        }
      });

      const unsubscribeHabitLogs = onSnapshot(habitLogsRef, (doc) => {
        if (doc.exists()) {
          setHabitLogs(doc.data().logs || []);
        }
      });

      setLoading(false);
      return () => {
        unsubscribeHabits();
        unsubscribeHabitLogs();
      };
    } catch (error) {
      console.error('Error setting up habits listener:', error);
      setLoading(false);
    }
  }, [userId, db]);

  // Add new habit
  const addHabit = async (habitData: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak' | 'createdAt'>) => {
    if (!userId || !db) return;

    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const habitsRef = doc(db, 'habits', userId);
      await updateDoc(habitsRef, {
        habits: arrayUnion(newHabit)
      });

      // Initialize habit log
      const habitLogsRef = doc(db, 'habit_logs', userId);
      await updateDoc(habitLogsRef, {
        logs: arrayUnion({
          habitId: newHabit.id,
          completedDates: []
        })
      });
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  // Complete habit for today
  const completeHabit = async (habitId: string) => {
    if (!userId || !db) return;

    const today = new Date().toISOString().split('T')[0];
    const habitLog = habitLogs.find(log => log.habitId === habitId);
    
    if (!habitLog) return;

    try {
      const habitLogsRef = doc(db, 'habit_logs', userId);
      const updatedLogs = habitLogs.map(log => {
        if (log.habitId === habitId) {
          return {
            ...log,
            completedDates: [...new Set([...log.completedDates, today])]
          };
        }
        return log;
      });

      await updateDoc(habitLogsRef, { logs: updatedLogs });

      // Update streaks
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        const currentStreak = calculateCurrentStreak(habitLog.completedDates);
        const longestStreak = Math.max(currentStreak, habit.longestStreak);

        const updatedHabits = habits.map(h => {
          if (h.id === habitId) {
            return { ...h, currentStreak, longestStreak };
          }
          return h;
        });

        const habitsRef = doc(db, 'habits', userId);
        await updateDoc(habitsRef, { habits: updatedHabits });
      }
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  // Delete habit
  const deleteHabit = async (habitId: string) => {
    if (!userId || !db) return;

    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const habitsRef = doc(db, 'habits', userId);
      await updateDoc(habitsRef, {
        habits: arrayRemove(habit)
      });

      const habitLogsRef = doc(db, 'habit_logs', userId);
      const log = habitLogs.find(l => l.habitId === habitId);
      if (log) {
        await updateDoc(habitLogsRef, {
          logs: arrayRemove(log)
        });
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  // Update habit days
  const updateHabitDays = async (habitId: string, selectedDays: string[]) => {
    if (!userId || !db) return;

    try {
      const updatedHabits = habits.map(habit => {
        if (habit.id === habitId) {
          return { ...habit, selectedDays };
        }
        return habit;
      });

      const habitsRef = doc(db, 'habits', userId);
      await updateDoc(habitsRef, { habits: updatedHabits });
    } catch (error) {
      console.error('Error updating habit days:', error);
    }
  };

  return {
    habits,
    habitLogs,
    loading,
    addHabit,
    completeHabit,
    deleteHabit,
    updateHabitDays,
  };
}

// Helper function to calculate current streak
function calculateCurrentStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;

  const sortedDates = [...completedDates].sort();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = 0;
  let currentDate = today;

  // If didn't complete today, check if completed yesterday
  if (!completedDates.includes(today)) {
    if (!completedDates.includes(yesterday)) {
      return 0;
    }
    currentDate = yesterday;
  }

  // Count consecutive days backwards
  while (completedDates.includes(currentDate)) {
    streak++;
    currentDate = new Date(new Date(currentDate).getTime() - 86400000)
      .toISOString()
      .split('T')[0];
  }

  return streak;
} 