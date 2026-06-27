import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoalCard from '../components/GoalCard';
import { MdAdd, MdEmojiEvents, MdTimeline } from 'react-icons/md';
import { getAppOverview } from '../services/appService';

const Goals = () => {
  const navigate = useNavigate();
  const [goalData, setGoalData] = useState({ cards: [], milestones: [], badges: [] });

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const overview = await getAppOverview();
        setGoalData(overview.goals || { cards: [], milestones: [], badges: [] });
      } catch (error) {
        console.error('Failed to load goals:', error);
      }
    };

    loadGoals();
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Goal Management</h1>
          <p className="text-gray-400 mt-2 text-lg">Track the targets created from your real training data.</p>
        </div>
        <button onClick={() => navigate('/profile')} className="bg-green-500 hover:bg-green-400 text-black font-black py-3 px-8 rounded-2xl transition-all shadow-xl shadow-green-500/20 flex items-center gap-2">
          <MdAdd size={22} />
          Update Goal
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goalData.cards.map((card) => (
          <GoalCard key={card.title} {...card} />
        ))}
        {goalData.cards.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 bg-gray-950 border border-gray-900 rounded-[40px] p-10 text-gray-500">
            Log workouts and weight entries to unlock dynamic goal tracking.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-950 border border-gray-900 rounded-[40px] p-10">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <MdTimeline className="text-green-500" />
            Milestone Timeline
          </h3>
          <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-900">
            {goalData.milestones.map((milestone, index) => (
              <div key={`${milestone.title}-${index}`} className="flex gap-6 items-start relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-black ${milestone.status === 'Completed' ? 'bg-green-500' : 'bg-gray-800'}`}>
                  {milestone.status === 'Completed' && <span className="text-black text-xs font-bold">OK</span>}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{milestone.title}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{milestone.date} • {milestone.status}</p>
                </div>
              </div>
            ))}
            {goalData.milestones.length === 0 && (
              <p className="text-sm text-gray-500">Milestones will appear after your first few sessions.</p>
            )}
          </div>
        </div>

        <div className="bg-gray-950 border border-gray-900 rounded-[40px] p-10">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <MdEmojiEvents className="text-yellow-500" />
            Achievement Badges
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {goalData.badges.map((badge, index) => (
              <div key={`${badge.name}-${index}`} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-[24px] bg-gradient-to-br ${badge.color} border border-white/5 flex items-center justify-center text-sm font-black mb-3 shadow-xl`}>
                  {badge.icon}
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">{badge.name}</span>
              </div>
            ))}
            {goalData.badges.length === 0 && (
              <p className="col-span-3 text-sm text-gray-500">Badges unlock as your training history grows.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
