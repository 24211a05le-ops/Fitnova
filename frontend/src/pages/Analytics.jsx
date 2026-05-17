import React from 'react';
import ProgressChart from '../components/ProgressChart';
import { MdTrendingDown, MdTrendingUp, MdHistory } from 'react-icons/md';

const Analytics = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-white tracking-tight">Analytics Overview</h1>
        <p className="text-gray-400 mt-2">Track your physical transformation and performance metrics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-950 border border-gray-900 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Weight Progression</h3>
              <p className="text-sm text-gray-500">Last 30 days performance</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 bg-gray-900 text-xs font-semibold text-white rounded-lg border border-gray-800">Weekly</button>
              <button className="px-4 py-1.5 text-xs font-semibold text-gray-500 rounded-lg">Monthly</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ProgressChart data={[82, 81.5, 80.8, 81.2, 80.5, 79.8, 79.5]} color="rgb(34, 197, 94)" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-950 border border-gray-900 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">Key Insights</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                  <MdTrendingDown size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Weight Loss</p>
                  <p className="text-lg font-bold text-white">-2.5kg <span className="text-xs text-green-500 font-medium ml-1">this month</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <MdTrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Strength Gain</p>
                  <p className="text-lg font-bold text-white">+12% <span className="text-xs text-blue-500 font-medium ml-1">avg. lift</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-8 text-black">
            <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
            <p className="text-sm font-medium opacity-80 leading-relaxed">
              Consistently tracking your weight at the same time each day provides more accurate data for long-term analysis.
            </p>
            <button className="mt-6 w-full py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-900 transition-colors">
              Set Reminder
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gray-950 border border-gray-900 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6">Muscle Distribution</h3>
          <div className="h-[200px]">
            <ProgressChart data={[40, 45, 30, 55, 60, 45, 50]} color="rgb(168, 85, 247)" />
          </div>
        </div>
        <div className="bg-gray-950 border border-gray-900 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6">Consistency Score</h3>
          <div className="h-[200px]">
            <ProgressChart data={[90, 85, 100, 80, 95, 100, 90]} color="rgb(249, 115, 22)" />
          </div>
        </div>
        <div className="bg-gray-950 border border-gray-900 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-6">Activity Volume</h3>
          <div className="h-[200px]">
            <ProgressChart data={[20, 60, 45, 90, 30, 75, 40]} color="rgb(59, 130, 246)" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
