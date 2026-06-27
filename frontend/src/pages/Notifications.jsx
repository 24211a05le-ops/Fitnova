import React, { useEffect, useState } from 'react';
import { MdEmojiEvents, MdFlashOn, MdWaterDrop, MdInfo } from 'react-icons/md';
import { getAppOverview } from '../services/appService';

const ICON_MAP = {
  Workout: <MdFlashOn />,
  Tracking: <MdWaterDrop />,
  Nutrition: <MdInfo />,
  'AI Coach': <MdEmojiEvents />,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const overview = await getAppOverview();
        setNotifications(overview.notifications || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Activity Center</h1>
          <p className="text-gray-400 mt-2 text-lg">Recent app events based on your saved workouts, logs, and AI activity.</p>
        </div>
      </header>

      <div className="space-y-4">
        {notifications.map((notif, index) => (
          <div key={`${notif.title}-${index}`} className="bg-gray-950 border border-gray-900 rounded-[32px] p-8 flex gap-8 items-start hover:border-gray-800 transition-all group">
            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl shrink-0 ${notif.color}`}>
              {ICON_MAP[notif.category] || <MdInfo />}
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
        {notifications.length === 0 && (
          <div className="bg-gray-950 border border-gray-900 rounded-[32px] p-8 text-gray-500">
            Notifications will appear once you start logging workouts, progress, or AI plans.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
