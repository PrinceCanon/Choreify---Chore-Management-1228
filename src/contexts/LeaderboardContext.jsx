import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useChores } from './ChoreContext';

const LeaderboardContext = createContext();

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};

const LeaderboardProvider = ({ children }) => {
  const { user } = useAuth();
  const { chores } = useChores();
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [timeFrame, setTimeFrame] = useState('week'); // 'week' or 'month'

  useEffect(() => {
    // Load leaderboard settings from localStorage
    const savedSettings = localStorage.getItem('choreify_leaderboard_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setLeaderboardEnabled(settings.enabled);
    }
  }, []);

  const saveLeaderboardSettings = (enabled) => {
    setLeaderboardEnabled(enabled);
    localStorage.setItem('choreify_leaderboard_settings', JSON.stringify({ enabled }));
  };

  const calculatePoints = (chore) => {
    if (!chore.completed) return 0;

    let basePoints = 10; // Base points for completing a chore
    
    // Priority multiplier
    const priorityMultiplier = {
      'high': 1.5,
      'medium': 1.2,
      'low': 1.0
    };
    
    basePoints *= priorityMultiplier[chore.priority] || 1.0;

    // On-time bonus
    if (chore.dueDate && chore.completedAt) {
      const dueDate = new Date(chore.dueDate);
      const completedDate = new Date(chore.completedAt);
      
      if (completedDate <= dueDate) {
        basePoints += 5; // On-time bonus
      } else {
        // Late penalty (but still get base points)
        const daysLate = Math.ceil((completedDate - dueDate) / (1000 * 60 * 60 * 24));
        basePoints = Math.max(basePoints - (daysLate * 2), 5); // Minimum 5 points
      }
    }

    // Early completion bonus
    if (chore.dueDate && chore.completedAt) {
      const dueDate = new Date(chore.dueDate);
      const completedDate = new Date(chore.completedAt);
      const daysEarly = Math.ceil((dueDate - completedDate) / (1000 * 60 * 60 * 24));
      
      if (daysEarly > 0) {
        basePoints += Math.min(daysEarly * 2, 10); // Max 10 bonus points for early completion
      }
    }

    return Math.round(basePoints);
  };

  const getTimeFrameFilter = () => {
    const now = new Date();
    let startDate;

    if (timeFrame === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }

    return startDate;
  };

  const getLeaderboardData = () => {
    if (!leaderboardEnabled) return [];

    const startDate = getTimeFrameFilter();
    const filteredChores = chores.filter(chore => 
      chore.completed && 
      chore.completedAt && 
      new Date(chore.completedAt) >= startDate
    );

    // Group chores by user
    const userStats = {};
    
    filteredChores.forEach(chore => {
      const userId = chore.completedBy;
      const assignedTo = chore.assignedTo;
      
      if (!userId || !assignedTo) return;

      if (!userStats[userId]) {
        userStats[userId] = {
          userId,
          name: assignedTo,
          totalPoints: 0,
          choreCount: 0,
          onTimeCount: 0,
          lateCount: 0,
          averagePoints: 0,
          chores: []
        };
      }

      const points = calculatePoints(chore);
      userStats[userId].totalPoints += points;
      userStats[userId].choreCount += 1;
      userStats[userId].chores.push({ ...chore, points });

      // Track on-time vs late
      if (chore.dueDate) {
        const dueDate = new Date(chore.dueDate);
        const completedDate = new Date(chore.completedAt);
        
        if (completedDate <= dueDate) {
          userStats[userId].onTimeCount += 1;
        } else {
          userStats[userId].lateCount += 1;
        }
      }
    });

    // Calculate averages and sort by points
    const leaderboard = Object.values(userStats)
      .map(user => ({
        ...user,
        averagePoints: user.choreCount > 0 ? Math.round(user.totalPoints / user.choreCount) : 0,
        onTimeRate: user.choreCount > 0 ? Math.round((user.onTimeCount / user.choreCount) * 100) : 0
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));

    return leaderboard;
  };

  const getUserRank = (userId) => {
    const leaderboard = getLeaderboardData();
    const userEntry = leaderboard.find(entry => entry.userId === userId);
    return userEntry ? userEntry.rank : null;
  };

  const getUserPoints = (userId) => {
    const leaderboard = getLeaderboardData();
    const userEntry = leaderboard.find(entry => entry.userId === userId);
    return userEntry ? userEntry.totalPoints : 0;
  };

  const getPointsForChore = (chore) => {
    return calculatePoints(chore);
  };

  const value = {
    leaderboardEnabled,
    timeFrame,
    setTimeFrame,
    saveLeaderboardSettings,
    getLeaderboardData,
    getUserRank,
    getUserPoints,
    getPointsForChore,
    calculatePoints
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export default LeaderboardProvider;