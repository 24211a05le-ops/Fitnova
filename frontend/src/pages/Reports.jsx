import React, { useEffect, useState } from 'react';
import { MdPictureAsPdf, MdDownload, MdTrendingUp, MdAssessment } from 'react-icons/md';
import { getAppOverview } from '../services/appService';

const ICON_MAP = {
  Workout: <MdAssessment size={32} />,
  Weight: <MdTrendingUp size={32} />,
  AI: <MdPictureAsPdf size={32} />,
  Progress: <MdAssessment size={32} />,
};

const Reports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const overview = await getAppOverview();
        setReports(overview.reports || []);
      } catch (error) {
        console.error('Failed to load report summary:', error);
      }
    };

    loadReports();
  }, []);

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Fitnova Reports</h1>
          <p className="text-gray-400 mt-2 text-lg">A live summary of the data available for export and review.</p>
        </div>
        <button className="bg-red-500/20 text-red-200 font-black py-4 px-10 rounded-2xl transition-all flex items-center gap-3 group cursor-not-allowed">
          <MdPictureAsPdf size={24} className="group-hover:scale-110 transition-transform" />
          Export Coming Soon
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.map((report, index) => (
          <div key={`${report.title}-${index}`} className="bg-gray-950 border border-gray-900 rounded-[40px] p-10 hover:border-gray-800 transition-all group">
            <div className={`w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mb-8 ${report.color}`}>
              {ICON_MAP[report.icon] || <MdAssessment size={32} />}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{report.title}</h3>
            <p className="text-sm text-gray-500 font-medium mb-4">{report.count} • Available in {report.type}</p>
            <p className="text-xs text-gray-600 mb-8">Last updated: {report.last_updated || 'Not available yet'}</p>
            <button className="w-full py-4 border border-gray-900 rounded-2xl text-[10px] font-black text-gray-500 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest flex items-center justify-center gap-3">
              <MdDownload size={18} />
              Prepare Export
            </button>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="bg-gray-950 border border-gray-900 rounded-[40px] p-10 text-gray-500">
            Report summaries will appear after you start generating training and progress data.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
