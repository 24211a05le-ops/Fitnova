import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Dumbbell, Star, TrendingUp, ChevronRight, Sparkles, Play, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchExercisesSmart } from '../services/aiService';

const EXERCISES = [
  // Chest
  { name: 'Barbell Bench Press', muscle: 'Chest', difficulty: 'Intermediate', equipment: 'Gym', sets: '4x10', popular: true },
  { name: 'Incline Dumbbell Press', muscle: 'Chest', difficulty: 'Intermediate', equipment: 'Gym', sets: '3x12' },
  { name: 'Push-Ups', muscle: 'Chest', difficulty: 'Beginner', equipment: 'Home', sets: '3x15', popular: true },
  { name: 'Cable Flyes', muscle: 'Chest', difficulty: 'Intermediate', equipment: 'Gym', sets: '3x15' },
  { name: 'Dips', muscle: 'Chest', difficulty: 'Advanced', equipment: 'Gym', sets: '3x12' },
  // Back
  { name: 'Deadlift', muscle: 'Back', difficulty: 'Advanced', equipment: 'Gym', sets: '4x8', popular: true },
  { name: 'Pull-Ups', muscle: 'Back', difficulty: 'Intermediate', equipment: 'Home', sets: '4x10' },
  { name: 'Barbell Rows', muscle: 'Back', difficulty: 'Intermediate', equipment: 'Gym', sets: '4x10' },
  { name: 'Lat Pulldown', muscle: 'Back', difficulty: 'Beginner', equipment: 'Gym', sets: '3x12', popular: true },
  { name: 'Seated Cable Row', muscle: 'Back', difficulty: 'Beginner', equipment: 'Gym', sets: '3x12' },
  // Legs
  { name: 'Barbell Squats', muscle: 'Legs', difficulty: 'Intermediate', equipment: 'Gym', sets: '4x10', popular: true },
  { name: 'Leg Press', muscle: 'Legs', difficulty: 'Beginner', equipment: 'Gym', sets: '3x12' },
  { name: 'Romanian Deadlift', muscle: 'Legs', difficulty: 'Intermediate', equipment: 'Gym', sets: '3x10' },
  { name: 'Walking Lunges', muscle: 'Legs', difficulty: 'Beginner', equipment: 'Home', sets: '3x20' },
  { name: 'Leg Curl', muscle: 'Legs', difficulty: 'Beginner', equipment: 'Gym', sets: '3x12' },
  // Shoulders
  { name: 'Overhead Press', muscle: 'Shoulders', difficulty: 'Intermediate', equipment: 'Gym', sets: '4x10', popular: true },
  { name: 'Lateral Raises', muscle: 'Shoulders', difficulty: 'Beginner', equipment: 'Gym', sets: '3x15' },
  { name: 'Face Pulls', muscle: 'Shoulders', difficulty: 'Beginner', equipment: 'Gym', sets: '3x15' },
  { name: 'Arnold Press', muscle: 'Shoulders', difficulty: 'Intermediate', equipment: 'Gym', sets: '3x12' },
  // Arms
  { name: 'Barbell Curls', muscle: 'Arms', difficulty: 'Beginner', equipment: 'Gym', sets: '3x12' },
  { name: 'Tricep Pushdowns', muscle: 'Arms', difficulty: 'Beginner', equipment: 'Gym', sets: '3x15', popular: true },
  { name: 'Hammer Curls', muscle: 'Arms', difficulty: 'Beginner', equipment: 'Gym', sets: '3x12' },
  { name: 'Skull Crushers', muscle: 'Arms', difficulty: 'Intermediate', equipment: 'Gym', sets: '3x10' },
  { name: 'Diamond Push-Ups', muscle: 'Arms', difficulty: 'Intermediate', equipment: 'Home', sets: '3x12' },
  // Core
  { name: 'Plank Hold', muscle: 'Core', difficulty: 'Beginner', equipment: 'Home', sets: '3x60s', popular: true },
  { name: 'Hanging Leg Raises', muscle: 'Core', difficulty: 'Advanced', equipment: 'Gym', sets: '3x12' },
  { name: 'Cable Crunches', muscle: 'Core', difficulty: 'Intermediate', equipment: 'Gym', sets: '3x15' },
  { name: 'Russian Twists', muscle: 'Core', difficulty: 'Beginner', equipment: 'Home', sets: '3x20' },
  { name: 'Ab Wheel Rollout', muscle: 'Core', difficulty: 'Advanced', equipment: 'Gym', sets: '3x10' },
];

const AI_RECOMMENDATIONS = [
  { name: 'Barbell Bench Press', muscle: 'Chest', reason: 'Based on your muscle gain goal' },
  { name: 'Barbell Squats', muscle: 'Legs', reason: 'Compound movement for maximum growth' },
  { name: 'Deadlift', muscle: 'Back', reason: 'Recommended for overall strength' },
];

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const DIFFICULTIES = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const LOCATIONS = ['All', 'Gym', 'Home'];

const diffColor = { Beginner: 'text-green-400 bg-green-500/10', Intermediate: 'text-blue-400 bg-blue-500/10', Advanced: 'text-orange-400 bg-orange-500/10' };
const muscleEmoji = { Chest: '💪', Back: '🔙', Legs: '🦵', Shoulders: '🏋️', Arms: '💪', Core: '🎯' };

