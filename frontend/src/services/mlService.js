import api from './api';

export const predictRecoveryScore = async (payload) => {
  const response = await api.post('/ml/predict-recovery', payload);
  return response.data.data;
};

export const predictWeightForecast = async (payload) => {
  const response = await api.post('/ml/predict-weight', payload);
  return response.data.data;
};

export const predictProgressiveOverload = async (payload) => {
  const response = await api.post('/ml/predict-overload', payload);
  return response.data.data;
};

export const predictConsistency = async (payload) => {
  const response = await api.post('/ml/predict-consistency', payload);
  return response.data.data;
};

export const retrainMLModels = async () => {
  const response = await api.post('/ml/retrain');
  return response.data.data;
};

export const getFutureWeightGraph = async () => {
  const response = await api.get('/ml/dashboard/future-weight');
  return response.data.data;
};

export const getConsistencyHistory = async () => {
  const response = await api.get('/ml/dashboard/consistency');
  return response.data.data;
};

export const getRecoveryHistory = async () => {
  const response = await api.get('/ml/dashboard/recovery');
  return response.data.data;
};
