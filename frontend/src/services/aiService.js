import api from './api';

export const generateAIWorkout = async (preferences) => {
  const response = await api.post('/ai/generate-workout', preferences);
  return response.data.data;
};

export const getAIWorkoutPlans = async () => {
  const response = await api.get('/ai/workout-plans');
  return response.data.data;
};

export const getDashboardWidgets = async () => {
  const response = await api.get('/ai/dashboard-widgets');
  return response.data.data;
};
