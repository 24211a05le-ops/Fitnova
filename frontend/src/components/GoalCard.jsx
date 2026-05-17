import React from 'react';

const GoalCard = ({ title, target, current, unit, colorClass = 'bg-green-500' }) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl hover:border-gray-700 transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-200">{title}</h3>
        <span className="text-xs font-mono text-gray-500">{percentage}%</span>
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{current}</span>
          <span className="text-gray-500 text-sm">{unit}</span>
          <span className="text-gray-600 mx-2">/</span>
          <span className="text-gray-400 font-medium">{target} {unit}</span>
        </div>
      </div>

      <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default GoalCard;
