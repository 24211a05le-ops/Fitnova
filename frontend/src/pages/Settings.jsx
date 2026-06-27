import React, { useEffect, useState } from 'react';
import { MdPerson, MdNotifications, MdStraighten, MdDeleteForever, MdSave } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { deleteUserProfile, updateUserProfile } from '../services/appService';

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    fitness_goal: '',
    height: '',
    weight: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      fitness_goal: user?.fitness_goal || '',
      height: user?.height || '',
      weight: user?.weight || '',
    });
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateUserProfile({
        name: form.name,
        fitness_goal: form.fitness_goal,
        height: form.height,
        weight: form.weight,
      });
      setUser(updated);
      localStorage.setItem('fitnova_user', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserProfile();
      logout();
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl">
      <header>
        <h1 className="text-4xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-gray-400 mt-2 text-lg">Manage your real account details and tracking preferences.</p>
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
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full bg-black border border-gray-900 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full bg-black border border-gray-900 rounded-2xl py-4 px-6 text-gray-500 focus:outline-none font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Fitness Goal</label>
                <input
                  type="text"
                  value={form.fitness_goal}
                  onChange={(event) => setForm((prev) => ({ ...prev, fitness_goal: event.target.value }))}
                  className="w-full bg-black border border-gray-900 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Height / Weight</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={form.height}
                    onChange={(event) => setForm((prev) => ({ ...prev, height: event.target.value }))}
                    placeholder="Height cm"
                    className="w-full bg-black border border-gray-900 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500 transition-all font-medium"
                  />
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
                    placeholder="Weight kg"
                    className="w-full bg-black border border-gray-900 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-green-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="bg-green-500 hover:bg-green-400 text-black font-black py-3 px-8 rounded-xl transition-all flex items-center gap-2 disabled:opacity-60">
              <MdSave size={20} />
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </section>

        <section className="bg-gray-950 border border-gray-900 rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-gray-900 bg-gray-900/10 flex items-center gap-3">
            <MdNotifications className="text-gray-500" size={24} />
            <h3 className="text-xl font-bold text-white">Application Preferences</h3>
          </div>
          <div className="p-10 space-y-6">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-bold text-white">Push Notifications</p>
                <p className="text-sm text-gray-500 font-medium">Notifications are generated dynamically from workouts and AI activity.</p>
              </div>
              <div className="w-14 h-7 bg-green-500 rounded-full relative shadow-lg shadow-green-500/20">
                <div className="absolute right-1.5 top-1.5 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="h-[1px] bg-gray-900"></div>
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-3">
                <MdStraighten className="text-gray-500" />
                <div>
                  <p className="font-bold text-white">Measurement Units</p>
                  <p className="text-sm text-gray-500 font-medium">The app currently stores workout metrics in metric units.</p>
                </div>
              </div>
              <select value="Metric (kg, cm)" disabled className="bg-black border border-gray-900 rounded-xl px-4 py-2 text-sm font-bold text-gray-500 focus:outline-none">
                <option>Metric (kg, cm)</option>
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
              Deleting your account removes your workouts, progress logs, AI history, and analytics data from this application.
            </p>
            <button onClick={handleDelete} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-8 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest">
              Delete Forever
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
