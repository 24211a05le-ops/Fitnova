import React, { useEffect, useState } from 'react';
import { MdWhatshot, MdDateRange } from 'react-icons/md';
import { getAppOverview } from '../services/appService';

const Attendance = () => {
  const [attendance, setAttendance] = useState({
    streak_current: 0,
    heatmap: [],
    total_workouts: 0,
    consistency_score: 0,
    monthly: [],
  });

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const overview = await getAppOverview();
        setAttendance(overview.attendance || attendance);
      } catch (error) {
        console.error('Failed to load attendance:', error);
      }
    };

    loadAttendance();
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Consistency Heatmap</h1>
          <p className="text-gray-400 mt-2 text-lg">A full-year view of your logged workout activity.</p>
        </div>
        <div className="bg-gray-950 border border-gray-900 rounded-2xl px-6 py-3 flex items-center gap-3">
          <MdWhatshot className="text-orange-500" size={24} />
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Streak</p>
            <p className="text-lg font-black text-white leading-none">{attendance.streak_current} Days</p>
          </div>
        </div>
      </header>

      <div className="bg-gray-950 border border-gray-900 rounded-[48px] p-12">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-white tracking-tight">Workout Grid</h3>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-600">Less</span>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${
                  i === 0 ? 'bg-gray-900' : i === 1 ? 'bg-green-500/20' : i === 2 ? 'bg-green-500/40' : i === 3 ? 'bg-green-500/70' : 'bg-green-500'
                }`}></div>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-600">More</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
          {attendance.heatmap.map((day) => (
            <div
              key={day.date}
              className={`w-4 h-4 rounded-sm transition-all hover:scale-125 cursor-pointer ${
                day.intensity === 0 ? 'bg-gray-900' :
                day.intensity === 1 ? 'bg-green-500/20' :
                day.intensity === 2 ? 'bg-green-500/40' :
                day.intensity === 3 ? 'bg-green-500/70' : 'bg-green-500'
              }`}
              title={day.date}
            ></div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-gray-900">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Workouts</p>
            <p className="text-3xl font-black text-white">{attendance.total_workouts}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Consistency Score</p>
            <p className="text-3xl font-black text-white">{attendance.consistency_score}%</p>
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
            {attendance.monthly.map((month) => (
              <div key={month.label} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>{month.label}</span>
                  <span>{month.completed} / {month.total} Days</span>
                </div>
                <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(month.completed / Math.max(month.total, 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-green-800 rounded-[40px] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-black/10 group-hover:text-black/20 transition-all">
            <MdWhatshot size={120} />
          </div>
          <h4 className="text-3xl font-black leading-tight">Consistency compounds into progress.</h4>
          <p className="text-sm font-medium text-green-100/80 mt-6 max-w-xs leading-relaxed">
            Every logged session adds signal for your analytics, AI coach, and recovery models.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
