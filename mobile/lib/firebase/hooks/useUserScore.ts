import { useFirebase } from '../context';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTasks } from './useTasks';
import { useHabits } from './useHabits';

interface ScoreHistory {
  date: string;
  score: number;
}

export function useUserScore() {
  const { db } = useFirebase();
  const { user } = useAuth();
  const userId = user?.sub || user?.id;
  const [score, setScore] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const { completedTasks, activeTasks } = useTasks();
  const { habits } = useHabits();
  const [loading, setLoading] = useState(true);

  // Calculate score based on completed tasks and habits
  const calculateScore = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate total possible points
    const totalPossiblePoints = 100; // Maximum score is 100%
    
    // Weight distribution (total should be 100)
    const weights = {
      tasks: 60,  // Tasks are worth 60% of total score
      habits: 40  // Habits are worth 40% of total score
    };

    // Task scoring based on priority
    const taskPriorityPoints = {
      high: 15,    // High priority tasks worth more
      medium: 10,  // Medium priority tasks worth medium
      low: 5       // Low priority tasks worth less
    };

    // Calculate task score
    const totalTaskPoints = activeTasks.reduce((total, task) => {
      const priority = task.priority?.toLowerCase() || 'low';
      return total + taskPriorityPoints[priority as keyof typeof taskPriorityPoints];
    }, 0);

    const earnedTaskPoints = completedTasks.reduce((total, task) => {
      const priority = task.priority?.toLowerCase() || 'low';
      return total + taskPriorityPoints[priority as keyof typeof taskPriorityPoints];
    }, 0);

    const taskScore = totalTaskPoints > 0 
      ? (earnedTaskPoints / totalTaskPoints) * weights.tasks 
      : 0;

    // Calculate habit score
    const totalHabitPoints = habits.length * 5; // Each habit is worth 5 points
    const earnedHabitPoints = habits.reduce((total, habit) => {
      const completedToday = habit.progress?.[today]?.completed;
      return total + (completedToday ? 5 : 0);
    }, 0);

    const habitScore = totalHabitPoints > 0 
      ? (earnedHabitPoints / totalHabitPoints) * weights.habits 
      : 0;

    // Calculate final score (percentage)
    const finalScore = Math.min(Math.round(taskScore + habitScore), 100);
    
    return finalScore;
  };

  // Update score in Firebase
  const updateScore = async (newScore: number) => {
    if (!userId || !db) return;

    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'user_goals', userId);

    try {
      await updateDoc(userRef, {
        'score': newScore,
        'scoreHistory': arrayUnion({
          date: today,
          score: newScore
        })
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  // Listen for score changes
  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'user_goals', userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setScore(data.score || 0);
        setScoreHistory(data.scoreHistory || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, db]);

  // Update score when tasks or habits change
  useEffect(() => {
    const newScore = calculateScore();
    if (newScore !== score) {
      updateScore(newScore);
    }
  }, [completedTasks, habits]);

  return {
    score,
    scoreHistory,
    loading
  };
} 