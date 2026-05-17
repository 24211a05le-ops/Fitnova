import React from 'react';
import { Flame, Clock, Trophy, Dumbbell, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const WorkoutCard = ({ 
  title = "Core Strength Booster", 
  calories = 350, 
  duration = 45, 
  level = "Intermediate", 
  muscle = "Full Body", 
  image = "", 
  onStart = () => console.log('Workout started!') 
}) => {
  
  // Default dark modern background image if none provided
  const cardImage = image || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600";

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-[32px] overflow-hidden bg-gray-950 border border-white/5 shadow-2xl group flex flex-col justify-end p-6 sm:p-8"
    >
      {/* Background Image with Dark Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url(${cardImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
      <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 space-y-4">
        {/* Top Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border border-green-500/20 backdrop-blur-md">
            {muscle}
          </span>
          <span className="px-3 py-1 bg-white/5 text-gray-300 text-[10px] font-black uppercase tracking-[0.15em] rounded-full border border-white/10 backdrop-blur-md flex items-center gap-1">
            <Trophy size={10} className="text-yellow-500" />
            {level}
          </span>
        </div>

        {/* Workout Title */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug group-hover:text-green-400 transition-colors">
          {title}
        </h3>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4 my-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-orange-500">
              <Flame size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Burn</p>
              <p className="text-sm font-black text-white mt-1 font-mono">{calories} kcal</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-500">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Time</p>
              <p className="text-sm font-black text-white mt-1 font-mono">{duration} min</p>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          className="w-full bg-white hover:bg-green-500 text-black hover:text-black font-black py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-xl shadow-black/50"
        >
          <Play size={16} fill="currentColor" className="transition-transform group-hover/btn:scale-125" />
          <span className="text-xs uppercase tracking-widest">Start Routine</span>
        </button>
      </div>
    </motion.div>
  );
};

export default WorkoutCard;
