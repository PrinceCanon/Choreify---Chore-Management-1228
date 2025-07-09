import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isPast } from 'date-fns';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import { useCalendar } from '../contexts/CalendarContext';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useAuth } from '../hooks/useAuth';
import SafeIcon from '../common/SafeIcon';
import ChoreCommentsModal from './ChoreCommentsModal';
import * as FiIcons from 'react-icons/fi';

const { 
  FiClock, 
  FiUser, 
  FiCalendar, 
  FiCheck, 
  FiX, 
  FiEdit, 
  FiTrash2, 
  FiTarget,
  FiMessageSquare,
  FiCheckSquare,
  FiAlertTriangle,
  FiRepeat,
  FiShare
} = FiIcons;

const ChoreCard = ({ chore, onComplete, onEdit, onDelete, showActions = true }) => {
  const { user } = useAuth();
  const { getPointsForChore } = useLeaderboard();
  const { connected, getChoreCalendarStatus } = useCalendar();
  const { 
    getCommentsByChoreId, 
    markForApproval, 
    approveChore, 
    rejectChore,
    putChoreUpForGrabs,
    getChoreSwapStatus,
    cancelSwappableChore,
    claimChore
  } = useCollaboration();
  
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showApprovalOptions, setShowApprovalOptions] = useState(false);
  
  const isOverdue = chore.dueDate && isPast(new Date(chore.dueDate)) && !chore.completed;
  const isDueToday = chore.dueDate && isToday(new Date(chore.dueDate));
  const points = getPointsForChore(chore);
  const calendarStatus = connected ? getChoreCalendarStatus(chore.id) : null;
  const comments = getCommentsByChoreId(chore.id);
  const swapStatus = getChoreSwapStatus(chore.id);
  
  // Check if this chore is completed but needs approval
  const needsApproval = chore.completed && chore.pendingApproval;
  
  // Check if current user is the one who completed the chore
  const isCompletedByMe = chore.completedBy === user.id;
  
  // Check if current user is assigned to this chore
  const isAssignedToMe = chore.assignedTo === user.name;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-danger-600 bg-danger-50';
      case 'medium': return 'text-warning-600 bg-warning-50';
      case 'low': return 'text-success-600 bg-success-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = () => {
    if (chore.completed) {
      if (needsApproval) return 'border-warning-200 bg-warning-50';
      return 'border-success-200 bg-success-50';
    }
    if (isOverdue) return 'border-danger-200 bg-danger-50';
    if (isDueToday) return 'border-warning-200 bg-warning-50';
    if (swapStatus && swapStatus.status === 'available') return 'border-primary-200 bg-primary-50';
    return 'border-gray-200 bg-white';
  };

  const handleShowComments = () => {
    setShowCommentsModal(true);
  };

  const handleComplete = () => {
    if (!chore.completed) {
      // Mark for approval if approval is required
      markForApproval(chore.id, chore.title);
    }
    onComplete(chore.id, !chore.completed);
  };

  const handleApprove = () => {
    approveChore(chore.id, chore.title, chore.completedBy);
    onComplete(chore.id, true, false); // Keep completed, remove pendingApproval
    setShowApprovalOptions(false);
  };

  const handleReject = () => {
    rejectChore(chore.id, chore.title, chore.completedBy);
    onComplete(chore.id, false); // Mark as incomplete
    setShowApprovalOptions(false);
  };

  const handlePutUpForGrabs = () => {
    putChoreUpForGrabs(chore.id, chore.title);
  };

  const handleCancelSwap = () => {
    cancelSwappableChore(swapStatus.id, chore.id, chore.title);
  };

  const handleClaimChore = () => {
    claimChore(swapStatus.id, chore.id, chore.title);
    // Update the assignee
    onEdit({
      ...chore,
      assignedTo: user.name
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`card card-hover p-4 ${getStatusColor()}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className={`font-semibold text-lg ${
                chore.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {chore.title}
              </h3>
              {chore.priority && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(chore.priority)}`}>
                  {chore.priority}
                </span>
              )}
              {chore.completed && !needsApproval && (
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 flex items-center">
                  <SafeIcon icon={FiTarget} className="w-3 h-3 mr-1" />
                  {points} pts
                </span>
              )}
              {needsApproval && (
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800 flex items-center">
                  <SafeIcon icon={FiAlertTriangle} className="w-3 h-3 mr-1" />
                  Needs approval
                </span>
              )}
              {connected && calendarStatus?.synced && !chore.completed && (
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center">
                  <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                  Synced
                </span>
              )}
              {swapStatus && swapStatus.status === 'available' && (
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 flex items-center">
                  <SafeIcon icon={FiShare} className="w-3 h-3 mr-1" />
                  Up for grabs
                </span>
              )}
            </div>

            {chore.description && (
              <p className="text-gray-600 text-sm mb-3">{chore.description}</p>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {chore.dueDate && (
                <div className="flex items-center">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                  <span className={isOverdue ? 'text-danger-600 font-medium' : ''}>
                    {format(new Date(chore.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {chore.assignedTo && (
                <div className="flex items-center">
                  <SafeIcon icon={FiUser} className="w-4 h-4 mr-1" />
                  <span>Assigned to {chore.assignedTo}</span>
                </div>
              )}
              {chore.recurring && (
                <div className="flex items-center">
                  <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
                  <span>Repeats {chore.recurring}</span>
                </div>
              )}
              {comments.length > 0 && (
                <div 
                  className="flex items-center cursor-pointer hover:text-primary-600"
                  onClick={handleShowComments}
                >
                  <SafeIcon icon={FiMessageSquare} className="w-4 h-4 mr-1" />
                  <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {chore.completed && chore.completedAt && !needsApproval && (
              <div className="mt-2 text-sm text-success-600">
                <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1 inline" />
                Completed on {format(new Date(chore.completedAt), 'MMM d, yyyy')}
              </div>
            )}
            
            {needsApproval && (
              <div className="mt-2 text-sm text-warning-600">
                <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 mr-1 inline" />
                Waiting for approval
              </div>
            )}
            
            {swapStatus && swapStatus.status === 'available' && (
              <div className="mt-2 text-sm text-primary-600">
                <SafeIcon icon={FiShare} className="w-4 h-4 mr-1 inline" />
                Offered by {swapStatus.offeredByName}
                {swapStatus.offeredBy !== user.id && (
                  <button 
                    onClick={handleClaimChore}
                    className="ml-2 px-2 py-0.5 rounded bg-primary-100 hover:bg-primary-200 transition-colors"
                  >
                    Claim it
                  </button>
                )}
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              {/* Different action buttons based on state */}
              {!chore.completed ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleComplete}
                    className="p-2 text-success-600 hover:bg-success-100 rounded-lg transition-colors"
                    title="Mark as complete"
                  >
                    <SafeIcon icon={FiCheck} className="w-5 h-5" />
                  </motion.button>
                  
                  {isAssignedToMe && !swapStatus && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePutUpForGrabs}
                      className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                      title="Put up for grabs"
                    >
                      <SafeIcon icon={FiShare} className="w-5 h-5" />
                    </motion.button>
                  )}
                  
                  {swapStatus && swapStatus.status === 'available' && swapStatus.offeredBy === user.id && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCancelSwap}
                      className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
                      title="Cancel offer"
                    >
                      <SafeIcon icon={FiX} className="w-5 h-5" />
                    </motion.button>
                  )}
                </>
              ) : (
                <>
                  {needsApproval && !isCompletedByMe ? (
                    <>
                      {!showApprovalOptions ? (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowApprovalOptions(true)}
                          className="p-2 text-warning-600 hover:bg-warning-100 rounded-lg transition-colors"
                          title="Approve or reject"
                        >
                          <SafeIcon icon={FiCheckSquare} className="w-5 h-5" />
                        </motion.button>
                      ) : (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleApprove}
                            className="p-2 text-success-600 hover:bg-success-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <SafeIcon icon={FiCheck} className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleReject}
                            className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <SafeIcon icon={FiX} className="w-5 h-5" />
                          </motion.button>
                        </>
                      )}
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleComplete}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Mark as incomplete"
                    >
                      <SafeIcon icon={FiX} className="w-5 h-5" />
                    </motion.button>
                  )}
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShowComments}
                className="p-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                title="Comments"
              >
                <SafeIcon icon={FiMessageSquare} className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(chore)}
                className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                title="Edit chore"
              >
                <SafeIcon icon={FiEdit} className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(chore.id)}
                className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
                title="Delete chore"
              >
                <SafeIcon icon={FiTrash2} className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
      
      <ChoreCommentsModal 
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        choreId={chore.id}
        choreTitle={chore.title}
      />
    </>
  );
};

export default ChoreCard;