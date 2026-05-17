import React from 'react';
import { MdEdit, MdStars, MdTimeline, MdHistory, MdEmojiEvents } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'FN';
  };

  return (
    <div className="space-y-12">
      <div className="relative">
        <div className="h-64 w-full bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent rounded-[48px] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
        </div>
        
        <div className="absolute -bottom-16 left-12 flex flex-col md:flex-row items-end gap-8">
          <div className="w-40 h-40 rounded-[40px] border-[8px] border-black bg-gray-950 overflow-hidden shadow-2xl relative group">
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-5xl font-black text-black">
              {getInitials(user?.name)}
            </div>
            <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <MdEdit size={24} />
            </button>
          </div>
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black text-white tracking-tighter">{user?.name || 'Alex Johnson'}</h1>
              <span className="px-3 py-1 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                {user?.role === 'admin' ? 'Admin' : 'Pro'}
              </span>
            </div>
            <p className="text-gray-400 font-medium text-lg flex items-center gap-2">
              <MdStars className="text-yellow-500" /> Achieving limits since Jan 2026
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-16">
        <div className="space-y-8">
          <div className="bg-gray-950 border border-gray-900 rounded-[40px] p-10">
            <h3 className="text-xl font-bold text-white mb-6">Bio</h3>
            <p className="text-gray-400 font-medium leading-relaxed">
              {user?.role === 'admin' 
                ? "Fitnova System Administrator. Managing platform health, user engagement, and performance metrics."
                : "Fitness enthusiast focused on bodybuilding and functional strength. Currently on a lean bulk phase."}
            </p>
          </div>
          
          <div className="bg-gray-950 border border-gray-900 rounded-[40px] p-10">
            <h3 className="text-xl font-bold text-white mb-8">Performance DNA</h3>
            <div className="space-y-6">
              {[
                { label: 'Athletic Level', value: user?.role === 'admin' ? 'Master' : 'Elite', color: 'text-purple-500' },
                { label: 'Total Sessions', value: user?.role === 'admin' ? '∞' : '152', color: 'text-green-500' },
                { label: 'Avg. Intensity', value: user?.role === 'admin' ? '99%' : '84%', color: 'text-blue-500' },
              ].map((dna) => (
                <div key={dna.label} className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500">{dna.label}</span>
                  <span className={`text-sm font-black ${dna.color} uppercase tracking-widest`}>{dna.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <section className="bg-gray-950 border border-gray-900 rounded-[48px] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <MdEmojiEvents size={48} className="text-gray-900/50" />
            </div>
            <h3 className="text-2xl font-black text-white mb-10 tracking-tight">Unlocked Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'Early Bird', icon: '☀️', color: 'bg-yellow-500/10 border-yellow-500/20' },
                { name: 'Iron Will', icon: '⛓️', color: 'bg-red-500/10 border-red-500/20' },
                { name: 'Consistency', icon: '🔥', color: 'bg-green-500/10 border-green-500/20' },
                { name: 'Strength', icon: '💪', color: 'bg-blue-500/10 border-blue-500/20' },
              ].map((badge) => (
                <div key={badge.name} className="flex flex-col items-center group cursor-pointer">
                  <div className={`w-20 h-20 rounded-3xl border ${badge.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    {badge.icon}
                  </div>
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">{badge.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-950 border border-gray-900 rounded-[48px] p-12">
            <h3 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
              <MdHistory className="text-gray-500" />
              Recent Milestones
            </h3>
            <div className="space-y-8">
              {[
                { title: user?.role === 'admin' ? 'System Audit Completed' : 'New PR: Deadlift 180kg', date: 'Yesterday', icon: '🏆', color: 'text-yellow-500' },
                { title: user?.role === 'admin' ? 'Platform Update v1.0.4' : '7-Day Workout Streak', date: '3 days ago', icon: '🔥', color: 'text-red-500' },
                { title: user?.role === 'admin' ? 'Security Patch Applied' : 'Goal Achieved: Weight 78kg', date: '1 week ago', icon: '✅', color: 'text-green-500' },
              ].map((milestone, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-xl group-hover:bg-gray-800 transition-colors">
                    {milestone.icon}
                  </div>
                  <div className="flex-1 pb-6 border-b border-gray-900 last:border-0">
                    <p className="text-lg font-bold text-white group-hover:text-green-500 transition-colors">{milestone.title}</p>
                    <p className="text-xs font-bold text-gray-600 mt-1 uppercase tracking-widest">{milestone.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
