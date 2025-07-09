import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCalendar } from '../contexts/CalendarContext';
import { useNotification } from '../contexts/NotificationContext';
import SafeIcon from '../common/SafeIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiCheck, FiAlertTriangle } = FiIcons;

const CalendarAuthPage = () => {
  const navigate = useNavigate();
  const { connectCalendar } = useCalendar();
  const { showNotification } = useNotification();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'

  useEffect(() => {
    const processAuthCode = async () => {
      try {
        // In a real implementation, we would extract the auth code from the URL
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const path = urlParams.get('path');
        const code = urlParams.get('code');
        
        // For demo purposes, we'll simulate a successful connection
        // In real implementation, we would use the code to get tokens
        setTimeout(async () => {
          const provider = 'google'; // Would determine this from the URL or path
          const success = await connectCalendar(provider, 'simulated_auth_code');
          
          if (success) {
            setStatus('success');
            showNotification('Calendar connected successfully!', 'success');
            
            // Redirect back to profile after a moment
            setTimeout(() => {
              navigate('/profile');
            }, 2000);
          } else {
            setStatus('error');
          }
        }, 2000);
      } catch (error) {
        console.error('Error processing auth code:', error);
        setStatus('error');
        showNotification('Failed to connect calendar', 'error');
      }
    };

    processAuthCode();
  }, [connectCalendar, navigate, showNotification]);

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 text-center"
      >
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LoadingSpinner size="medium" color="primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Connecting Calendar</h2>
            <p className="text-gray-600">
              Please wait while we securely connect your calendar...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiCheck} className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Calendar Connected!</h2>
            <p className="text-gray-600">
              Your chores will now sync with your calendar automatically.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting back to your profile...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiAlertTriangle} className="w-8 h-8 text-danger-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't connect to your calendar. Please try again.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Back to Profile
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CalendarAuthPage;