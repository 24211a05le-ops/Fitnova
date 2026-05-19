import React, { useState, useMemo } from 'react';
import { Search, Filter, Dumbbell, Star, TrendingUp, ChevronRight, Sparkles, Play, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const filtered = useMemo(() => {
    return EXERCISES.filter(ex => {
      if (activeCategory !== 'All' && ex.muscle !== activeCategory) return false;
      if (difficulty !== 'All Levels' && ex.difficulty !== difficulty) return false;
      if (location !== 'All' && ex.equipment !== location) return false;
      if (searchQuery && !ex.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, difficulty, location, searchQuery]);

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

      {/* Exercise Grid */}
      <section>
        {(activeCategory !== 'All' || searchQuery) && (
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-white">{activeCategory === 'All' ? 'Search Results' : activeCategory} Exercises</h2>
            <span className="text-xs text-gray-600 font-bold">({filtered.length})</span>
          </div>
        )}
        {activeCategory === 'All' && !searchQuery && (
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={18} className="text-gray-500" />
            <h2 className="text-lg font-bold text-white">All Exercises</h2>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex, i) => (
            <motion.div key={ex.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => setSelectedExercise(ex)}
              className="bg-gray-950 border border-white/5 rounded-2xl p-5 hover:border-green-500/20 transition-all cursor-pointer group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{ex.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-wider rounded">{ex.muscle}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${diffColor[ex.difficulty]}`}>{ex.difficulty}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-700 group-hover:text-green-500 transition-colors mt-1" />
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px] font-bold text-gray-600">
                <span>📍 {ex.equipment}</span>
                <span>📊 {ex.sets}</span>
              </div>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search size={40} className="text-gray-800 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No exercises found</p>
            <p className="text-gray-700 text-sm mt-1">Try adjusting your filters or search</p>
          </div>
        )}
      </section>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedExercise(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-gray-950 border border-white/5 rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full">{selectedExercise.muscle}</span>
                  <h3 className="text-2xl font-black text-white mt-3">{selectedExercise.name}</h3>
                </div>
                <button onClick={() => setSelectedExercise(null)} className="text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Difficulty', value: selectedExercise.difficulty },
                    { label: 'Equipment', value: selectedExercise.equipment },
                    { label: 'Sets x Reps', value: selectedExercise.sets },
                  ].map((item, i) => (
                    <div key={i} className="bg-black rounded-xl p-3 text-center border border-white/5">
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                  <p className="text-xs text-gray-400 leading-relaxed"><strong className="text-green-400">Pro Tip:</strong> Focus on controlled movement and full range of motion. Maintain proper breathing throughout each rep.</p>
                </div>
                <button className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-lg shadow-green-500/10">
                  <Play size={16} /> Add to Workout
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
