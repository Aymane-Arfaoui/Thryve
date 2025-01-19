import { useFirebase } from '../context';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';
import { format, isAfter, startOfToday, addDays } from 'date-fns';

interface Habit {
  id: string;
  name: string;
  frequency: {
    type: 'daily' | 'weekly';
    days?: string[];  // ['mon', 'tue', etc.]
  };
  progress: {
    [date: string]: {
      completed: boolean;
      timestamp: number;
    };
  };
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
}

interface HabitLog {
  habitId: string;
  completedDates: string[]; // ISO date strings
}

// Helper function to calculate streak (copy from HabitCard)
function calculateStreak(progress: Habit['progress'], frequency: Habit['frequency']) {
  const today = new Date();
  let currentStreak = 0;
  let date = today;
  let lastCompletedDate = null;

  const isDateInFrequency = (date: Date) => {
    const dayId = format(date, 'eee').toLowerCase();
    return frequency.type === 'daily' || 
           (frequency.type === 'weekly' && frequency.days?.includes(dayId));
  };

  // Find the last required day before today
  let lastRequiredDay = today;
  while (lastRequiredDay >= addDays(today, -30)) {
    if (isDateInFrequency(lastRequiredDay)) {
      const dateStr = format(lastRequiredDay, 'yyyy-MM-dd');
      // If we found a completed day, this is our streak start
      if (progress[dateStr]?.completed) {
        lastCompletedDate = lastRequiredDay;
        break;
      }
      // If we found an uncompleted required day that isn't today, streak is broken
      if (lastRequiredDay < today && !progress[dateStr]?.completed) {
        return 0;
      }
      // If it's today and not completed, keep looking back
      if (lastRequiredDay === today && !progress[dateStr]?.completed) {
        lastRequiredDay = addDays(lastRequiredDay, -1);
        continue;
      }
    }
    lastRequiredDay = addDays(lastRequiredDay, -1);
  }

  // If no completed dates found, return 0
  if (!lastCompletedDate) return 0;

  // Count backwards from last completed date
  date = lastCompletedDate;
  currentStreak = 1;  // Start with 1 for the last completed date

  // Look backwards for more completed days
  date = addDays(date, -1);
  while (date >= addDays(today, -30)) {
    if (isDateInFrequency(date)) {
      const dateStr = format(date, 'yyyy-MM-dd');
      if (!progress[dateStr]?.completed) {
        break;
      }
      currentStreak++;
    }
    date = addDays(date, -1);
  }

  return currentStreak;
}

