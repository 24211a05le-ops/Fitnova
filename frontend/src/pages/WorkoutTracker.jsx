import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Plus, 
  Save, 
  Timer, 
  Dumbbell, 
  Trash2, 
  History, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Check, 
  X 
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { motion, AnimatePresence } from 'framer-motion';

// Yup validation schema for the Add Exercise form
const exerciseSchema = yup.object().shape({
  name: yup
    .string()
    .required('Exercise name is required')
    .min(3, 'Exercise name must be at least 3 characters'),
  type: yup
    .string()
    .required('Category type is required'),
  setsCount: yup
    .number()
    .typeError('Sets must be a positive number')
    .required('Number of sets is required')
    .positive('Must be greater than 0')
    .integer('Must be a whole number')
    .max(10, 'Max 10 sets allowed'),
  repsCount: yup
    .number()
    .typeError('Reps must be a positive number')
    .required('Number of reps is required')
    .positive('Must be greater than 0')
    .integer('Must be a whole number'),
  initialWeight: yup
    .number()
    .typeError('Weight must be a positive number')
    .required('Initial weight is required')
    .min(0, 'Weight cannot be negative'),
});

// Yup validation schema for the Sync Workout modal form
const syncWorkoutSchema = yup.object().shape({
  title: yup
    .string()
    .required('Session title is required')
    .min(3, 'Title must be at least 3 characters'),
  duration: yup
    .number()
    .typeError('Duration must be a positive number')
    .required('Session duration is required')
    .positive('Must be greater than 0')
    .integer('Must be a whole number'),
});

