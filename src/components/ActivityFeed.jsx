import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useCollaboration } from '../contexts/CollaborationContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiMessageSquare, 
  FiCheck, 
  FiX, 
  FiShare, 
  FiCheckSquare, 
  FiUser,
  FiAlertTriangle,
  FiClock
} = FiIcons;

const ActivityFeed = ({ limit = 5, showHeader = true, className = '' }) => {
  const { getRecentActivities } = useCollaboration();
  
  const activities = getRecentActivities(limit);
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'comment': return FiMessageSquare;
      case 'completed': return FiCheck;
      case 'pending_approval': return FiCheckSquare;
      case 'approved': return FiCheck;
      case 'rejected': return FiX;
      case 'up_for_grabs': return FiShare;
      case 'claimed': return FiShare;
      case 'swap_cancelled': return FiX;
      default: return FiClock;
    }
  };
  
  const getActivityColor = (type) => {
    switch (type) {
      case 'comment': return 'text-secondary-600 bg-secondary-100';
      case 'completed': return 'text-success-600 bg-success-100';
      case 'pending_approval': return 'text-warning-600 bg-warning-100';
      case 'approved': return 'text-success-600 bg-success-100';
      case 'rejected': return 'text-danger-600 bg-danger-100';
      case 'up_for_grabs': return 'text-primary-600 bg-primary-100';
      case 'claimed': return 'text-primary-600 bg-primary-100';
      case 'swap_cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getActivityMessage = (activity) => {
    const { type, userName, data } = activity;
    
    switch (type) {
      case 'comment':
        return `${userName} commented on "${data.choreName}"`;
      case 'completed':
        return `${userName} completed "${data.choreName}"`;
      case 'pending_approval':
        return `${userName} marked "${data.choreName}" as completed, awaiting approval`;
      case 'approved':
        return `${userName} approved "${data.choreName}" completed by ${data.completedBy}`;
      case 'rejected':
        return `${userName} rejected "${data.choreName}" - needs more work`;
      case 'up_for_grabs':
        return `${userName} put "${data.choreName}" up for grabs`;
      case 'claimed':
        return `${userName} claimed "${data.choreName}" from ${data.offeredBy}`;
      case 'swap_cancelled':
        return `${userName} is no longer offering "${data.choreName}"`;
      default:
        return `${userName} did something with "${data.choreName}"`;
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return format(date, 'MMM d, yyyy');
  };
  
  return (
    <div className={`bg-white rounded-2xl shadow-lg ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
      )}
      
      <div className="p-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <SafeIcon icon={FiClock} className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No recent activity.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              const colorClasses = getActivityColor(activity.type);
              
              return (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                    <SafeIcon icon={IconComponent} className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-800">
                          {getActivityMessage(activity)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                      
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {activity.userAvatar ? (
                          <img src={activity.userAvatar} alt={activity.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <SafeIcon icon={FiUser} className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {limit < 20 && (
              <div className="text-center mt-4">
                <Link 
                  to="/activity" 
                  className="text-primary-600 text-sm hover:text-primary-800 hover:underline"
                >
                  View all activity
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;