// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { doc, setDoc } from 'firebase/firestore';

// // Your Firebase configuration
// const firebaseConfig = {
//   apiKey: "your-api-key",
//   authDomain: "your-auth-domain",
//   projectId: "your-project-id",
//   storageBucket: "your-storage-bucket",
//   messagingSenderId: "your-messaging-sender-id",
//   appId: "your-app-id"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Mock the useFirebase hook
// function useFirebase() {
//   return {
//     db: getFirestore(app)
//   };
// }

// // Recreate the useFirebaseUser hook functionality
// function useFirebaseUser() {
//   const { db } = useFirebase();

//   const createUserDocument = async (userId) => {
//     try {
//       const userRef = doc(db, 'user_goals', userId);
//       await setDoc(userRef, {
//         tasks: [],
//         habits: [],
//         habit_logs: {},
//         long_term_goals: []
//       });
//       return true;
//     } catch (error) {
//       console.error('Error creating Firebase user document:', error);
//       return false;
//     }
//   };

//   return { createUserDocument };
// }

// // Test function
// async function test() {
//   try {
//     // Test user ID - replace with your test user ID
//     const userId = 'test-user-123';

//     console.log('Testing createUserDocument...');
//     const { createUserDocument } = useFirebaseUser();
//     const result = await createUserDocument(userId);
    
//     if (result) {
//       console.log('Successfully created user document!');
//     } else {
//       console.log('Failed to create user document.');
//     }

//   } catch (error) {
//     console.error('Test failed:', error);
//   }
// }

// // Run the test
// test();