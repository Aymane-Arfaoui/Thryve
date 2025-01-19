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
  const { completedTasks } = useTasks();
  const { habits } = useHabits();
  const [loading, setLoading] = useState(true);

  // Calculate score based on completed tasks and habits
  const calculateScore = () => {
    const today = new Date().toISOString().split('T')[0];
    const taskScore = completedTasks.length * 10;
    const habitScore = habits.reduce((score, habit) => {
      const completedToday = habit.progress?.[today]?.completed;
      return score + (completedToday ? 5 : 0);
    }, 0);

    return taskScore + habitScore;
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