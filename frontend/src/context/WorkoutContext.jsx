import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveWorkout } from '../services/workoutService';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: 'Barbell Bench Press',
      type: 'Strength',
      sets: [
        { reps: 10, weight: 60, completed: true },
        { reps: 8, weight: 65, completed: true },
        { reps: 6, weight: 70, completed: false },
      ],
    },
    {
      id: 2,
      name: 'Incline Dumbbell Flys',
      type: 'Hypertrophy',
      sets: [
        { reps: 12, weight: 15, completed: false },
        { reps: 12, weight: 15, completed: false },
      ],
    },
  ]);
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initial mock history load
  useEffect(() => {
    const storedHistory = localStorage.getItem('fitnova_workout_history');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    } else {
      const defaultHistory = [
        {
          id: 101,
          name: 'Pull Day: Back & Biceps',
          date: 'Yesterday, 06:15 PM',
          duration: 75,
          calories: 680,
          exercisesCount: 5,
        },
        {
          id: 102,
          name: 'Morning Yoga & Stretching',
          date: '2 days ago',
          duration: 30,
          calories: 120,
          exercisesCount: 3,
        },
      ];
      setHistory(defaultHistory);
      localStorage.setItem('fitnova_workout_history', JSON.stringify(defaultHistory));
    }
  }, []);

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
      
      const newHistoryItem = {
        id: result.workout.id,
        name: result.workout.name,
        date: 'Just now',
        duration: result.workout.duration,
        calories: result.workout.calories,
        exercisesCount: result.workout.exercises.length,
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('fitnova_workout_history', JSON.stringify(updatedHistory));
      
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
