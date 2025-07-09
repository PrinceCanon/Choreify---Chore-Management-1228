import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiPlus, FiLink, FiCopy, FiCheck, FiTrash2, FiMail } = FiIcons;

const HouseholdPage = () => {
  const { user, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Mock household data
  const [household, setHousehold] = useState(
    user?.householdId ? {
      id: user.householdId,
      name: 'The Smith Family',
      members: [
        { id: 1, name: 'John Smith', email: 'john@example.com', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane' },
        { id: 3, name: 'Alex Smith', email: 'alex@example.com', role: 'member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
      ],
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
    
    // Mock email sending
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

  if (!household) {
    return (
      <div className="space-y-6">
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
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiUsers} className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Household Yet
            </h2>
            
            <p className="text-gray-600 mb-6">
              Create a household to share chores with your family or roommates, 
              or wait for an invitation to join an existing one.
            </p>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary w-full"
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
                    className="input-field"
                    placeholder="e.g., The Smith Family"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateHousehold}
                    className="flex-1 btn-primary"
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {household.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {household.members.length} member{household.members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateInviteLink}
          className="btn-primary flex items-center mt-4 sm:mt-0"
        >
          <SafeIcon icon={FiLink} className="w-5 h-5 mr-2" />
          Invite Members
        </motion.button>
      </motion.div>

      {/* Members List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Household Members</h2>
        
        <div className="space-y-4">
          {household.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.role === 'admin' 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role}
                </span>
                
                {member.role !== 'admin' && (
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
      </motion.div>

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
                      copied
                        ? 'bg-success-100 text-success-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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