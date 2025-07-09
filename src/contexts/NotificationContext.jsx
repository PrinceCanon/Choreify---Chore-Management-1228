import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiAlertTriangle, FiInfo } = FiIcons;

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove notification
    setTimeout(() => {
      removeNotification(id);
    }, duration);

    // Show browser notification if permission granted
    if (permission === 'granted' && type === 'info') {
      new Notification('Choreify', {
        body: message,
        icon: '/vite.svg',
      });
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return FiCheck;
      case 'error':
        return FiX;
      case 'warning':
        return FiAlertTriangle;
      default:
        return FiInfo;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'error':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'warning':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      default:
        return 'text-primary-600 bg-primary-50 border-primary-200';
    }
  };

  const value = {
    notifications,
    permission,
    requestPermission,
    showNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`max-w-sm w-full rounded-xl border p-4 shadow-lg ${getColors(notification.type)}`}
            >
              <div className="flex items-start">
                <SafeIcon 
                  icon={getIcon(notification.type)} 
                  className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;