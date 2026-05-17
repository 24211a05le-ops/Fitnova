import React from 'react';
import { MdSearch, MdNotificationsNone, MdKeyboardArrowDown } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'FN';
  };

  return (
    <nav className="h-20 border-b border-gray-900 bg-black/50 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <MdSearch size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
          <input 
            type="text" 
            placeholder={user?.role === 'admin' ? "Search platform analytics..." : "Search your workouts, analytics..."}
            className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-green-500/50 focus:bg-gray-900 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-xl transition-all">
          <MdNotificationsNone size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-800 mx-2"></div>

        <button className="flex items-center gap-3 p-1 pr-3 hover:bg-gray-900 rounded-2xl transition-all group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-black font-bold">
            {getInitials(user?.name)}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
              {user?.role === 'admin' ? 'Administrator' : 'Pro Member'}
            </p>
          </div>
          <MdKeyboardArrowDown size={20} className="text-gray-500 group-hover:text-white transition-colors" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
