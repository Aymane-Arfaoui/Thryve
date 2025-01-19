import { useFirebase } from '../context';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext';

export function useFirebaseUser() {
  const { db } = useFirebase();

  const createUserDocument = async (userId: string) => {
    try {
      const userRef = doc(db, 'user_goals', userId);
      await setDoc(userRef, {
        tasks: [],
        habits: [],
        habit_logs: {},
        long_term_goals: []
      });
      return true;
    } catch (error) {
      console.error('Error creating Firebase user document:', error);
      return false;
    }
  };

  return { createUserDocument };
}