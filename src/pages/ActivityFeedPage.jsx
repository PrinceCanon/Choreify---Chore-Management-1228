import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCollaboration } from '../contexts/CollaborationContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ActivityFeed from '../components/ActivityFeed';

const { FiActivity, FiFilter } = FiIcons;

const ActivityFeedPage = () => {
  const [filter, setFilter] = useState('all');
  
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <SafeIcon icon={FiActivity} className="w-8 h-8 mr-3 text-primary-600" />
            Activity Feed
          </h1>
          <p className="text-gray-600 mt-1">
            See what's happening in your household
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-400" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Activity</option>
            <option value="comments">Comments</option>
            <option value="completion">Completions</option>
            <option value="approvals">Approvals</option>
            <option value="swaps">Chore Swaps</option>
          </select>
        </div>
      </motion.div>
      
      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ActivityFeed limit={50} showHeader={false} />
      </motion.div>
    </div>
  );
};

export default ActivityFeedPage;