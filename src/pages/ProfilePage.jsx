import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import { useChores } from '../contexts/ChoreContext';
import { useCalendar } from '../contexts/CalendarContext';
import AvatarSelector from '../components/AvatarSelector';
import CalendarConnect from '../components/CalendarConnect';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMail, FiEdit, FiSave, FiX, FiBell, FiSettings, FiLogOut, FiCamera, FiCalendar, FiLink } = FiIcons;

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showNotification, permission, requestPermission } = useNotification();
  const { chores, getChoresByStatus } = useChores();
  const { connected, provider, formatProviderName } = useCalendar();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showCalendarConnect, setShowCalendarConnect] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Calculate user stats
  const completedChores = getChoresByStatus(true);
  const pendingChores = getChoresByStatus(false);
  const userCompletedChores = completedChores.filter(chore => chore.completedBy === user?.id);
  const userAssignedChores = chores.filter(chore => chore.assignedTo === user?.name);
  
  const userCompletedThisWeek = userCompletedChores.filter(chore => {
    const completedDate = new Date(chore.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate >= weekAgo;
  });

  const completionRate = userAssignedChores.length > 0 
    ? Math.round((userCompletedChores.length / userAssignedChores.length) * 100)
    : 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    showNotification('Profile updated successfully!', 'success');
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const handleAvatarSelect = (avatar) => {
    updateProfile({ avatar });
    showNotification('Avatar updated successfully!', 'success');
  };

  const handleNotificationToggle = async () => {
    if (permission === 'default') {
      const result = await requestPermission();
      if (result === 'granted') {
        showNotification('Notifications enabled!', 'success');
      } else {
        showNotification('Notifications permission denied', 'error');
      }
    } else if (permission === 'granted') {
      showNotification('Notifications are already enabled', 'info');
    } else {
      showNotification('Please enable notifications in your browser settings', 'warning');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      showNotification('Logged out successfully', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-500 font-medium py-2 px-4 rounded-xl hover:bg-primary-50 transition-all duration-200 flex items-center"
            >
              <SafeIcon icon={FiEdit} className="w-4 h-4 mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="border-2 border-gray-300 hover:border-danger-500 text-gray-700 hover:text-danger-500 font-medium py-2 px-4 rounded-xl hover:bg-danger-50 transition-all duration-200 flex items-center"
              >
                <SafeIcon icon={FiX} className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-2 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
                Save
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative mr-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAvatarSelector(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <SafeIcon icon={FiCamera} className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h3>
            <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            ) : (
              <p className="text-gray-900 py-2">{user?.name || 'Not set'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiMail} className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            ) : (
              <p className="text-gray-900 py-2">{user?.email || 'Not set'}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          <SafeIcon icon={FiSettings} className="w-5 h-5 inline mr-2" />
          Preferences
        </h2>
        <div className="space-y-6">
          {/* Calendar Integration */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 flex items-center">
                <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                Calendar Integration
              </h3>
              <p className="text-sm text-gray-600">
                {connected 
                  ? `Connected to ${formatProviderName(provider)} Calendar` 
                  : 'Sync chores with your favorite calendar app'}
              </p>
            </div>
            <button
              onClick={() => setShowCalendarConnect(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                connected
                  ? 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {connected ? (
                <>
                  <SafeIcon icon={FiLink} className="w-4 h-4 mr-2 inline" />
                  Manage
                </>
              ) : (
                <>
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2 inline" />
                  Connect
                </>
              )}
            </button>
          </div>

          {/* Browser Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Browser Notifications</h3>
              <p className="text-sm text-gray-600">
                Get notified about upcoming and overdue chores
              </p>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                permission === 'granted'
                  ? 'bg-success-100 text-success-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SafeIcon icon={FiBell} className="w-4 h-4 mr-2 inline" />
              {permission === 'granted' ? 'Enabled' : 'Enable'}
            </button>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Account</h3>
                <p className="text-sm text-gray-600">
                  Sign out of your account
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-danger-100 text-danger-800 rounded-lg hover:bg-danger-200 transition-colors font-medium"
              >
                <SafeIcon icon={FiLogOut} className="w-4 h-4 mr-2 inline" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{userCompletedChores.length}</div>
            <div className="text-sm text-gray-600">Chores Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">{userCompletedThisWeek.length}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600">{userAssignedChores.filter(c => !c.completed).length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600">{completionRate}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Avatar Selector Modal */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={user?.avatar}
      />

      {/* Calendar Connect Modal */}
      <CalendarConnect
        isOpen={showCalendarConnect}
        onClose={() => setShowCalendarConnect(false)}
      />
    </div>
  );
};

export default ProfilePage;