const WorkoutTracker = () => {
  const {
    exercises,
    loading,
    successMessage,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    toggleSetComplete,
    saveCurrentWorkout
  } = useWorkout();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Form for adding next exercise
  const {
    register: registerExercise,
    handleSubmit: handleExerciseSubmit,
    reset: resetExerciseForm,
    formState: { errors: exerciseErrors, isValid: isExerciseValid },
  } = useForm({
    resolver: yupResolver(exerciseSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'Strength',
      setsCount: 3,
      repsCount: 10,
      initialWeight: 20
    }
  });

  // Form for syncing session
  const {
    register: registerSync,
    handleSubmit: handleSyncSubmit,
    reset: resetSyncForm,
    formState: { errors: syncErrors, isValid: isSyncValid },
  } = useForm({
    resolver: yupResolver(syncWorkoutSchema),
    mode: 'onChange',
    defaultValues: {
      title: 'Push Day: Chest & Triceps',
      duration: 45
    }
  });

  const onAddExerciseSubmit = (data) => {
    // Add exercise to global state
    addExercise(data.name, data.type);
    
    // Create specified number of sets with initial stats
    const lastCreatedEx = exercises[exercises.length - 1];
    const newExId = lastCreatedEx ? lastCreatedEx.id + 1 : Date.now();
    
    // Set initial values for first added set
    updateSet(newExId, 0, 'reps', data.repsCount);
    updateSet(newExId, 0, 'weight', data.initialWeight);
    
    // Add remaining sets (WorkoutContext automatically initializes one set)
    for (let i = 1; i < data.setsCount; i++) {
      addSet(newExId);
      updateSet(newExId, i, 'reps', data.repsCount);
      updateSet(newExId, i, 'weight', data.initialWeight);
    }
    
    setShowAddModal(false);
    resetExerciseForm();
  };

  const onFinishSyncSubmit = async (data) => {
    try {
      await saveCurrentWorkout(data.title, data.duration);
      setShowSyncModal(false);
      resetSyncForm();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      
      {/* Toast Notification for successful sync */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-black py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-3 border border-green-400"
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-green-500/20">
              Active Gym Session
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Track Your Workout</h1>
          <p className="text-gray-400 mt-2 flex items-center gap-2 text-sm">
            <Timer className="text-gray-600" size={16} /> Log sets and weights in real-time.
          </p>
        </div>
        
        {exercises.length > 0 && (
          <button 
            onClick={() => setShowSyncModal(true)}
            className="bg-white hover:bg-green-500 text-black font-bold py-3.5 px-8 rounded-2xl transition-all flex items-center gap-2 shadow-xl shadow-white/5 hover:shadow-green-500/10 shrink-0 text-sm uppercase tracking-wider"
          >
            <Save size={18} />
            Finish & Sync
          </button>
        )}
      </header>

      {/* Main Exercises List */}
      <div className="space-y-6">
        {exercises.length === 0 ? (
          <div className="bg-gray-950 border border-white/5 rounded-[40px] p-16 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center border border-white/10 mb-6 text-gray-400">
              <Dumbbell size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Exercises</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-8">
              Your active training sheet is empty. Add your first lift to begin mapping your progress.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-green-500 hover:bg-green-400 text-black font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-green-500/10 text-xs uppercase tracking-widest"
            >
              + Add Exercise
            </button>
          </div>
        ) : (
          exercises.map((exercise) => (
            <div key={exercise.id} className="bg-gray-950 border border-white/5 rounded-[32px] overflow-hidden group">
              {/* Exercise Header */}
              <div className="p-6 px-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-green-500">
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{exercise.name}</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{exercise.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 text-gray-600 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl">
                    <History size={16} />
                  </button>
                  <button 
                    onClick={() => removeExercise(exercise.id)}
                    className="p-2.5 text-gray-600 hover:text-red-500 transition-colors bg-white/5 hover:bg-red-500/10 rounded-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Exercise Sets Body */}
              <div className="p-8">
                <div className="grid grid-cols-12 gap-4 mb-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] px-4">
                  <div className="col-span-2">Set</div>
                  <div className="col-span-4">Target Reps</div>
                  <div className="col-span-3">KG / LBS</div>
                  <div className="col-span-2">Reps</div>
                  <div className="col-span-1 text-right">Done</div>
                </div>

                <div className="space-y-3">
                  {exercise.sets.map((set, index) => (
                    <div 
                      key={index} 
                      className={`grid grid-cols-12 gap-4 items-center p-3 px-4 rounded-2xl border transition-all ${
                        set.completed 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-black border-white/5'
                      }`}
                    >
                      <div className="col-span-2">
                        <span className="w-8 h-8 rounded-lg bg-gray-900 border border-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                          {index + 1}
                        </span>
                      </div>
                      <div className="col-span-4 text-xs font-medium text-gray-400">
                        10 reps @ 20 kg
                      </div>
                      <div className="col-span-3">
                        <input 
                          type="number" 
                          value={set.weight} 
                          onChange={(e) => updateSet(exercise.id, index, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-green-500 transition-all font-mono text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input 
                          type="number" 
                          value={set.reps} 
                          onChange={(e) => updateSet(exercise.id, index, 'reps', parseInt(e.target.value) || 0)}
                          className="w-full bg-gray-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-green-500 transition-all font-mono text-center"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button 
                          onClick={() => toggleSetComplete(exercise.id, index)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            set.completed 
                              ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' 
                              : 'bg-gray-900 text-gray-700 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => addSet(exercise.id)}
                  className="w-full mt-5 py-3.5 bg-white/[0.01] hover:bg-white/[0.03] border border-dashed border-white/10 hover:border-green-500/40 rounded-2xl text-[9px] font-black text-gray-500 hover:text-green-400 transition-all uppercase tracking-[0.25em]"
                >
                  + Add New Set
                </button>
              </div>
            </div>
          ))
        )}

        {exercises.length > 0 && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full py-6 bg-gray-950 border-2 border-dashed border-white/5 rounded-[32px] text-gray-500 hover:text-white hover:border-white/10 transition-all flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-900 border border-white/5 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <span className="font-bold text-xs uppercase tracking-widest">Add Next Exercise</span>
          </button>
        )}
      </div>

      {/* MODAL 1: Add Next Exercise with full yup validation */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gray-950 border border-white/5 rounded-[32px] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => { setShowAddModal(false); resetExerciseForm(); }}
                className="absolute top-6 right-6 text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                  <Dumbbell size={18} />
                </div>
                <h3 className="text-xl font-bold text-white">Add Lift Exercise</h3>
              </div>

              <form onSubmit={handleExerciseSubmit(onAddExerciseSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Exercise Name</label>
                  <input 
                    type="text"
                    {...registerExercise('name')}
                    className={`w-full bg-black border ${exerciseErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:bg-gray-900/30 transition-all font-medium`}
                    placeholder="e.g. Incline Bench Press"
                  />
                  {exerciseErrors.name && (
                    <p className="text-red-500 text-[10px] font-semibold flex items-center gap-1">
                      <AlertCircle size={10} /> {exerciseErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type Category</label>
                    <select 
                      {...registerExercise('type')}
                      className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-green-500/50 focus:bg-gray-900/30 transition-all font-medium"
                    >
                      <option value="Strength">Strength</option>
                      <option value="Hypertrophy">Hypertrophy</option>
                      <option value="Powerlifting">Powerlifting</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Endurance">Endurance</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target Sets</label>
                    <input 
                      type="number"
                      {...registerExercise('setsCount')}
                      className={`w-full bg-black border ${exerciseErrors.setsCount ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:bg-gray-900/30 transition-all font-mono text-center`}
                    />
                    {exerciseErrors.setsCount && (
                      <p className="text-red-500 text-[10px] font-semibold flex items-center gap-1">
                        <AlertCircle size={10} /> {exerciseErrors.setsCount.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Initial Reps</label>
                    <input 
                      type="number"
                      {...registerExercise('repsCount')}
                      className={`w-full bg-black border ${exerciseErrors.repsCount ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:bg-gray-900/30 transition-all font-mono text-center`}
                    />
                    {exerciseErrors.repsCount && (
                      <p className="text-red-500 text-[10px] font-semibold flex items-center gap-1">
                        <AlertCircle size={10} /> {exerciseErrors.repsCount.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Start Weight (KG)</label>
                    <input 
                      type="number"
                      {...registerExercise('initialWeight')}
                      className={`w-full bg-black border ${exerciseErrors.initialWeight ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:bg-gray-900/30 transition-all font-mono text-center`}
                    />
                    {exerciseErrors.initialWeight && (
                      <p className="text-red-500 text-[10px] font-semibold flex items-center gap-1">
                        <AlertCircle size={10} /> {exerciseErrors.initialWeight.message}
                      </p>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!isExerciseValid}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mt-4 ${
                    !isExerciseValid 
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed shadow-none' 
                      : 'bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/10'
                  }`}
                >
                  Create Lift Routine
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Sync Workout Session with full yup validation */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gray-950 border border-white/5 rounded-[32px] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => { setShowSyncModal(false); resetSyncForm(); }}
                disabled={loading}
                className="absolute top-6 right-6 text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <Save size={18} />
                </div>
                <h3 className="text-xl font-bold text-white">Sync Workout Routine</h3>
              </div>

              <form onSubmit={handleSyncSubmit(onFinishSyncSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Routine Title</label>
                  <input 
                    type="text"
                    {...registerSync('title')}
                    disabled={loading}
                    className={`w-full bg-black border ${syncErrors.title ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:bg-gray-900/30 transition-all font-medium`}
                    placeholder="e.g. Chest Hypertrophy Session"
                  />
                  {syncErrors.title && (
                    <p className="text-red-500 text-[10px] font-semibold flex items-center gap-1">
                      <AlertCircle size={10} /> {syncErrors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Duration (minutes)</label>
                  <div className="relative">
                    <Timer size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                      type="number"
                      {...registerSync('duration')}
                      disabled={loading}
                      className={`w-full bg-black border ${syncErrors.duration ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-green-500/50'} rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:bg-gray-900/30 transition-all font-mono`}
                    />
                  </div>
                  {syncErrors.duration && (
                    <p className="text-red-500 text-[10px] font-semibold flex items-center gap-1">
                      <AlertCircle size={10} /> {syncErrors.duration.message}
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={!isSyncValid || loading}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 ${
                    !isSyncValid || loading
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed shadow-none' 
                      : 'bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/10'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Syncing with Cloud...
                    </>
                  ) : (
                    <>
                      Finish & Sync Database
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutTracker;
