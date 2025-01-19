export const getPrediction = async () => {
    try {
        console.log('Attempting to fetch prediction from:', 'https://thryve-f227a234ead5.herokuapp.com/predict-goals');
        
        const response = await fetch('https://thryve-f227a234ead5.herokuapp.com/predict-goals');
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            return { success: true, data };
        } else {
            console.error('Server responded with error:', data);
            return { success: false, msg: data.error };
        }
    } catch (error) {
        console.error('Detailed error:', error);
        return { success: false, msg: error.message };
    }
};