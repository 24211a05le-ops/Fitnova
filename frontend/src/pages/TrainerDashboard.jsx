import React from 'react';
import { MdGroup, MdMessage, MdKeyboardArrowRight } from 'react-icons/md';

const TrainerDashboard = () => {
  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Trainer Portal</h1>
          <p className="text-gray-400 mt-2 text-lg">Monitor trainee progress with Fitnova.</p>
        </div>
        <div className="bg-gray-950 border border-gray-900 rounded-2xl px-6 py-3 flex items-center gap-3">
          <MdGroup className="text-blue-500" size={24} />
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Trainees</p>
            <p className="text-lg font-black text-white leading-none">24 Users</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-950 border border-gray-900 rounded-[48px] overflow-hidden">
          <div className="p-10 border-b border-gray-900 bg-gray-900/10 flex justify-between items-center">
            <h3 className="text-2xl font-black text-white tracking-tight">Trainee Performance</h3>
          </div>
          <div className="p-10">
            <div className="space-y-6">
              {[
                { name: 'Anil Kumar', goal: 'Weight Loss', progress: 75, trend: '+12%' },
                { name: 'Sarah Miller', goal: 'Muscle Gain', progress: 45, trend: '+8%' },
              ].map((user, i) => (
                <div key={i} className="flex justify-between items-center p-6 bg-black border border-gray-900 rounded-[32px] group hover:border-gray-800 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-xl font-black text-white">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white group-hover:text-blue-500 transition-colors">{user.name}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-1">{user.goal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Progress</p>
                      <p className="text-sm font-bold text-white">{user.progress}%</p>
                    </div>
                    <button className="p-3 bg-gray-900 rounded-xl text-gray-500 hover:bg-white hover:text-black transition-all">
                      <MdKeyboardArrowRight size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-950 border border-gray-900 rounded-[40px] p-10">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <MdMessage className="text-blue-500" />
              Feedback
            </h3>
            <div className="space-y-6">
              {[
                { name: 'Anil', msg: 'The new leg routine is challenging but effective!', time: '2h ago' },
              ].map((msg, i) => (
                <div key={i} className="p-6 bg-gray-900/30 border border-gray-900 rounded-3xl">
                  <p className="text-sm text-gray-400 leading-relaxed italic">"{msg.msg}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
