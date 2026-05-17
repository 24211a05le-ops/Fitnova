import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdFitnessCenter, 
  MdInsertChart, 
  MdRestaurant, 
  MdTimeline, 
  MdPerson, 
  MdSettings,
  MdLogout,
  MdFlag,
  MdLibraryBooks,
  MdAutoAwesome,
  MdAssessment,
  MdCalendarToday,
  MdAdminPanelSettings
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard size={22} />, roles: ['user'] },
    { name: 'Workouts', path: '/workouts', icon: <MdFitnessCenter size={22} />, roles: ['user'] },
    { name: 'Exercises', path: '/exercises', icon: <MdLibraryBooks size={22} />, roles: ['user', 'admin'] },
    { name: 'AI Coach', path: '/ai-coach', icon: <MdAutoAwesome size={22} />, roles: ['user'] },
    { name: 'Analytics', path: '/analytics', icon: <MdInsertChart size={22} />, roles: ['user'] },
    { name: 'Diet Planner', path: '/diet', icon: <MdRestaurant size={22} />, roles: ['user'] },
    { name: 'Progress', path: '/progress', icon: <MdTimeline size={22} />, roles: ['user'] },
    { name: 'Goals', path: '/goals', icon: <MdFlag size={22} />, roles: ['user'] },
    { name: 'Attendance', path: '/attendance', icon: <MdCalendarToday size={22} />, roles: ['user'] },
    { name: 'Reports', path: '/reports', icon: <MdAssessment size={22} />, roles: ['user', 'admin'] },
  ];

  const secondaryItems = [
    { name: 'Admin Console', path: '/admin', icon: <MdAdminPanelSettings size={22} />, roles: ['admin'] },
    { name: 'Profile', path: '/profile', icon: <MdPerson size={22} />, roles: ['user', 'admin'] },
    { name: 'Settings', path: '/settings', icon: <MdSettings size={22} />, roles: ['user', 'admin'] },
  ];

  const filterByRole = (items) => {
    const role = user?.role || 'user';
    return items.filter(item => item.roles.includes(role));
  };

  return (
    <div className="w-72 bg-gray-950 border-r border-gray-900 flex flex-col h-screen sticky top-0 overflow-y-auto scrollbar-hide">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-black font-black text-xl">
            FN
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Fitnova</span>
        </div>
        <div className="mb-10 ml-1">
          <span className="text-[10px] font-black text-green-500/50 uppercase tracking-[0.3em]">{user?.role} portal</span>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 ml-4">
              {user?.role === 'admin' ? 'Administration' : 'Main Menu'}
            </p>
            <nav className="space-y-1">
              {filterByRole(navItems).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'text-gray-500 hover:bg-gray-900 hover:text-white border border-transparent'
                    }`
                  }
                >
                  <span className="transition-transform group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="font-bold text-sm">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 ml-4">Account</p>
            <nav className="space-y-1">
              {filterByRole(secondaryItems).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'text-gray-500 hover:bg-gray-900 hover:text-white border border-transparent'
                    }`
                  }
                >
                  <span className="transition-transform group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="font-bold text-sm">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="mt-auto p-8 border-t border-gray-900">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all group"
        >
          <MdLogout size={22} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
