import api from './api';

export const getAppOverview = async () => {
  const response = await api.get('/app/overview');
  return response.data.data;
};

export const getExerciseLibraryData = async () => {
  const response = await api.get('/app/exercises');
  return response.data.data;
};

export const updateUserProfile = async (payload) => {
  const response = await api.put('/profile', payload);
  return response.data.data;
};

export const deleteUserProfile = async () => {
  const response = await api.delete('/profile');
  return response.data;
};
