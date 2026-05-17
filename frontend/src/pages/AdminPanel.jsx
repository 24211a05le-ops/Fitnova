import React from 'react';
import { MdPeople, MdMoreVert, MdSearch } from 'react-icons/md';

const AdminPanel = () => {
  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Fitnova Console</h1>
          <p className="text-gray-400 mt-2 text-lg">Platform-wide analytics and content management.</p>
        </div>
        <div className="bg-gray-950 border border-gray-900 rounded-2xl px-6 py-3 flex items-center gap-3">
          <MdPeople className="text-purple-500" size={24} />
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Users</p>
            <p className="text-lg font-black text-white leading-none">1,240</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Today', value: '432', trend: '+12%', color: 'text-green-500' },
          { label: 'Exercises', value: '256', trend: '+4', color: 'text-blue-500' },
          { label: 'Reported Issues', value: '3', trend: '-2', color: 'text-red-500' },
          { label: 'Premium Users', value: '15%', trend: '+1.5%', color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-950 border border-gray-900 rounded-[32px] p-8">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-white">{stat.value}</p>
            <p className={`text-xs font-bold mt-2 ${stat.color}`}>{stat.trend} from last month</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-950 border border-gray-900 rounded-[48px] overflow-hidden">
        <div className="p-10 border-b border-gray-900 bg-gray-900/10 flex justify-between items-center">
          <h3 className="text-2xl font-black text-white tracking-tight">User Management</h3>
          <div className="flex gap-4">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input type="text" placeholder="Search users..." className="bg-black border border-gray-900 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-purple-500" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-900">
                <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">User</th>
                <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan</th>
                <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Anil V', email: 'anil@example.com', status: 'Active', plan: 'Premium' },
                { name: 'John Doe', email: 'john@example.com', status: 'Active', plan: 'Free' },
              ].map((user, i) => (
                <tr key={i} className="border-b border-gray-900/50 hover:bg-white/5 transition-colors group">
                  <td className="p-8">
                    <div>
                      <p className="font-bold text-white">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-900 text-gray-600'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-8 font-bold text-sm text-gray-400">{user.plan}</td>
                  <td className="p-8">
                    <button className="text-gray-700 hover:text-white transition-colors">
                      <MdMoreVert size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
