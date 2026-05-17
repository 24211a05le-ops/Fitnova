import React from 'react';
import GoalCard from '../components/GoalCard';
import { MdAdd, MdEmojiEvents, MdTimeline } from 'react-icons/md';

const Goals = () => {
  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Goal Management</h1>
          <p className="text-gray-400 mt-2 text-lg">Define your targets with Fitnova.</p>
        </div>
        <button className="bg-green-500 hover:bg-green-400 text-black font-black py-3 px-8 rounded-2xl transition-all shadow-xl shadow-green-500/20 flex items-center gap-2">
          <MdAdd size={22} />
          New Goal
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <GoalCard title="Muscle Gain" target={5} current={2.4} unit="kg" colorClass="bg-blue-500" />
        <GoalCard title="Weight Loss" target={10} current={6.2} unit="kg" colorClass="bg-green-500" />
        <GoalCard title="Bench Press PR" target={100} current={85} unit="kg" colorClass="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-950 border border-gray-900 rounded-[40px] p-10">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <MdTimeline className="text-green-500" />
            Milestone Timeline
          </h3>
          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-900">
            {[
              { title: 'Started Journey', date: 'Jan 1, 2026', status: 'Completed' },
              { title: 'First 5kg Lost', date: 'Feb 12, 2026', status: 'Completed' },
            ].map((milestone, i) => (
              <div key={i} className="flex gap-6 items-start relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-black ${milestone.status === 'Completed' ? 'bg-green-500' : 'bg-gray-800'}`}>
                  {milestone.status === 'Completed' && <span className="text-black text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{milestone.title}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{milestone.date} • {milestone.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-950 border border-gray-900 rounded-[40px] p-10">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <MdEmojiEvents className="text-yellow-500" />
            Achievement Badges
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              { name: 'Consistency King', icon: '👑', color: 'from-yellow-500/20 to-orange-500/20' },
              { name: 'Strength Master', icon: '⛓️', color: 'from-blue-500/20 to-indigo-500/20' },
              { name: 'Early Bird', icon: '🌅', color: 'from-green-500/20 to-emerald-500/20' },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-[24px] bg-gradient-to-br ${badge.color} border border-white/5 flex items-center justify-center text-3xl mb-3 shadow-xl`}>
                  {badge.icon}
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
