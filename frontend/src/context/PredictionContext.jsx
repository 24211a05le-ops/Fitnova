import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPrediction, getProgress, saveProgressLog } from '../services/predictionService';
import { useAuth } from './AuthContext';

const PredictionContext = createContext();

export const PredictionProvider = ({ children }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load progress history on mount if user is authenticated
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setProgressLogs([]);
        return;
      }
      try {
        const logs = await getProgress();
        setProgressLogs(logs);
      } catch (err) {
        console.error('Failed to load progress history:', err);
      }
    };
    fetchHistory();
  }, [user]);

  const refreshProgressLogs = async () => {
    if (!user) {
      setProgressLogs([]);
      return;
    }

    const logs = await getProgress();
    setProgressLogs(logs);
  };

  const predictBodyTransformation = async (bodyStats) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrediction(bodyStats);
      setPredictions(data);
      await saveProgressLog({
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(bodyStats.weight),
        body_fat: parseFloat(bodyStats.bodyFat),
        muscle_mass: parseFloat(bodyStats.muscleMass || 0) || null,
        chest: parseFloat(bodyStats.chest || 0) || null,
        waist: parseFloat(bodyStats.waist || 0) || null,
        biceps: parseFloat(bodyStats.biceps || 0) || null,
        thighs: parseFloat(bodyStats.thighs || 0) || null,
      });
      await refreshProgressLogs();
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Prediction analysis failed';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PredictionContext.Provider
      value={{
        predictions,
        progressLogs,
        loading,
        error,
        refreshProgressLogs,
        predictBodyTransformation,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePrediction = () => {
  const context = useContext(PredictionContext);
  if (!context) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return context;
};
