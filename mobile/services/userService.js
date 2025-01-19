import {supabase} from '../lib/supabase';
// import { doc, getDoc } from 'firebase/firestore';

export const getUserData = async (userId) => {
    try{
        const {data, error} = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();

        if(error) {
            return {success: false, msg: error.message}
        }

        return {success: true, data};
    }
    catch(error){
        console.log(error);
        return {success: false, msg: error.message}
    }
}

// // Separate function to get user goals and actions
// const getUserGoalsAndActions = async (db, userId) => {
//     try {
//         const userRef = doc(db, 'user_goals', userId);
//         const userDoc = await getDoc(userRef);
        
//         if (userDoc.exists()) {
//             const data = userDoc.data();
//             return {
//                 goals: data.long_term_goals || [],
//                 actions: (data.tasks || []).map(task => task.name),
//                 success: true
//             };
//         }
//         return { goals: [], actions: [], success: false };
//     } catch (error) {
//         console.error('Error getting goals and actions:', error);
//         return { goals: [], actions: [], success: false };
//     }
// };



// fucntion to send data to backend to initiate call
export const initiateCall = async (userId) => {
    try {
        const userData = await getUserData(userId);
        const goalsData = await getUserGoalsAndActions(db, userId);

        if (!userData.success) {
            return {success: false, msg: 'Failed to get user data'};
        }

        // console.log(goalsData);
    
        const callPayload = {
            target_phone_number: userData.data.phone_number, 
            custom_params: {
                user_id: userData.data.id,
                first_name: userData.data.first_name 
                // goals : ,
                // action_items: ,
            }
        };

        // Send the request to your backend
        const response = await fetch('https://thryve-f227a234ead5.herokuapp.com/dispatch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(callPayload)
        });

        const result = await response.json();
        return {success: true, data: result};

    } catch (error) {
        console.error('Error initiating call:', error);
        return {success: false, msg: error.message};
    }
}
