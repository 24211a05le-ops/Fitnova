import React, { useState } from 'react';
import ProgressChart from '../components/ProgressChart';
import { TrendingDown, TrendingUp, Scale, Plus, Trash2, Calendar, Camera, X, Loader2, BarChart3, Target, Flame, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogModal, setShowLogModal] = useState(false);
  const [weightRange, setWeightRange] = useState('month');
  const [newLog, setNewLog] = useState({ weight: '', date: '', notes: '' });

  // Mock weight log data
  const [weightLogs, setWeightLogs] = useState([
    { id: 1, weight: 82.0, date: '2026-04-20', notes: 'Starting weight' },
    { id: 2, weight: 81.5, date: '2026-04-27', notes: '' },
    { id: 3, weight: 80.8, date: '2026-05-04', notes: 'Feeling lighter' },
    { id: 4, weight: 81.2, date: '2026-05-08', notes: 'Cheat day effect' },
    { id: 5, weight: 80.5, date: '2026-05-11', notes: '' },
    { id: 6, weight: 79.8, date: '2026-05-15', notes: 'New low!' },
    { id: 7, weight: 79.5, date: '2026-05-19', notes: 'On track' },
  ]);

  const weightData = weightLogs.map(l => l.weight);
  const currentWeight = weightLogs[weightLogs.length - 1]?.weight || 0;
  const startWeight = weightLogs[0]?.weight || 0;
  const totalChange = (currentWeight - startWeight).toFixed(1);
  const weeklyChange = weightLogs.length >= 2 ? (weightLogs[weightLogs.length - 1].weight - weightLogs[weightLogs.length - 2].weight).toFixed(1) : 0;

  const handleAddLog = () => {
    if (!newLog.weight) return;
    const log = { id: Date.now(), weight: parseFloat(newLog.weight), date: newLog.date || new Date().toISOString().split('T')[0], notes: newLog.notes };
    setWeightLogs(prev => [...prev, log].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setNewLog({ weight: '', date: '', notes: '' });
    setShowLogModal(false);
  };

  const handleDeleteLog = (id) => setWeightLogs(prev => prev.filter(l => l.id !== id));

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <header>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Analytics & Tracking</h1>
        <p className="text-gray-500 mt-1 text-sm">Monitor your transformation with detailed metrics and trends.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 size={14} /> },
          { id: 'weight', label: 'Weight Tracking', icon: <Scale size={14} /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id ? 'bg-gray-950 text-green-500 border border-white/5 border-b-0' : 'text-gray-600 hover:text-gray-300'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Weight Change', value: `${totalChange}kg`, sub: 'Total', icon: <TrendingDown size={18} />, color: 'text-green-500 bg-green-500/10' },
              { label: 'Strength Gain', value: '+12%', sub: 'Avg lift', icon: <TrendingUp size={18} />, color: 'text-blue-500 bg-blue-500/10' },
              { label: 'Workouts', value: '24', sub: 'This month', icon: <Flame size={18} />, color: 'text-orange-500 bg-orange-500/10' },
              { label: 'Consistency', value: '87%', sub: 'Score', icon: <Target size={18} />, color: 'text-purple-500 bg-purple-500/10' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-gray-950 border border-white/5 rounded-2xl p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-950 border border-white/5 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Weight Progression</h3>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <div className="flex gap-1">
                  {['Weekly', 'Monthly'].map(r => (
                    <button key={r} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${r === 'Monthly' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="h-[250px]"><ProgressChart data={weightData} color="rgb(34, 197, 94)" /></div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-950 border border-white/5 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Key Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500"><TrendingDown size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Weight Loss</p>
                      <p className="text-base font-bold text-white">{totalChange}kg <span className="text-xs text-green-500 ml-1">this month</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><TrendingUp size={18} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Strength Gain</p>
                      <p className="text-base font-bold text-white">+12% <span className="text-xs text-blue-500 ml-1">avg lift</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-6 text-black">
                <h3 className="text-base font-bold mb-1">Pro Tip</h3>
                <p className="text-xs font-medium opacity-80 leading-relaxed">Weigh yourself at the same time each day for more accurate trend data.</p>
                <button className="mt-4 w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-900 transition-colors">Set Reminder</button>
              </div>
            </div>
          </div>

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Muscle Distribution', data: [40, 45, 30, 55, 60, 45, 50], color: 'rgb(168, 85, 247)' },
              { title: 'Consistency Score', data: [90, 85, 100, 80, 95, 100, 90], color: 'rgb(249, 115, 22)' },
              { title: 'Activity Volume', data: [20, 60, 45, 90, 30, 75, 40], color: 'rgb(59, 130, 246)' },
            ].map((chart, i) => (
              <div key={i} className="bg-gray-950 border border-white/5 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">{chart.title}</h3>
                <div className="h-[180px]"><ProgressChart data={chart.data} color={chart.color} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weight Tracking Tab */}
      {activeTab === 'weight' && (
        <div className="space-y-6">
          {/* Weight Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Current', value: `${currentWeight}kg`, color: 'text-white' },
              { label: 'Start', value: `${startWeight}kg`, color: 'text-gray-400' },
              { label: 'Total Change', value: `${totalChange}kg`, color: parseFloat(totalChange) <= 0 ? 'text-green-500' : 'text-orange-500' },
              { label: 'This Week', value: `${weeklyChange}kg`, color: parseFloat(weeklyChange) <= 0 ? 'text-green-500' : 'text-orange-500' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-950 border border-white/5 rounded-2xl p-5 text-center">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Chart + Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-950 border border-white/5 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity size={18} className="text-green-500" /> Weight Trend</h3>
                <div className="flex gap-1">
                  {['week', 'month', '3months'].map(r => (
                    <button key={r} onClick={() => setWeightRange(r)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${weightRange === r ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="h-[280px]"><ProgressChart data={weightData} color="rgb(34, 197, 94)" /></div>
            </div>
            <div className="space-y-4">
              <button onClick={() => setShowLogModal(true)}
                className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-lg shadow-green-500/10">
                <Plus size={16} /> Log Weight
              </button>
              <div className="bg-gray-950 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Camera size={14} className="text-gray-500" />
                  <span className="text-xs font-bold text-gray-500">Progress Photos</span>
                </div>
                <div className="border-2 border-dashed border-gray-800 rounded-xl p-8 text-center">
                  <Camera size={24} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Upload progress photos</p>
                  <p className="text-[10px] text-gray-700 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weight History */}
          <div className="bg-gray-950 border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Calendar size={16} className="text-gray-500" /> Weight History</h3>
            <div className="space-y-2">
              {weightLogs.slice().reverse().map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-black rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><Scale size={16} className="text-green-500" /></div>
                    <div>
                      <p className="text-sm font-bold text-white">{log.weight} kg</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{log.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {log.notes && <span className="text-xs text-gray-500 hidden sm:block">{log.notes}</span>}
                    <button onClick={() => handleDeleteLog(log.id)} className="p-2 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Weight Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gray-950 border border-white/5 rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Scale size={20} className="text-green-500" /> Log Weight</h3>
                <button onClick={() => setShowLogModal(false)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Weight (kg)</label>
                  <input type="number" step="0.1" value={newLog.weight} onChange={e => setNewLog(p => ({ ...p, weight: e.target.value }))}
                    placeholder="79.5" className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white text-lg font-mono focus:outline-none focus:border-green-500 transition-all text-center" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Date</label>
                  <input type="date" value={newLog.date} onChange={e => setNewLog(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-green-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Notes (Optional)</label>
                  <input type="text" value={newLog.notes} onChange={e => setNewLog(p => ({ ...p, notes: e.target.value }))}
                    placeholder="How are you feeling?" className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-green-500 transition-all placeholder-gray-700" />
                </div>
                <button onClick={handleAddLog} disabled={!newLog.weight}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl transition-all text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-green-500/10">
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analytics;
