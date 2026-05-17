import React from 'react';
import { MdEmojiEvents, MdFlashOn, MdWaterDrop, MdInfo } from 'react-icons/md';

const Notifications = () => {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Activity Center</h1>
          <p className="text-gray-400 mt-2 text-lg">Stay updated with Fitnova's latest achievements.</p>
        </div>
        <button className="text-sm font-bold text-gray-500 hover:text-white transition-colors">Mark all as read</button>
      </header>

      <div className="space-y-4">
        {[
          { title: 'New PR Achievement!', desc: 'You broke your Bench Press record with 85kg.', icon: <MdEmojiEvents />, color: 'bg-yellow-500/10 text-yellow-500', time: '2m ago', category: 'Achievement' },
          { title: 'Workout Reminder', desc: 'Leg Day starts in 15 minutes.', icon: <MdFlashOn />, color: 'bg-green-500/10 text-green-500', time: '12m ago', category: 'Routine' },
          { title: 'Hydration Alert', desc: "You're 2 glasses behind your daily water goal.", icon: <MdWaterDrop />, color: 'bg-blue-500/10 text-blue-500', time: '1h ago', category: 'Health' },
          { title: 'System Update', desc: 'Fitnova v1.0.4 is now live.', icon: <MdInfo />, color: 'bg-purple-500/10 text-purple-500', time: '5h ago', category: 'System' },
        ].map((notif, i) => (
          <div key={i} className="bg-gray-950 border border-gray-900 rounded-[32px] p-8 flex gap-8 items-start hover:border-gray-800 transition-all group">
            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl shrink-0 ${notif.color}`}>
              {notif.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-green-500 transition-colors">{notif.title}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 px-2 py-0.5 border border-gray-900 rounded">{notif.category}</span>
                </div>
                <span className="text-xs font-bold text-gray-700">{notif.time}</span>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">{notif.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
