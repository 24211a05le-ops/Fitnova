import React from 'react';
import { MdPictureAsPdf, MdDownload, MdTrendingUp, MdAssessment } from 'react-icons/md';

const Reports = () => {
  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Fitnova Reports</h1>
          <p className="text-gray-400 mt-2 text-lg">Generate and export comprehensive fitness data reports.</p>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-red-500/20 flex items-center gap-3 group">
          <MdPictureAsPdf size={24} className="group-hover:scale-110 transition-transform" />
          Export All as PDF
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: 'Workout History', type: 'CSV / PDF', count: '152 Sessions', icon: <MdAssessment size={32} />, color: 'text-blue-500' },
          { title: 'Weight Progression', type: 'PNG / PDF', count: '48 Logs', icon: <MdTrendingUp size={32} />, color: 'text-green-500' },
        ].map((report, i) => (
          <div key={i} className="bg-gray-950 border border-gray-900 rounded-[40px] p-10 hover:border-gray-800 transition-all group">
            <div className={`w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mb-8 ${report.color}`}>
              {report.icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{report.title}</h3>
            <p className="text-sm text-gray-500 font-medium mb-8">{report.count} • Available in {report.type}</p>
            <button className="w-full py-4 border border-gray-900 rounded-2xl text-[10px] font-black text-gray-500 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest flex items-center justify-center gap-3">
              <MdDownload size={18} />
              Download Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
