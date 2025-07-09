import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import { useAuth } from '../hooks/useAuth';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrophy, FiAward, FiTarget, FiClock, FiTrendingUp, FiCalendar, FiUsers } = FiIcons;

const LeaderboardPage = () => {
  const { user } = useAuth();
  const { 
    leaderboardEnabled, 
    timeFrame, 
    setTimeFrame, 
    getLeaderboardData, 
    getUserRank, 
    getUserPoints 
  } = useLeaderboard();

  const leaderboardData = getLeaderboardData();
  const userRank = getUserRank(user?.id);
  const userPoints = getUserPoints(user?.id);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return { icon: FiTrophy, color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
      case 2: return { icon: FiAward, color: 'text-gray-400', bgColor: 'bg-gray-50' };
      case 3: return { icon: FiAward, color: 'text-amber-600', bgColor: 'bg-amber-50' };
      default: return { icon: FiTarget, color: 'text-primary-600', bgColor: 'bg-primary-50' };
    }
  };

  const getRankBadge = (rank) => {
    const colors = {
      1: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
      2: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',
      3: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
    };
    return colors[rank] || 'bg-gradient-to-r from-primary-500 to-primary-600 text-white';
  };

  if (!leaderboardEnabled) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiTrophy} className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Leaderboard Disabled</h2>
          <p className="text-gray-600">
            The leaderboard feature has been disabled by your household admin.
          </p>
        </div>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <SafeIcon icon={FiTrophy} className="w-8 h-8 mr-3 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-600 mt-1">
            See who's crushing their chores! 🏆
          </p>
        </div>

        {/* Time Frame Toggle */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
          <button
            onClick={() => setTimeFrame('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeFrame === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFrame('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeFrame === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
      </motion.div>

      {/* User's Current Stats */}
      {userRank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Your Current Standing</h2>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <SafeIcon icon={FiTrophy} className="w-5 h-5 mr-2" />
                  <span className="text-2xl font-bold">#{userRank}</span>
                </div>
                <div className="flex items-center">
                  <SafeIcon icon={FiTarget} className="w-5 h-5 mr-2" />
                  <span className="text-2xl font-bold">{userPoints} pts</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary-100 text-sm">
                {timeFrame === 'week' ? 'This Week' : 'This Month'}
              </p>
              <p className="text-xl font-bold">
                {userRank === 1 ? '🏆 Leading!' : userRank <= 3 ? '🥉 Top 3!' : '💪 Keep Going!'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <SafeIcon icon={FiUsers} className="w-5 h-5 mr-2" />
              Rankings - {timeFrame === 'week' ? 'This Week' : 'This Month'}
            </h2>
            <div className="text-sm text-gray-500">
              {leaderboardData.length} participants
            </div>
          </div>
        </div>

        {leaderboardData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiTrophy} className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600">
              Complete some chores to see the leaderboard in action!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaderboardData.map((entry, index) => {
              const rankInfo = getRankIcon(entry.rank);
              const isCurrentUser = entry.userId === user?.id;
              
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    isCurrentUser ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank Badge */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rankInfo.bgColor}`}>
                        {entry.rank <= 3 ? (
                          <span className={`text-lg font-bold ${rankInfo.color}`}>
                            {entry.rank}
                          </span>
                        ) : (
                          <SafeIcon icon={rankInfo.icon} className={`w-5 h-5 ${rankInfo.color}`} />
                        )}
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className={`font-semibold ${isCurrentUser ? 'text-primary-900' : 'text-gray-900'}`}>
                          {entry.name} {isCurrentUser && '(You)'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {entry.choreCount} chores completed
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <div className="flex items-center text-primary-600">
                          <SafeIcon icon={FiTarget} className="w-4 h-4 mr-1" />
                          <span className="font-bold text-lg">{entry.totalPoints}</span>
                        </div>
                        <p className="text-xs text-gray-500">Total Points</p>
                      </div>
                      <div>
                        <div className="flex items-center text-success-600">
                          <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
                          <span className="font-bold">{entry.onTimeRate}%</span>
                        </div>
                        <p className="text-xs text-gray-500">On Time</p>
                      </div>
                      <div>
                        <div className="flex items-center text-secondary-600">
                          <SafeIcon icon={FiTrendingUp} className="w-4 h-4 mr-1" />
                          <span className="font-bold">{entry.averagePoints}</span>
                        </div>
                        <p className="text-xs text-gray-500">Avg Points</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional stats for top 3 */}
                  {entry.rank <= 3 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Recent Performance:</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-success-600">
                            ✅ {entry.onTimeCount} on time
                          </span>
                          <span className="text-warning-600">
                            ⏰ {entry.lateCount} late
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Points System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Points Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Base completion</span>
              <span className="text-sm font-bold text-primary-600">10 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">On-time bonus</span>
              <span className="text-sm font-bold text-success-600">+5 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Early completion</span>
              <span className="text-sm font-bold text-success-600">+2 pts/day</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">High priority</span>
              <span className="text-sm font-bold text-danger-600">×1.5</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Medium priority</span>
              <span className="text-sm font-bold text-warning-600">×1.2</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Late penalty</span>
              <span className="text-sm font-bold text-danger-600">-2 pts/day</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;