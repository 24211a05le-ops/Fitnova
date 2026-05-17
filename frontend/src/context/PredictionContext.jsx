import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPrediction, getProgress } from '../services/predictionService';
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

  const predictBodyTransformation = async (bodyStats) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPrediction(bodyStats);
      setPredictions(data);
      
      // Optionally add a new log point to keep visual logs up to date
      const newLog = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(bodyStats.weight),
        bodyFat: parseFloat(bodyStats.bodyFat) || 16.0,
        muscleMass: parseFloat(bodyStats.muscleMass) || 34.0,
        chest: parseFloat(bodyStats.chest) || 104,
        waist: parseFloat(bodyStats.waist) || 82,
        biceps: parseFloat(bodyStats.biceps) || 41,
      };
      
      setProgressLogs((prev) => [...prev.filter(l => l.date !== newLog.date), newLog]);
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
