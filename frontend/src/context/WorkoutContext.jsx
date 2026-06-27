import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveWorkout, getWorkoutSessions } from '../services/workoutService';
import { useAuth } from './AuthContext';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setHistory([]);
        setExercises([]);
        return;
      }

      try {
        const data = await getWorkoutSessions();
        setHistory(data.sessions || []);
      } catch (error) {
        console.error('Failed to load workout history:', error);
        setHistory([]);
      }
    };

    loadHistory();
  }, [user]);

  const addExercise = (name, type) => {
    const newExercise = {
      id: Date.now(),
      name,
      type,
      sets: [{ reps: 10, weight: 50, completed: false }],
    };
    setExercises((prev) => [...prev, newExercise]);
  };

  const removeExercise = (id) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const addSet = (exerciseId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 50 };
          return {
            ...ex,
            sets: [...ex.sets, { reps: lastSet.reps, weight: lastSet.weight, completed: false }],
          };
        }
        return ex;
      })
    );
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const newSets = [...ex.sets];
          newSets[setIndex] = {
            ...newSets[setIndex],
            [field]: value,
          };
          return { ...ex, sets: newSets };
        }
        return ex;
      })
    );
  };

  const toggleSetComplete = (exerciseId, setIndex) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const newSets = [...ex.sets];
          newSets[setIndex] = {
            ...newSets[setIndex],
            completed: !newSets[setIndex].completed,
          };
          return { ...ex, sets: newSets };
        }
        return ex;
      })
    );
  };

  const saveCurrentWorkout = async (title, duration = 45) => {
    setLoading(true);
    setSuccessMessage('');
    try {
      const workoutPayload = {
        name: title,
        exercises,
        duration,
        calories: Math.round(duration * 8.5), // Burn estimate
      };
      
      const result = await saveWorkout(workoutPayload);
      const savedWorkout = result.workout;
      setHistory((prev) => [savedWorkout, ...prev]);
      
      // Reset active workout
      setExercises([]);
      setSuccessMessage('Workout synced successfully!');
      
      setTimeout(() => setSuccessMessage(''), 4000);
      return result;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        exercises,
        history,
        loading,
        successMessage,
        addExercise,
        removeExercise,
        addSet,
        updateSet,
        toggleSetComplete,
        saveCurrentWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
