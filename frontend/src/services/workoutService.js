import api from './api';

/**
 * Save a workout session to the user's history.
 * @param {Object} workoutData - Detail of the exercises, sets, reps, and duration.
 * @returns {Promise<Object>} Saved workout record.
 */
export const saveWorkout = async (workoutData) => {
  const response = await api.post('/workouts', workoutData);
  return response.data.data;
};

export const getWorkoutSessions = async () => {
  const response = await api.get('/workouts?view=sessions');
  return response.data.data;
};
