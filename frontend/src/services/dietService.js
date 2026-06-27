import api from './api';

/**
 * Generate a personalized diet plan based on fitness goals and body characteristics.
 * @param {Object} dietSpecs - Goals, allergies, current weight, target weight, age, calories.
 * @returns {Promise<Object>} The generated AI diet plan containing daily meals, macros, and tips.
 */
export const generateDiet = async (dietSpecs) => {
  const response = await api.post('/diet/generate', dietSpecs);
  return response.data.data;
};

export const getMealPlans = async () => {
  const response = await api.get('/ai/meal-plans');
  return response.data.data;
};