const ExerciseLibrary = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All Levels');
  const [location, setLocation] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [backendExercises, setBackendExercises] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced semantic tags backend search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setBackendExercises([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchExercisesSmart(searchQuery);
        const formatted = results.map(r => ({
          name: r.exercise_name,
          muscle: r.muscle_group,
          difficulty: r.difficulty || 'Beginner',
          equipment: r.equipment === 'Gym' ? 'Gym' : 'Home',
          sets: '3x12'
        }));
        setBackendExercises(formatted);
      } catch (err) {
        console.error("Smart search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    // If backend returns smart search results, show them!
    if (searchQuery.trim() && backendExercises.length > 0) {
      return backendExercises;
    }
    // Otherwise fallback to local static catalog filtering
    return EXERCISES.filter(ex => {
      if (activeCategory !== 'All' && ex.muscle !== activeCategory) return false;
      if (difficulty !== 'All Levels' && ex.difficulty !== difficulty) return false;
      if (location !== 'All' && ex.equipment !== location) return false;
      if (searchQuery && !ex.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, difficulty, location, searchQuery, backendExercises]);

  const popular = EXERCISES.filter(e => e.popular);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Exercise Library</h1>
          <p className="text-gray-500 mt-1 text-sm">{EXERCISES.length} exercises across {CATEGORIES.length - 1} muscle groups</p>
        </div>
        <div className="w-full md:w-80 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-green-500 transition-colors" size={18} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..." className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-green-500 transition-all placeholder-gray-700" />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-green-500" size={16} />
            </div>
          )}
        </div>
      </header>

      {/* Filters */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategory === cat ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-gray-900 text-gray-500 hover:text-white border border-gray-800'
              }`}>
              {cat !== 'All' && <span className="mr-1">{muscleEmoji[cat]}</span>}{cat}
            </button>
          ))}
        </div>
        {/* Sub-filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-600" />
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  difficulty === d ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-300'
                }`}>{d}</button>
            ))}
          </div>
          <div className="border-l border-gray-800 pl-3 flex items-center gap-2">
            {LOCATIONS.map(l => (
              <button key={l} onClick={() => setLocation(l)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  location === l ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-300'
                }`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {activeCategory === 'All' && !searchQuery && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-yellow-500" />
            <h2 className="text-lg font-bold text-white">AI Recommendations</h2>
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2">Personalized for you</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {AI_RECOMMENDATIONS.map((ex, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/10 rounded-2xl p-5 hover:border-yellow-500/30 transition-all cursor-pointer group"
                onClick={() => setSelectedExercise(EXERCISES.find(e => e.name === ex.name))}>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-yellow-500" />
                  <span className="text-[10px] font-bold text-yellow-500/70 uppercase tracking-wider">{ex.muscle}</span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors">{ex.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{ex.reason}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Popular This Week */}
      {activeCategory === 'All' && !searchQuery && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-500" />
            <h2 className="text-lg font-bold text-white">Popular This Week</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {popular.map((ex, i) => (
              <div key={i} onClick={() => setSelectedExercise(ex)}
                className="min-w-[200px] bg-gray-950 border border-white/5 rounded-2xl p-5 hover:border-green-500/20 transition-all cursor-pointer group shrink-0">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-3">
                  <Dumbbell size={18} />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{ex.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-gray-500">{ex.muscle}</span>
                  <span className="text-gray-700">•</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${diffColor[ex.difficulty]}`}>{ex.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Exercise Catalog Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Exercise Catalog</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((ex, i) => (
            <motion.div key={i} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-gray-950 border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-white/[0.01] transition-all cursor-pointer flex justify-between items-center group"
              onClick={() => setSelectedExercise(ex)}>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{ex.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{ex.muscle}</span>
                  <span className="text-gray-700">•</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${diffColor[ex.difficulty]}`}>{ex.difficulty}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-700 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Exercise Detail Modal Overlay */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-gray-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
              
              <button onClick={() => setSelectedExercise(null)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                <X size={14} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <Dumbbell size={22} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{selectedExercise.muscle}</span>
                  <h3 className="text-xl font-black text-white leading-none mt-1">{selectedExercise.name}</h3>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-white/5 rounded-xl text-center">
                  <span className="text-[8px] text-gray-500 uppercase tracking-wider block mb-1">Target Area</span>
                  <span className="text-xs font-bold text-white">{selectedExercise.muscle}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-center">
                  <span className="text-[8px] text-gray-500 uppercase tracking-wider block mb-1">Difficulty</span>
                  <span className={`text-xs font-bold ${selectedExercise.difficulty === 'Beginner' ? 'text-green-400' : selectedExercise.difficulty === 'Intermediate' ? 'text-blue-400' : 'text-orange-400'}`}>{selectedExercise.difficulty}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-center">
                  <span className="text-[8px] text-gray-500 uppercase tracking-wider block mb-1">Location</span>
                  <span className="text-xs font-bold text-white">{selectedExercise.equipment}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5"><Play size={12} className="text-green-500" /> Form Instructions</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Focus on controlled movements. Breathe out during the concentric (pushing/pulling) phase, and slow down during the eccentric release phase to maximize mechanical tension. Keep core muscles locked.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedExercise(null)}
                  className="flex-1 py-3.5 border border-white/5 rounded-2xl text-gray-400 font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all">
                  Close Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseLibrary;
