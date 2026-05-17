import api from './api';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data.data;
};

export const verifySession = async () => {
  const response = await api.get('/auth/verify');
  return response.data.data;
};

export const submitOnboarding = async (onboardingData) => {
  const response = await api.post('/onboarding', onboardingData);
  return response.data.data;
};
