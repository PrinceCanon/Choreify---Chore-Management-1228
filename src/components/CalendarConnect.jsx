import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendar } from '../contexts/CalendarContext';
import { format } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';

const { FiCalendar, FiX, FiRefreshCw, FiCheck, FiExternalLink } = FiIcons;

const CalendarConnect = ({ isOpen, onClose }) => {
  const { 
    connected, 
    provider, 
    syncing, 
    lastSynced, 
    disconnectCalendar, 
    syncChoresWithCalendar,
    authorizeWithGoogle,
    authorizeWithApple,
    formatProviderName
  } = useCalendar();
  
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const handleSyncNow = async () => {
    await syncChoresWithCalendar(true);
  };

  const handleDisconnect = async () => {
    if (confirmDisconnect) {
      await disconnectCalendar();
      setConfirmDisconnect(false);
      onClose();
    } else {
      setConfirmDisconnect(true);
    }
  };

  const handleCancelDisconnect = () => {
    setConfirmDisconnect(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <SafeIcon icon={FiCalendar} className="w-6 h-6 mr-2 text-primary-600" />
                Calendar Integration
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {connected ? (
                <div className="space-y-6">
                  {/* Connected Status */}
                  <div className="bg-success-50 border border-success-200 rounded-xl p-4 flex items-center">
                    <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mr-4">
                      <SafeIcon icon={FiCheck} className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-success-900">Connected to Calendar</h3>
                      <p className="text-sm text-success-700">
                        Your chores are syncing with {formatProviderName(provider)} Calendar
                      </p>
                    </div>
                  </div>

                  {/* Last Synced Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Last synchronized</span>
                      <span className="text-sm text-gray-600">
                        {lastSynced ? format(new Date(lastSynced), 'MMM d, yyyy h:mm a') : 'Never'}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleSyncNow}
                      disabled={syncing}
                      className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:bg-primary-300"
                    >
                      {syncing ? (
                        <>
                          <LoadingSpinner size="small" color="white" />
                          <span className="ml-2">Syncing...</span>
                        </>
                      ) : (
                        <>
                          <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
                          Sync Now
                        </>
                      )}
                    </button>
                  </div>

                  {/* How it works */}
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                    <h3 className="font-medium text-primary-900 mb-2">How it works</h3>
                    <ul className="text-sm text-primary-800 space-y-2">
                      <li className="flex items-start">
                        <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">1</span>
                        <span>Chores with due dates will appear in your calendar</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">2</span>
                        <span>Updates to chores will sync automatically</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">3</span>
                        <span>Completed or deleted chores will be removed from your calendar</span>
                      </li>
                    </ul>
                  </div>

                  {/* Disconnect Button */}
                  {confirmDisconnect ? (
                    <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
                      <h3 className="font-medium text-danger-900 mb-2">Confirm Disconnection</h3>
                      <p className="text-sm text-danger-800 mb-4">
                        Are you sure you want to disconnect your calendar? All synced events will remain in your calendar.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleCancelDisconnect}
                          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDisconnect}
                          disabled={syncing}
                          className="flex-1 px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg transition-colors disabled:bg-danger-300"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleDisconnect}
                      disabled={syncing}
                      className="w-full px-4 py-2 border border-danger-300 text-danger-700 hover:bg-danger-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      Disconnect Calendar
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Connect Instructions */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SafeIcon icon={FiCalendar} className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Connect Your Calendar
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Synchronize your chores with your preferred calendar app to never miss a deadline.
                    </p>
                  </div>

                  {/* Calendar Options */}
                  <div className="space-y-3">
                    <button
                      onClick={authorizeWithGoogle}
                      disabled={syncing}
                      className="w-full flex items-center justify-between px-6 py-4 bg-white border border-gray-300 hover:border-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                    >
                      <div className="flex items-center">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" 
                          alt="Google Calendar" 
                          className="w-6 h-6 mr-3"
                        />
                        <span className="font-medium">Google Calendar</span>
                      </div>
                      <SafeIcon icon={FiExternalLink} className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={authorizeWithApple}
                      disabled={syncing}
                      className="w-full flex items-center justify-between px-6 py-4 bg-white border border-gray-300 hover:border-primary-500 hover:bg-primary-50 rounded-xl transition-all"
                    >
                      <div className="flex items-center">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/5/5e/ICal_Icon.png" 
                          alt="Apple Calendar" 
                          className="w-6 h-6 mr-3"
                        />
                        <span className="font-medium">Apple Calendar</span>
                      </div>
                      <SafeIcon icon={FiExternalLink} className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Privacy Note */}
                  <div className="text-xs text-gray-500 mt-4 text-center">
                    <p>We only create and update events in your calendar based on your chores.</p>
                    <p className="mt-1">We never read or modify other events in your calendar.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CalendarConnect;