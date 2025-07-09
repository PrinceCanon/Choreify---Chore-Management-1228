import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useChores } from '../contexts/ChoreContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiUsers, FiUser, FiCheckSquare, FiClock, FiTrendingUp, FiTrophy } = FiIcons;

const Sidebar = () => {
  const location = useLocation();
  const { chores, getChoresByStatus, getOverdueChores } = useChores();
  const { leaderboardEnabled } = useLeaderboard();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Household', href: '/household', icon: FiUsers },
    ...(leaderboardEnabled ? [{ name: 'Leaderboard', href: '/leaderboard', icon: FiTrophy }] : []),
    { name: 'Profile', href: '/profile', icon: FiUser },
  ];

  // Calculate dynamic stats
  const completedChores = getChoresByStatus(true);
  const overdueChores = getOverdueChores();
  
  const completedToday = completedChores.filter(chore => {
    const completedDate = new Date(chore.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  });

  const completedThisWeek = completedChores.filter(chore => {
    const completedDate = new Date(chore.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate >= weekAgo;
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 w-64 bg-white shadow-lg border-r border-gray-200 z-30" style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 pt-6 pb-4 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <SafeIcon
                      icon={item.icon}
                      className={`mr-3 h-5 w-5 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
                      }`}
                    />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Stats Section */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-3 bg-white rounded-lg shadow-sm"
              >
                <div className="flex-shrink-0">
                  <SafeIcon icon={FiCheckSquare} className="w-5 h-5 text-success-600" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">Completed Today</p>
                  <p className="text-lg font-semibold text-gray-900">{completedToday.length}</p>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-3 bg-white rounded-lg shadow-sm"
              >
                <div className="flex-shrink-0">
                  <SafeIcon icon={FiClock} className="w-5 h-5 text-danger-600" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">Overdue</p>
                  <p className="text-lg font-semibold text-gray-900">{overdueChores.length}</p>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-3 bg-white rounded-lg shadow-sm"
              >
                <div className="flex-shrink-0">
                  <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-xs text-gray-500 truncate">This Week</p>
                  <p className="text-lg font-semibold text-gray-900">{completedThisWeek.length}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-inset-bottom">
        <div className="flex justify-around py-2 px-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0 flex-1 ${
                  isActive ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'
                }`}
              >
                <SafeIcon icon={item.icon} className="w-6 h-6 mb-1 flex-shrink-0" />
                <span className="text-xs font-medium truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;