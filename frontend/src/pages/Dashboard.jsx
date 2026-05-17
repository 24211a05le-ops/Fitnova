import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowRight, 
  Flame, 
  Clock, 
  History, 
  Activity,
  Award,
  Zap,
  TrendingUp
} from 'lucide-react';
import GoalCard from '../components/GoalCard';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { history } = useWorkout();
  const navigate = useNavigate();

  // Extract first name for greeting
  const firstName = user?.name ? user.name.split(' ')[0] : 'Athlete';

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-10">
      
      {/* Greeting Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">{firstName}</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            You're currently on a <span className="text-green-500 font-bold">5-day consistency streak</span>. Keep pushing!
          </p>
        </div>
        <button 
          onClick={() => navigate('/workouts')}
          className="bg-green-500 hover:bg-green-400 text-black font-black py-3.5 px-8 rounded-2xl transition-all shadow-xl shadow-green-500/10 flex items-center gap-2 group text-xs uppercase tracking-widest shrink-0"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          Log Active Workout
        </button>
      </header>

      {/* Vital Stats Cards (Goals Dashboard Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GoalCard title="Daily Steps" target={10000} current={8432} unit="steps" colorClass="bg-green-500" />
        <GoalCard title="Calories Burned" target={2500} current={1850} unit="kcal" colorClass="bg-orange-500" />
        <GoalCard title="Hydration Target" target={3} current={2.1} unit="L" colorClass="bg-blue-500" />
        <GoalCard title="Active Time" target={60} current={45} unit="min" colorClass="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Activity Logs */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-gray-950 border border-white/5 rounded-[40px] p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/[0.01] blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="text-gray-500" size={18} />
                Recent Workout History
              </h3>
              <button 
                onClick={() => navigate('/progress')}
                className="text-xs font-black text-green-500 hover:text-green-400 flex items-center gap-1 transition-colors group uppercase tracking-widest"
              >
                View Analytics
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-4">
              {history.slice(0, 3).map((workout) => (
                <div 
                  key={workout.id} 
                  className="flex justify-between items-center p-5 bg-black rounded-2xl border border-white/5 hover:border-white/10 transition-all group cursor-pointer"
                  onClick={() => navigate('/workouts')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-green-400 transition-colors text-sm sm:text-base">{workout.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">{workout.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center gap-6 sm:gap-8">
                    <div className="hidden sm:block text-center">
                      <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Duration</p>
                      <p className="text-xs font-mono text-white flex items-center justify-center gap-1 font-bold">
                        <Clock size={12} className="text-gray-500" />
                        {workout.duration}m
                      </p>
                    </div>
                    
                    <div className="hidden sm:block text-center">
                      <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mb-1">Calories</p>
                      <p className="text-xs font-mono text-white flex items-center justify-center gap-1 font-bold">
                        <Flame size={12} className="text-gray-500" />
                        {workout.calories} kcal
                      </p>
                    </div>
                    
                    <ArrowRight size={16} className="text-gray-700 group-hover:text-white transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Training Schedule & Badges */}
        <div className="space-y-8">
          
          {/* Upcoming Schedule */}
          <div className="bg-gray-950 border border-white/5 rounded-[40px] p-8 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-all pointer-events-none"></div>
            
            <h3 className="text-lg font-bold text-white mb-6">Upcoming Routines</h3>
            <div className="space-y-5">
              {[
                { time: '18:00', title: 'Chest Hypertrophy Routine', day: 'Today' },
                { time: '07:30', title: 'Cardio Blast conditioning', day: 'Tomorrow' },
              ].map((slot, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-black border border-white/5 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter leading-none mb-1">{slot.day}</span>
                    <span className="text-xs font-black text-white font-mono leading-none">{slot.time}</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{slot.title}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Main Training Floor</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/workouts')}
              className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-transparent hover:bg-green-500 hover:text-black rounded-xl text-xs font-black text-gray-400 transition-all uppercase tracking-widest"
            >
              Start Schedule
            </button>
          </div>

          {/* Special Challenge Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[40px] p-8 sm:p-10 shadow-2xl relative overflow-hidden group shadow-indigo-500/5">
            <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-indigo-200">
              <Award size={20} />
            </div>
            <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">New Challenge Available</p>
            <h4 className="text-xl font-black text-white leading-tight">Summer Shred 2026</h4>
            
            <div className="flex -space-x-1.5 my-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-indigo-700 bg-gray-900 flex items-center justify-center text-[8px] font-black font-mono">
                  U{i}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-indigo-700 bg-indigo-950 flex items-center justify-center text-[8px] font-black font-mono">
                +12
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/ai-coach')}
              className="w-full py-3.5 bg-white text-indigo-900 text-xs font-black rounded-xl hover:bg-indigo-50 transition-colors uppercase tracking-widest"
            >
              Join Shred
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
