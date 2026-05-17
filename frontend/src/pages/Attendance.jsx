import React from 'react';
import { MdWhatshot, MdDateRange, MdKeyboardArrowRight } from 'react-icons/md';

const Attendance = () => {
  const days = 365;
  const heatmapData = Array.from({ length: days }, (_, i) => ({
    day: i,
    intensity: Math.floor(Math.random() * 5),
  }));

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Consistency Heatmap</h1>
          <p className="text-gray-400 mt-2 text-lg">Visualizing your discipline with Fitnova.</p>
        </div>
        <div className="bg-gray-950 border border-gray-900 rounded-2xl px-6 py-3 flex items-center gap-3">
          <MdWhatshot className="text-orange-500" size={24} />
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Streak</p>
            <p className="text-lg font-black text-white leading-none">12 Days</p>
          </div>
        </div>
      </header>

      <div className="bg-gray-950 border border-gray-900 rounded-[48px] p-12">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-white tracking-tight">Workout Grid</h3>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-600">Less</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`w-3 h-3 rounded-sm ${
                  i === 0 ? 'bg-gray-900' : i === 1 ? 'bg-green-500/20' : i === 2 ? 'bg-green-500/40' : i === 3 ? 'bg-green-500/70' : 'bg-green-500'
                }`}></div>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-600">More</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
          {heatmapData.map((d, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-sm transition-all hover:scale-125 cursor-pointer ${
                d.intensity === 0 ? 'bg-gray-900' : 
                d.intensity === 1 ? 'bg-green-500/20' : 
                d.intensity === 2 ? 'bg-green-500/40' : 
                d.intensity === 3 ? 'bg-green-500/70' : 'bg-green-500'
              }`}
            ></div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-gray-900">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Workouts</p>
            <p className="text-3xl font-black text-white">184</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Consistency Score</p>
            <p className="text-3xl font-black text-white">92%</p>
          </div>
          <div className="space-y-2 text-right">
            <button className="text-sm font-bold text-green-500 hover:text-green-400 transition-colors flex items-center gap-2 justify-end ml-auto group">
              View History
              <MdKeyboardArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-950 border border-gray-900 rounded-[40px] p-10">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <MdDateRange className="text-blue-500" />
            Monthly Attendance Trend
          </h3>
          <div className="space-y-6">
            {['May', 'April', 'March', 'February'].map((month, i) => (
              <div key={month} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>{month}</span>
                  <span>{24 - i * 2} / 30 Days</span>
                </div>
                <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-500 transition-all duration-1000`} style={{ width: `${(24 - i * 2) / 30 * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-green-800 rounded-[40px] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-black/10 group-hover:text-black/20 transition-all">
            <MdWhatshot size={120} />
          </div>
          <h4 className="text-3xl font-black leading-tight">Consistency is the<br />New Performance.</h4>
          <p className="text-sm font-medium text-green-100/80 mt-6 max-w-xs leading-relaxed">
            Every Fitnova session logged is a vote for the athlete you are becoming.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
