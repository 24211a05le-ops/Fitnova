import api from './api';

export const generateAIWorkout = async (preferences) => {
  const response = await api.post('/ai/generate-workout', preferences);
  return response.data.data;
};

export const getAIWorkoutPlans = async () => {
  const response = await api.get('/ai/workout-plans');
  return response.data.data;
};

export const sendAIChatMessage = async (message) => {
  const response = await api.post('/ai/chat', { message });
  return response.data.data;
};

export const getAIChatHistory = async () => {
  const response = await api.get('/ai/chat-history');
  return response.data.data;
};

export const searchExercisesSmart = async (query) => {
  const response = await api.get(`/ai/exercise-search?query=${encodeURIComponent(query)}`);
  return response.data.data;
};

export const getDashboardWidgets = async () => {
  const response = await api.get('/ai/dashboard-widgets');
  return response.data.data;
};

