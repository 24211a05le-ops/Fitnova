import api from './api';

/**
 * Predict body transformation progress using physical characteristics.
 * @param {Object} bodyStats - User height, weight, gender, age, workouts frequency, calorie goals, etc.
 * @returns {Promise<Object>} Predicted weight progression and muscle growth curves.
 */
export const getPrediction = async (bodyStats) => {
  const response = await api.post('/predict', bodyStats);
  return response.data.data;
};

/**
 * Retrieve user historical physical progress logs.
 * @returns {Promise<Array>} List of physical logs.
 */
export const getProgress = async () => {
  const response = await api.get('/progress');
  return response.data.data;
};

export const saveProgressLog = async (payload) => {
  const response = await api.post('/progress', payload);
  return response.data.data;
};
