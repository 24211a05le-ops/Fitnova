import api from './api';

export const addWeightLog = async (data) => {
  const response = await api.post('/weight', data);
  return response.data.data;
};

export const getWeightLogs = async (range = 'all') => {
  const response = await api.get(`/weight?range=${range}`);
  return response.data.data;
};

export const deleteWeightLog = async (logId) => {
  const response = await api.delete(`/weight/${logId}`);
  return response.data;
};

export const getWeightStats = async () => {
  const response = await api.get('/weight/stats');
  return response.data.data;
};
