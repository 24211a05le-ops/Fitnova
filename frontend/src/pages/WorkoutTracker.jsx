import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Save, Timer, Dumbbell, Trash2, CheckCircle2, Loader2, AlertCircle, Check, X, Play, Pause, RotateCcw, Trophy, Flame, Clock, Filter, ChevronDown } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const EXERCISE_PRESETS = {
  Chest: ['Bench Press', 'Incline DB Press', 'Cable Flyes', 'Push-Ups', 'Dips'],
  Back: ['Deadlifts', 'Pull-Ups', 'Barbell Rows', 'Lat Pulldown', 'Cable Row'],
  Legs: ['Squats', 'Leg Press', 'Romanian DL', 'Lunges', 'Leg Curl'],
  Shoulders: ['Overhead Press', 'Lateral Raises', 'Face Pulls', 'Arnold Press'],
  Arms: ['Barbell Curls', 'Tricep Pushdown', 'Hammer Curls', 'Skull Crushers'],
  Core: ['Plank', 'Leg Raises', 'Cable Crunches', 'Russian Twists'],
};

const WorkoutTracker = () => {
  const { exercises, loading, successMessage, addExercise, removeExercise, addSet, updateSet, toggleSetComplete, saveCurrentWorkout } = useWorkout();
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [addCategory, setAddCategory] = useState('Chest');
  const [customName, setCustomName] = useState('');

  // Rest Timer
  const [restTimer, setRestTimer] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [restPreset, setRestPreset] = useState(90);

  // Sync form
  const [syncTitle, setSyncTitle] = useState('');
  const [syncDuration, setSyncDuration] = useState(45);

  // Workout timer
  const [workoutTime, setWorkoutTime] = useState(0);
  const [workoutRunning, setWorkoutRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (workoutRunning) {
      interval = setInterval(() => setWorkoutTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [workoutRunning]);

  useEffect(() => {
    let interval;
    if (restRunning && restTimer > 0) {
      interval = setInterval(() => setRestTimer(t => t - 1), 1000);
    } else if (restTimer <= 0 && restRunning) {
      setRestRunning(false);
    }
    return () => clearInterval(interval);
  }, [restRunning, restTimer]);

  useEffect(() => {
    if (exercises.length > 0 && !workoutRunning) setWorkoutRunning(true);
  }, [exercises.length]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const startRest = (seconds) => { setRestTimer(seconds); setRestRunning(true); };

  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleAddPreset = (name) => {
    addExercise(name, addCategory);
    setShowAddModal(false);
  };

  const handleAddCustom = () => {
    if (customName.trim().length >= 3) {
      addExercise(customName.trim(), addCategory);
      setCustomName('');
      setShowAddModal(false);
    }
  };

  const handleFinish = async () => {
    if (!syncTitle.trim()) return;
    try {
      await saveCurrentWorkout(syncTitle, syncDuration);
      setShowSyncModal(false);
      setWorkoutRunning(false);
      setShowComplete(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Completion Screen
  if (showComplete) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-24 h-24 rounded-3xl bg-green-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30">
            <Trophy size={48} className="text-black" />
          </div>
        </motion.div>
        <h1 className="text-4xl font-black text-white mb-3">Workout Complete!</h1>
        <p className="text-gray-500 mb-8">Great session! Your workout has been saved.</p>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Duration', value: formatTime(workoutTime), icon: <Clock size={16} /> },
            { label: 'Exercises', value: exercises.length || '--', icon: <Dumbbell size={16} /> },
            { label: 'Calories', value: `~${Math.round((syncDuration || 45) * 8.5)}`, icon: <Flame size={16} /> },
          ].map((s, i) => (
            <div key={i} className="bg-gray-950 border border-white/5 rounded-2xl p-4">
              <div className="text-gray-500 mb-2">{s.icon}</div>
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowComplete(false); setWorkoutTime(0); }} className="flex-1 py-4 border border-white/5 rounded-2xl text-gray-400 font-bold text-sm hover:bg-white/5 transition-all">New Workout</button>
          <button onClick={() => navigate('/dashboard')} className="flex-[2] py-4 bg-green-500 text-black font-black rounded-2xl text-sm hover:bg-green-400 transition-all shadow-lg shadow-green-500/10">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-black py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Progress */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                {workoutRunning ? '● Live' : 'Ready'}
              </span>
              {workoutRunning && <span className="text-sm font-mono text-gray-400">{formatTime(workoutTime)}</span>}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Workout Tracker</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress Ring */}
          {totalSets > 0 && (
            <div className="flex items-center gap-3 bg-gray-950 border border-white/5 rounded-2xl px-4 py-2">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#1a1a2e" strokeWidth="3" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#22c55e" strokeWidth="3"
                    strokeDasharray={`${(progress / 100) * 100.5} 100.5`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">{progress}%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-white">{completedSets}/{totalSets}</p>
                <p className="text-[9px] text-gray-500 font-bold">Sets Done</p>
              </div>
            </div>
          )}
          {exercises.length > 0 && (
            <button onClick={() => { setSyncTitle(''); setShowSyncModal(true); }}
              className="bg-white hover:bg-green-500 text-black font-bold py-3 px-6 rounded-2xl transition-all flex items-center gap-2 shadow-lg text-sm">
              <Save size={16} /> Finish
            </button>
          )}
        </div>
      </header>

      {/* Rest Timer Bar */}
      <AnimatePresence>
        {(restRunning || restTimer > 0) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer size={20} className="text-blue-500" />
              <div>
                <p className="text-sm font-bold text-white">Rest Timer</p>
                <p className="text-2xl font-black text-blue-400 font-mono">{formatTime(restTimer)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRestRunning(!restRunning)}
                className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-all">
                {restRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button onClick={() => { setRestTimer(restPreset); setRestRunning(true); }}
                className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-all">
                <RotateCcw size={16} />
              </button>
              <button onClick={() => { setRestTimer(0); setRestRunning(false); }}
                className="w-10 h-10 rounded-xl bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-gray-700 transition-all">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Rest Buttons */}
      {exercises.length > 0 && !restRunning && (
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-gray-600" />
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mr-1">Rest:</span>
          {[30, 60, 90, 120].map(s => (
            <button key={s} onClick={() => startRest(s)}
              className="px-3 py-1.5 bg-gray-900 text-gray-500 text-[10px] font-bold rounded-lg hover:bg-blue-500/10 hover:text-blue-400 transition-all">{s}s</button>
          ))}
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-4">
        {exercises.length === 0 ? (
          <div className="bg-gray-950 border border-white/5 rounded-[32px] p-16 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center border border-white/10 mb-6 mx-auto text-gray-500"><Dumbbell size={28} /></div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to Train?</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">Add exercises to build your workout session. Track sets, reps, and weights in real-time.</p>
            <button onClick={() => setShowAddModal(true)}
              className="bg-green-500 hover:bg-green-400 text-black font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-green-500/10 text-xs uppercase tracking-widest">
              <Plus size={16} className="inline mr-2" /> Add Exercise
            </button>
          </div>
        ) : (
          exercises.map((exercise, exIdx) => (
            <div key={exercise.id} className="bg-gray-950 border border-white/5 rounded-3xl overflow-hidden group">
              <div className="p-5 px-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center justify-center text-green-500 text-xs font-black">{exIdx + 1}</div>
                  <div>
                    <h3 className="text-base font-bold text-white">{exercise.name}</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{exercise.type}</p>
                  </div>
                </div>
                <button onClick={() => removeExercise(exercise.id)} className="p-2 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-12 gap-3 mb-3 text-[9px] font-black text-gray-600 uppercase tracking-widest px-3">
                  <div className="col-span-2">Set</div>
                  <div className="col-span-4">Weight (kg)</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>
                <div className="space-y-2">
                  {exercise.sets.map((set, idx) => (
                    <div key={idx} className={`grid grid-cols-12 gap-3 items-center p-2.5 px-3 rounded-xl border transition-all ${
                      set.completed ? 'bg-green-500/5 border-green-500/20' : 'bg-black border-white/5'
                    }`}>
                      <div className="col-span-2">
                        <span className="w-7 h-7 rounded-lg bg-gray-900 border border-white/5 flex items-center justify-center text-xs font-bold text-gray-400">{idx + 1}</span>
                      </div>
                      <div className="col-span-4">
                        <input type="number" value={set.weight}
                          onChange={e => updateSet(exercise.id, idx, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-green-500 transition-all font-mono text-center" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" value={set.reps}
                          onChange={e => updateSet(exercise.id, idx, 'reps', parseInt(e.target.value) || 0)}
                          className="w-full bg-gray-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-green-500 transition-all font-mono text-center" />
                      </div>
                      <div className="col-span-3 flex justify-end gap-1.5">
                        <button onClick={() => { toggleSetComplete(exercise.id, idx); if (!set.completed) startRest(restPreset); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            set.completed ? 'bg-green-500 text-black shadow-md shadow-green-500/20' : 'bg-gray-900 text-gray-700 hover:text-white'
                          }`}>
                          <Check size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => addSet(exercise.id)}
                  className="w-full mt-3 py-3 bg-white/[0.01] hover:bg-white/[0.03] border border-dashed border-white/10 hover:border-green-500/30 rounded-xl text-[9px] font-black text-gray-600 hover:text-green-400 transition-all uppercase tracking-widest">
                  + Add Set
                </button>
              </div>
            </div>
          ))
        )}

        {exercises.length > 0 && (
          <button onClick={() => setShowAddModal(true)}
            className="w-full py-5 bg-gray-950 border-2 border-dashed border-white/5 rounded-3xl text-gray-600 hover:text-white hover:border-white/10 transition-all flex flex-col items-center gap-2">
            <Plus size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Add Exercise</span>
          </button>
        )}
      </div>

      {/* Add Exercise Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gray-950 border border-white/5 rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Dumbbell size={20} className="text-green-500" /> Add Exercise</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"><X size={18} /></button>
              </div>
              {/* Category Tabs */}
              <div className="flex gap-1.5 overflow-x-auto mb-4 pb-1 scrollbar-hide">
                {Object.keys(EXERCISE_PRESETS).map(cat => (
                  <button key={cat} onClick={() => setAddCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      addCategory === cat ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-500 hover:text-white'
                    }`}>{cat}</button>
                ))}
              </div>
              {/* Preset Exercises */}
              <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
                {EXERCISE_PRESETS[addCategory].map(name => (
                  <button key={name} onClick={() => handleAddPreset(name)}
                    className="w-full text-left p-3 rounded-xl bg-black border border-white/5 hover:border-green-500/30 text-sm font-bold text-gray-300 hover:text-white transition-all flex items-center gap-3">
                    <Dumbbell size={14} className="text-gray-600" /> {name}
                  </button>
                ))}
              </div>
              {/* Custom */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Custom Exercise</p>
                <div className="flex gap-2">
                  <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Exercise name..."
                    className="flex-1 bg-black border border-gray-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all placeholder-gray-700" />
                  <button onClick={handleAddCustom} disabled={customName.trim().length < 3}
                    className="px-4 bg-green-500 text-black font-bold rounded-xl text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-400 transition-all">Add</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finish Modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gray-950 border border-white/5 rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Save size={20} className="text-green-500" /> Finish Workout</h3>
                <button onClick={() => setShowSyncModal(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"><X size={18} /></button>
              </div>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-black rounded-xl p-3 text-center border border-white/5">
                  <p className="text-lg font-black text-white">{exercises.length}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase">Exercises</p>
                </div>
                <div className="bg-black rounded-xl p-3 text-center border border-white/5">
                  <p className="text-lg font-black text-white">{completedSets}/{totalSets}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase">Sets Done</p>
                </div>
                <div className="bg-black rounded-xl p-3 text-center border border-white/5">
                  <p className="text-lg font-black text-white">{formatTime(workoutTime)}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase">Duration</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Session Title</label>
                  <input type="text" value={syncTitle} onChange={e => setSyncTitle(e.target.value)}
                    placeholder="e.g. Push Day: Chest & Triceps" className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all placeholder-gray-700" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Duration (min)</label>
                  <input type="number" value={syncDuration} onChange={e => setSyncDuration(parseInt(e.target.value) || 0)}
                    className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all font-mono" />
                </div>
                <button onClick={handleFinish} disabled={!syncTitle.trim() || loading}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl transition-all text-xs uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-green-500/10">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><CheckCircle2 size={16} /> Complete Workout</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutTracker;
