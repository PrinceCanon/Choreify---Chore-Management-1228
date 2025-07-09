import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiPlus, FiLink, FiCopy, FiCheck, FiTrash2, FiMail, FiSettings, FiTrophy } = FiIcons;

const HouseholdPage = () => {
  const { user, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  const { leaderboardEnabled, saveLeaderboardSettings } = useLeaderboard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Use empty household initially instead of mock data
  const [household, setHousehold] = useState(
    user?.householdId ? {
      id: user.householdId,
      name: '',
      members: [],
      createdAt: new Date().toISOString(),
    } : null
  );

  const handleCreateHousehold = () => {
    if (!householdName.trim()) return;

    const newHousehold = {
      id: Date.now().toString(),
      name: householdName,
      members: [{
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin',
        avatar: user.avatar,
      }],
      createdAt: new Date().toISOString(),
    };

    setHousehold(newHousehold);
    updateProfile({ householdId: newHousehold.id });
    setShowCreateModal(false);
    setHouseholdName('');
    showNotification('Household created successfully!', 'success');
  };

  const handleGenerateInviteLink = () => {
    const link = `${window.location.origin}/#/join/${household.id}`;
    setInviteLink(link);
    setShowInviteModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      showNotification('Invite link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showNotification('Failed to copy link', 'error');
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    // Will be implemented with backend
    showNotification(`Invitation sent to ${inviteEmail}!`, 'success');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      setHousehold(prev => ({
        ...prev,
        members: prev.members.filter(member => member.id !== memberId)
      }));
      showNotification('Member removed from household', 'info');
    }
  };

  const handleToggleLeaderboard = () => {
    const newEnabled = !leaderboardEnabled;
    saveLeaderboardSettings(newEnabled);
    showNotification(
      `Leaderboard ${newEnabled ? 'enabled' : 'disabled'} for household`, 
      'success'
    );
    setShowSettingsModal(false);
  };

  const isAdmin = household?.members.find(m => m.id === user?.id)?.role === 'admin';

  if (!household) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Create Your Household
          </h1>
          <p className="text-gray-600">
            Start collaborating with your family or roommates
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiUsers} className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Household Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create a household to share chores with your family or roommates, or wait for an invitation to join an existing one.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-200 w-full flex items-center justify-center"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
              Create Household
            </button>
          </div>
        </motion.div>

        {/* Create Household Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Create New Household
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Household Name
                  </label>
                  <input
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., The Smith Family"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-500 font-medium py-3 px-6 rounded-xl hover:bg-primary-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateHousehold}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-200"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

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
            {household.name || 'My Household'}
          </h1>
          <p className="text-gray-600 mt-1">
            {household.members.length} member{household.members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettingsModal(true)}
              className="border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-500 font-medium py-3 px-6 rounded-xl hover:bg-primary-50 transition-all duration-200 flex items-center"
            >
              <SafeIcon icon={FiSettings} className="w-5 h-5 mr-2" />
              Settings
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateInviteLink}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center"
          >
            <SafeIcon icon={FiLink} className="w-5 h-5 mr-2" />
            Invite Members
          </motion.button>
        </div>
      </motion.div>

      {/* Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Household Members</h2>
        {household.members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No members in this household yet.</p>
            <button
              onClick={handleGenerateInviteLink}
              className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2 inline" />
              Invite people to join
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {household.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mr-4">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.role === 'admin' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                  {member.role !== 'admin' && isAdmin && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Leaderboard Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SafeIcon icon={FiTrophy} className="w-6 h-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Leaderboard</h3>
              <p className="text-sm text-gray-600">
                {leaderboardEnabled ? 'Currently enabled for friendly competition' : 'Currently disabled'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            leaderboardEnabled ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {leaderboardEnabled ? 'Active' : 'Disabled'}
          </div>
        </div>
      </motion.div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSettingsModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Household Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-900">Leaderboard</h3>
                  <p className="text-sm text-gray-600">
                    Enable competitive scoring for household members
                  </p>
                </div>
                <button
                  onClick={handleToggleLeaderboard}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    leaderboardEnabled
                      ? 'bg-success-100 text-success-800 hover:bg-success-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {leaderboardEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowInviteModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Invite Members
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Invite Link
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="input-field flex-1"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      copied ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <SafeIcon icon={copied ? FiCheck : FiCopy} className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send Email Invitation
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Enter email address"
                  />
                  <button
                    onClick={handleSendInvite}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <SafeIcon icon={FiMail} className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HouseholdPage;