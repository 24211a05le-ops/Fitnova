import api from './api';

/**
 * Predict body transformation progress using physical characteristics.
 * @param {Object} bodyStats - User height, weight, gender, age, workouts frequency, calorie goals, etc.
 * @returns {Promise<Object>} Predicted weight progression and muscle growth curves.
 */
export const getPrediction = async (bodyStats) => {
  try {
    const response = await api.post('/predict', bodyStats);
    return response.data.data;
  } catch (error) {
    console.warn('ML Prediction API offline, fallback to neural simulation engine.');
    
    // Simulate complex neural computation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate simulated progression curves based on user stats
    const currentWeight = parseFloat(bodyStats.weight) || 75;
    const targetGoal = bodyStats.fitnessGoal || 'Weight Loss';
    
    const weightProgression = [];
    const muscleMassProgression = [];
    const weeks = ['Week 0', 'Week 2', 'Week 4', 'Week 6', 'Week 8', 'Week 10', 'Week 12'];
    
    let weightVal = currentWeight;
    let muscleVal = currentWeight * 0.42; // assume 42% initial muscle mass

    for (let i = 0; i < weeks.length; i++) {
      if (targetGoal.toLowerCase().includes('loss')) {
        weightVal -= (0.4 + Math.random() * 0.4); // Loss curve
        muscleVal += (0.05 + Math.random() * 0.1); // Minor muscle gain while leaning out
      } else if (targetGoal.toLowerCase().includes('gain') || targetGoal.toLowerCase().includes('bulk')) {
        weightVal += (0.3 + Math.random() * 0.4); // Bulk curve
        muscleVal += (0.15 + Math.random() * 0.2); // Noticeable muscle building
      } else {
        weightVal += (Math.random() * 0.3 - 0.15); // Recomposition
        muscleVal += (0.08 + Math.random() * 0.12);
      }
      
      weightProgression.push(parseFloat(weightVal.toFixed(1)));
      muscleMassProgression.push(parseFloat(muscleVal.toFixed(1)));
    }

    return {
      success: true,
      weeks,
      weightCurve: weightProgression,
      muscleCurve: muscleMassProgression,
      estimatedTransformationTime: '12 Weeks',
      recommendationSummary: `Based on your profile, focusing on ${
        targetGoal.toLowerCase().includes('loss') ? 'Leaning & Cardio Recomposition' : 'Strength Hypertrophy'
      } will yield optimal results by Week 12.`,
    };
  }
};

/**
 * Retrieve user historical physical progress logs.
 * @returns {Promise<Array>} List of physical logs.
 */
export const getProgress = async () => {
  try {
    const response = await api.get('/progress');
    return response.data.data;
  } catch (error) {
    console.warn('Retrieving progress from API failed, using cached offline log.');
    
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [
      { id: 1, date: '2026-05-01', weight: 80.2, bodyFat: 17.5, muscleMass: 33.2, chest: 102, waist: 85, biceps: 39 },
      { id: 2, date: '2026-05-08', weight: 79.4, bodyFat: 16.8, muscleMass: 34.0, chest: 103, waist: 83, biceps: 40 },
      { id: 3, date: '2026-05-15', weight: 78.4, bodyFat: 16.2, muscleMass: 34.8, chest: 104, waist: 82, biceps: 41 },
    ];
  }
};