export function useHabits() {
  const { db } = useFirebase();
  const { user } = useAuth();
  const userId = user?.sub || user?.id;
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !db) {
      console.log('No userId or db available for listeners', { userId, db: !!db });
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'user_goals', userId);

      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setHabits(doc.data().habits || []);
          setHabitLogs(doc.data().habit_logs || []);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up habits listener:', error);
      setLoading(false);
    }
  }, [userId, db]);

  const addHabit = async (habitData: Omit<Habit, 'id' | 'currentStreak' | 'longestStreak' | 'createdAt' | 'progress'>) => {
    if (!userId || !db) {
      console.error('AddHabit failed: Missing userId or db', { userId, db: !!db });
      return;
    }

    try {
      const userDocRef = doc(db, 'user_goals', userId);
      const newHabit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        currentStreak: 0,
        longestStreak: 0,
        createdAt: new Date().toISOString(),
        progress: {}  // Initialize empty progress
      };

      const docSnap = await getDoc(userDocRef);
      const currentData = docSnap.data() || {};
      
      const currentHabits = Array.isArray(currentData.habits) ? currentData.habits : [];

      await updateDoc(userDocRef, {
        habits: [...currentHabits, newHabit]
      });

    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  };

  const updateHabit = async (habitData: Habit) => {
    if (!userId || !db) return;

    try {
      const userDocRef = doc(db, 'user_goals', userId);
      
      // Keep existing progress, streak, and creation date
      const existingHabit = habits.find(h => h.id === habitData.id);
      if (!existingHabit) {
        throw new Error('Habit not found');
      }

      const updatedHabit = {
        ...existingHabit,
        name: habitData.name,
        frequency: habitData.frequency,
      };

      const updatedHabits = habits.map(h => 
        h.id === habitData.id ? updatedHabit : h
      );

      await updateDoc(userDocRef, {
        habits: updatedHabits
      });

      return updatedHabit;
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  };

  const completeHabit = async (habitId: string, dateStr: string) => {
    if (!userId || !db) return;

    try {
      const userDocRef = doc(db, 'user_goals', userId);
      
      // Validate date - prevent future dates
      const selectedDate = new Date(dateStr);
      if (isAfter(selectedDate, startOfToday())) {
        throw new Error('Cannot complete habits for future dates');
      }

      // Find the habit to update
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      // Toggle completion status
      const isCompleted = !habit.progress?.[dateStr]?.completed;
      
      // Create updated habit with new progress
      const updatedHabit = {
        ...habit,
        progress: {
          ...habit.progress,
          [dateStr]: {
            completed: isCompleted,
            timestamp: Date.now()
          }
        }
      };

      // Calculate new streak
      const newStreak = calculateStreak(updatedHabit.progress, updatedHabit.frequency);
      updatedHabit.currentStreak = newStreak;
      updatedHabit.longestStreak = Math.max(newStreak, habit.longestStreak || 0);

      // Update in database
      const updatedHabits = habits.map(h => 
        h.id === habitId ? updatedHabit : h
      );

      await updateDoc(userDocRef, {
        habits: updatedHabits
      });

      return {
        completed: isCompleted,
        newStreak,
        isNewRecord: updatedHabit.longestStreak > (habit.longestStreak || 0)
      };
    } catch (error) {
      console.error('Error completing habit:', {
        error,
        habitId,
        dateStr,
        userId
      });
      throw error;
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!userId || !db) {
      console.error('DeleteHabit failed: Missing userId or db', { userId, db: !!db });
      return;
    }

    try {
      const userDocRef = doc(db, 'user_goals', userId);

      // Get current document data
      const docSnap = await getDoc(userDocRef);
      const currentData = docSnap.data() || {};
      
      // Ensure habits array exists
      const currentHabits = Array.isArray(currentData.habits) ? currentData.habits : [];
      
      // Find habit to delete
      const habitToDelete = currentHabits.find(h => h.id === habitId);
      if (!habitToDelete) {
        throw new Error('Habit not found');
      }

      // Filter out the habit to delete
      const updatedHabits = currentHabits.filter(h => h.id !== habitId);

      // Update the document
      await updateDoc(userDocRef, {
        habits: updatedHabits
      });

      console.log('Successfully deleted habit:', {
        habitId,
        habitName: habitToDelete.name,
        remainingHabits: updatedHabits.length
      });

    } catch (error) {
      console.error('Error deleting habit:', {
        error,
        errorType: typeof error,
        errorName: error?.name,
        errorMessage: error?.message,
        habitId,
        userId
      });
      throw error;
    }
  };

  const updateHabitDays = async (habitId: string, selectedDays: string[]) => {
    if (!userId || !db) return;

    try {
      const userDocRef = doc(db, 'user_goals', userId);
      const updatedHabits = habits.map(habit => {
        if (habit.id === habitId) {
          return { ...habit, selectedDays };
        }
        return habit;
      });

      await updateDoc(userDocRef, {
        habits: updatedHabits
      });
    } catch (error) {
      console.error('Error updating habit days:', error);
      throw error;
    }
  };

  return {
    habits,
    habitLogs,
    loading,
    addHabit,
    updateHabit,
    completeHabit,
    deleteHabit,
    updateHabitDays,
  };
} 