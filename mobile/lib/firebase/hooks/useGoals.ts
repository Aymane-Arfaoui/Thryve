import { useFirebase } from '../context';
import { doc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

interface Goal {
  // Goals are just strings in the database
}

export function useGoals() {
  const { db } = useFirebase();
  const { user } = useAuth();
  const userId = user?.sub || user?.id;
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      setGoals([]);
      return;
    }

    try {
      const docRef = doc(db, 'user_goals', userId);
      console.log('Setting up goals listener for:', docRef.path);

      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          try {
            if (doc.exists()) {
              const data = doc.data();
              setGoals(Array.isArray(data?.long_term_goals) ? data.long_term_goals : []);
            }
          } catch (error) {
            console.error('Error processing goals data:', error instanceof FirebaseError ? error.code : error);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Firestore goals error:', error instanceof FirebaseError ? 
            { code: error.code, message: error.message } : 
            error
          );
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up goals listener:', error instanceof FirebaseError ? error.code : error);
    }
  }, [userId, db]);

  const completeGoal = async (goalText: string) => {
    if (!userId || !db) return;
    
    try {
      const docRef = doc(db, 'user_goals', userId);
      await updateDoc(docRef, {
        long_term_goals: arrayRemove(goalText)
      });
      console.log('Goal completed and removed:', goalText);
    } catch (error) {
      console.error('Error completing goal:', error instanceof FirebaseError ? error.code : error);
    }
  };

  return {
    goals,
    loading,
    completeGoal,
  };
} 