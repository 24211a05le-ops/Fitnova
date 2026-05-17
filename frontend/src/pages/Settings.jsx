import React from 'react';
import { MdPerson, MdNotifications, MdStraighten, MdDeleteForever, MdSave, MdAdminPanelSettings } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-10 max-w-4xl">
      <header>
        <h1 className="text-4xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-gray-400 mt-2 text-lg">Manage your account, preferences, and integrations.</p>
      </header>

      <div className="space-y-8">
        <section className="bg-gray-950 border border-gray-900 rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-gray-900 bg-gray-900/10 flex items-center gap-3">
            <MdPerson className="text-gray-500" size={24} />
            <h3 className="text-xl font-bold text-white">Profile Configuration</h3>
          </div>
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  type="text" 
                  defaultValue={user?.name || "Alex Johnson"} 
                  className="w-full bg-black border border-gray-900 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500 transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user?.email || "alex@example.com"} 
                  className="w-full bg-black border border-gray-900 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500 transition-all font-medium" 
                />
              </div>
            </div>
            <button className="bg-green-500 hover:bg-green-400 text-black font-black py-3 px-8 rounded-xl transition-all flex items-center gap-2">
              <MdSave size={20} />
              Update Profile
            </button>
          </div>
        </section>

        {user?.role === 'admin' && (
          <section className="bg-gray-950 border border-blue-900/30 rounded-[32px] overflow-hidden">
            <div className="p-8 border-b border-blue-900/10 bg-blue-950/5 flex items-center gap-3">
              <MdAdminPanelSettings className="text-blue-500" size={24} />
              <h3 className="text-xl font-bold text-white">Admin Controls</h3>
            </div>
            <div className="p-10 space-y-6">
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="font-bold text-white">Maintenance Mode</p>
                  <p className="text-sm text-gray-500 font-medium">Disable user access for system updates</p>
                </div>
                <div className="w-14 h-7 bg-gray-900 border border-gray-800 rounded-full relative cursor-pointer">
                  <div className="absolute left-1.5 top-1.5 w-4 h-4 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="bg-gray-950 border border-gray-900 rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-gray-900 bg-gray-900/10 flex items-center gap-3">
            <MdNotifications className="text-gray-500" size={24} />
            <h3 className="text-xl font-bold text-white">Application Preferences</h3>
          </div>
          <div className="p-10 space-y-6">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-bold text-white">Push Notifications</p>
                <p className="text-sm text-gray-500 font-medium">Receive real-time alerts about your schedule</p>
              </div>
              <div className="w-14 h-7 bg-green-500 rounded-full relative cursor-pointer shadow-lg shadow-green-500/20">
                <div className="absolute right-1.5 top-1.5 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="h-[1px] bg-gray-900"></div>
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-3">
                <MdStraighten className="text-gray-500" />
                <div>
                  <p className="font-bold text-white">Measurement Units</p>
                  <p className="text-sm text-gray-500 font-medium">Global unit system for tracking</p>
                </div>
              </div>
              <select className="bg-black border border-gray-900 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-green-500 transition-all">
                <option>Metric (kg, cm)</option>
                <option>Imperial (lb, in)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-gray-950 border border-red-900/30 rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-red-900/10 bg-red-950/5 flex items-center gap-3">
            <MdDeleteForever className="text-red-500/50" size={24} />
            <h3 className="text-xl font-bold text-red-500/80">Account Privacy</h3>
          </div>
          <div className="p-10">
            <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
              Once you delete your account, there is no going back. All your workout history, progress photos, and analytics will be permanently removed from our servers.
            </p>
            <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest">
              Delete Forever
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
