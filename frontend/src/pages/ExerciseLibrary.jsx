import React, { useState } from 'react';
import { MdSearch, MdPlayCircleOutline, MdInfoOutline } from 'react-icons/md';

const ExerciseLibrary = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio'];

  const exercises = [
    { name: 'Barbell Bench Press', muscle: 'Chest', difficulty: 'Intermediate', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop' },
    { name: 'Deadlift', muscle: 'Back', difficulty: 'Advanced', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=250&fit=crop' },
    { name: 'Squats', muscle: 'Legs', difficulty: 'Intermediate', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Fitnova Library</h1>
          <p className="text-gray-400 mt-2 text-lg">Netflix-style browsing for your workout inspiration.</p>
        </div>
        <div className="w-full md:w-96 relative group">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={22} />
          <input 
            type="text" 
            placeholder="Search exercises..." 
            className="w-full bg-gray-950 border border-gray-900 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition-all"
          />
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeCategory === cat 
              ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' 
              : 'bg-gray-900 text-gray-500 hover:text-white border border-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {['Recommended for You', 'Popular This Week'].map((section) => (
          <section key={section} className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight px-2">{section}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {exercises.map((ex, i) => (
                <div key={i} className="group relative aspect-[16/10] rounded-[32px] overflow-hidden border border-gray-900 bg-gray-950 hover:border-green-500/50 transition-all duration-500">
                  <img src={ex.image} alt={ex.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest rounded">{ex.muscle}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {ex.difficulty}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-green-500 transition-colors">{ex.name}</h3>
                    
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0 transition-transform">
                      <button className="flex-1 bg-white text-black py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                        <MdPlayCircleOutline size={18} /> Watch
                      </button>
                      <button className="w-10 h-10 bg-gray-800 text-white rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors">
                        <MdInfoOutline size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
