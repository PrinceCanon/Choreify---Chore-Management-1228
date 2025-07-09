import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useChores } from '../contexts/ChoreContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShare, FiX, FiCheck, FiCalendar, FiClock, FiUser } = FiIcons;

const UpForGrabsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { getAvailableChores, claimChore } = useCollaboration();
  const { chores, updateChore } = useChores();
  
  const availableChores = getAvailableChores();
  
  // Filter out chores that don't exist in the main chores list
  const validChores = availableChores.filter(swappable => 
    chores.some(chore => chore.id === swappable.choreId)
  );
  
  const getChoreDetails = (choreId) => {
    return chores.find(chore => chore.id === choreId) || {};
  };
  
  const handleClaimChore = (swappable) => {
    const choreDetails = getChoreDetails(swappable.choreId);
    
    // Claim the chore
    claimChore(swappable.id, swappable.choreId, swappable.choreName);
    
    // Update the assignee
    updateChore(swappable.choreId, {
      ...choreDetails,
      assignedTo: user.name
    });
    
    // Close modal if there are no more chores
    if (validChores.length <= 1) {
      onClose();
    }
  };
  
  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <SafeIcon icon={FiShare} className="w-6 h-6 mr-2 text-primary-600" />
                Chores Up For Grabs
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chores List */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '60vh', minHeight: '200px' }}>
              {validChores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <SafeIcon icon={FiShare} className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No chores available for claiming.</p>
                  <p className="text-sm">Check back later!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {validChores.map(swappable => {
                    const choreDetails = getChoreDetails(swappable.choreId);
                    return (
                      <motion.div 
                        key={swappable.id} 
                        className="bg-primary-50 border border-primary-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{swappable.choreName}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Offered by {swappable.offeredByName} • {formatTimestamp(swappable.offeredAt)}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {choreDetails.dueDate && (
                                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full flex items-center">
                                  <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                                  Due: {format(new Date(choreDetails.dueDate), 'MMM d, yyyy')}
                                </span>
                              )}
                              {choreDetails.priority && (
                                <span className={`text-xs px-2 py-1 rounded-full flex items-center
                                  ${choreDetails.priority === 'high' ? 'bg-danger-100 text-danger-800' : 
                                    choreDetails.priority === 'medium' ? 'bg-warning-100 text-warning-800' : 
                                    'bg-success-100 text-success-800'}`}
                                >
                                  <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
                                  {choreDetails.priority} priority
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleClaimChore(swappable)}
                            className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
                          >
                            <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1" />
                            Claim
                          </button>
                        </div>
                        
                        {choreDetails.description && (
                          <div className="mt-3 text-sm text-gray-700 bg-white p-2 rounded-lg">
                            {choreDetails.description}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpForGrabsModal;