import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Flame, Clock, History, Zap, TrendingUp, Award, Dumbbell, Target, Heart, BarChart3, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { history } = useWorkout();
  const navigate = useNavigate();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Athlete';

  // Mock dashboard widget data
  const widgets = {
    calories: { burned: 487, goal: 600 },
    streak: { current: 5, best: 12 },
    consistency: { completed: 4, planned: 5 },
    goalProgress: 68,
    recovery: { score: 84, label: 'Fully Recovered' },
    musclesTrained: ['Chest', 'Back', 'Shoulders', 'Core']
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekActivity = [true, true, false, true, true, false, false];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{firstName}</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            <span><strong className="text-green-500">{widgets.streak.current}-day streak</strong> — Keep pushing!</span>
          </p>
        </div>
        <button onClick={() => navigate('/workouts')}
          className="bg-green-500 hover:bg-green-400 text-black font-black py-3.5 px-8 rounded-2xl transition-all shadow-xl shadow-green-500/10 flex items-center gap-2 group text-xs uppercase tracking-widest shrink-0">
          <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Start Workout
        </button>
      </header>

      {/* Widget Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Burned */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-gray-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-500/20 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-3xl rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Flame size={20} /></div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Calories</span>
          </div>
          <p className="text-3xl font-black text-white">{widgets.calories.burned}</p>
          <p className="text-xs text-gray-500 mt-1">/ {widgets.calories.goal} kcal goal</p>
          <div className="mt-3 w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((widgets.calories.burned / widgets.calories.goal) * 100, 100)}%` }}></div>
          </div>
        </motion.div>

        {/* Workout Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gray-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-green-500/20 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500"><Zap size={20} /></div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Streak</span>
          </div>
          <p className="text-3xl font-black text-white">{widgets.streak.current} <span className="text-lg text-gray-500">days</span></p>
          <p className="text-xs text-gray-500 mt-1">Best: {widgets.streak.best} days</p>
        </motion.div>

        {/* Weekly Consistency */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-gray-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/20 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><BarChart3 size={20} /></div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">This Week</span>
          </div>
          <p className="text-3xl font-black text-white">{widgets.consistency.completed}<span className="text-lg text-gray-500">/{widgets.consistency.planned}</span></p>
          <div className="flex gap-1.5 mt-3">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black ${
                  weekActivity[i] ? 'bg-green-500 text-black' : i < new Date().getDay() ? 'bg-gray-800 text-gray-600' : 'bg-gray-900 text-gray-700'
                }`}>{d}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Goal Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gray-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Target size={20} /></div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Goal</span>
          </div>
          <p className="text-3xl font-black text-white">{widgets.goalProgress}<span className="text-lg text-gray-500">%</span></p>
          <p className="text-xs text-green-500 font-bold mt-1">On Track</p>
          <div className="mt-3 w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${widgets.goalProgress}%` }}></div>
          </div>
        </motion.div>
      </div>

      {/* Recovery + Muscles Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-gray-950 border border-white/5 rounded-3xl p-6 flex items-center gap-6">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#1a1a2e" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#22c55e" strokeWidth="6"
                strokeDasharray={`${(widgets.recovery.score / 100) * 213.6} 213.6`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart size={20} className="text-green-500" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Recovery Status</span>
            <p className="text-2xl font-black text-white mt-1">{widgets.recovery.score}%</p>
            <p className="text-xs text-green-500 font-bold">{widgets.recovery.label}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gray-950 border border-white/5 rounded-3xl p-6">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Muscles Trained This Week</span>
          <div className="flex flex-wrap gap-2 mt-4">
            {widgets.musclesTrained.map((m, i) => (
              <span key={i} className="px-4 py-2 bg-green-500/10 text-green-400 text-xs font-bold rounded-xl border border-green-500/20 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> {m}
              </span>
            ))}
            {['Legs', 'Arms'].map((m, i) => (
              <span key={i} className="px-4 py-2 bg-gray-900 text-gray-600 text-xs font-bold rounded-xl border border-gray-800">{m}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workout History */}
        <div className="lg:col-span-2">
          <section className="bg-gray-950 border border-white/5 rounded-[32px] p-6 sm:p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="text-gray-500" size={18} /> Recent Workouts
              </h3>
              <button onClick={() => navigate('/progress')}
                className="text-xs font-black text-green-500 hover:text-green-400 flex items-center gap-1 transition-colors group uppercase tracking-widest">
                View All <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="space-y-3">
              {history.slice(0, 3).map((workout) => (
                <div key={workout.id} onClick={() => navigate('/workouts')}
                  className="flex justify-between items-center p-4 bg-black rounded-2xl border border-white/5 hover:border-green-500/20 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                      <Dumbbell size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-green-400 transition-colors text-sm">{workout.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5 uppercase tracking-widest">{workout.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-center">
                      <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-0.5">Duration</p>
                      <p className="text-xs font-mono text-white font-bold flex items-center gap-1"><Clock size={11} className="text-gray-500" />{workout.duration}m</p>
                    </div>
                    <div className="hidden sm:block text-center">
                      <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-0.5">Calories</p>
                      <p className="text-xs font-mono text-white font-bold flex items-center gap-1"><Flame size={11} className="text-gray-500" />{workout.calories}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-700 group-hover:text-green-500 transition-all" />
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-8">
                  <Dumbbell size={32} className="text-gray-800 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No workouts logged yet</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-950 border border-white/5 rounded-[32px] p-6">
            <h3 className="text-sm font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'AI Workout Generator', path: '/ai-coach', icon: <Zap size={16} />, color: 'text-yellow-500 bg-yellow-500/10' },
                { label: 'Exercise Library', path: '/exercises', icon: <Dumbbell size={16} />, color: 'text-blue-500 bg-blue-500/10' },
                { label: 'Track Weight', path: '/analytics', icon: <TrendingUp size={16} />, color: 'text-green-500 bg-green-500/10' },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group text-left">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>{action.icon}</div>
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
                  <ArrowRight size={14} className="ml-auto text-gray-700 group-hover:text-white transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Challenge Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
            <Award size={24} className="text-indigo-200 mb-3" />
            <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">New Challenge</p>
            <h4 className="text-xl font-black text-white leading-tight">Summer Shred 2026</h4>
            <p className="text-xs text-indigo-200/70 mt-2 leading-relaxed">4-week challenge to transform your physique</p>
            <button onClick={() => navigate('/ai-coach')}
              className="w-full mt-5 py-3 bg-white text-indigo-900 text-xs font-black rounded-xl hover:bg-indigo-50 transition-colors uppercase tracking-widest">
              Join Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
