import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiUsers, FiUser, FiCheckSquare, FiClock, FiTrendingUp } = FiIcons;

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Household', href: '/household', icon: FiUsers },
    { name: 'Profile', href: '/profile', icon: FiUser },
  ];

  const stats = [
    { name: 'Completed Today', value: '8', icon: FiCheckSquare, color: 'text-success-600' },
    { name: 'Overdue', value: '2', icon: FiClock, color: 'text-danger-600' },
    { name: 'This Week', value: '24', icon: FiTrendingUp, color: 'text-primary-600' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 z-30">
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 pt-8 pb-4">
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
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              {stats.map((stat) => (
                <motion.div
                  key={stat.name}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <SafeIcon icon={stat.icon} className={`w-5 h-5 ${stat.color} mr-3`} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">{stat.name}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around py-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-primary-600'
                }`}
              >
                <SafeIcon icon={item.icon} className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;