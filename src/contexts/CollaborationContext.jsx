import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CollaborationContext = createContext();

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

const CollaborationProvider = ({ children }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [swappableChores, setSwappableChores] = useState([]);
  
  // Load data from localStorage
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  const loadData = () => {
    const savedComments = localStorage.getItem('choreify_comments');
    const savedActivities = localStorage.getItem('choreify_activities');
    const savedSwappableChores = localStorage.getItem('choreify_swappable_chores');
    
    if (savedComments) setComments(JSON.parse(savedComments));
    if (savedActivities) setActivities(JSON.parse(savedActivities));
    if (savedSwappableChores) setSwappableChores(JSON.parse(savedSwappableChores));
  };
  
  // Save data to localStorage
  const saveComments = (updatedComments) => {
    setComments(updatedComments);
    localStorage.setItem('choreify_comments', JSON.stringify(updatedComments));
  };
  
  const saveActivities = (updatedActivities) => {
    setActivities(updatedActivities);
    localStorage.setItem('choreify_activities', JSON.stringify(updatedActivities));
  };
  
  const saveSwappableChores = (updatedSwappableChores) => {
    setSwappableChores(updatedSwappableChores);
    localStorage.setItem('choreify_swappable_chores', JSON.stringify(updatedSwappableChores));
  };
  
  // Comment functions
  const addComment = (choreId, text, choreName = null) => {
    if (!text.trim()) return null;
    
    const newComment = {
      id: uuidv4(),
      choreId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text,
      timestamp: new Date().toISOString(),
    };
    
    const updatedComments = [...comments, newComment];
    saveComments(updatedComments);
    
    // Add to activity feed with proper chore name
    addActivity('comment', {
      choreId,
      choreName: choreName || choreId, // Use choreName if provided, fallback to choreId
      commentId: newComment.id,
      userName: user.name,
    });
    
    return newComment;
  };
  
  const updateComment = (commentId, text) => {
    const updatedComments = comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, text, edited: true, editedAt: new Date().toISOString() } 
        : comment
    );
    
    saveComments(updatedComments);
    return updatedComments.find(comment => comment.id === commentId);
  };
  
  const deleteComment = (commentId) => {
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    saveComments(updatedComments);
  };
  
  const getCommentsByChoreId = (choreId) => {
    return comments.filter(comment => comment.choreId === choreId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };
  
  // Chore approval functions
  const markForApproval = (choreId, choreName) => {
    // Add to activity feed
    addActivity('pending_approval', {
      choreId,
      choreName,
      userName: user.name,
    });
    
    showNotification('Chore marked as completed, awaiting approval', 'info');
    return true;
  };
  
  const approveChore = (choreId, choreName, completedBy) => {
    // Add to activity feed
    addActivity('approved', {
      choreId,
      choreName,
      userName: user.name,
      completedBy,
    });
    
    showNotification('Chore approved successfully', 'success');
    return true;
  };
  
  const rejectChore = (choreId, choreName, completedBy) => {
    // Add to activity feed
    addActivity('rejected', {
      choreId,
      choreName,
      userName: user.name,
      completedBy,
    });
    
    showNotification('Chore marked as incomplete, needs more work', 'warning');
    return true;
  };
  
  // Chore swapping functions
  const putChoreUpForGrabs = (choreId, choreName) => {
    const isAlreadySwappable = swappableChores.some(chore => chore.choreId === choreId);
    
    if (isAlreadySwappable) {
      return false;
    }
    
    const swappableChore = {
      id: uuidv4(),
      choreId,
      choreName,
      offeredBy: user.id,
      offeredByName: user.name,
      offeredAt: new Date().toISOString(),
      status: 'available', // available, claimed, cancelled
    };
    
    const updatedSwappableChores = [...swappableChores, swappableChore];
    saveSwappableChores(updatedSwappableChores);
    
    // Add to activity feed
    addActivity('up_for_grabs', {
      choreId,
      choreName,
      userName: user.name,
    });
    
    showNotification(`"${choreName}" is now up for grabs`, 'info');
    return swappableChore;
  };
  
  const claimChore = (swappableId, choreId, choreName) => {
    const updatedSwappableChores = swappableChores.map(chore => 
      chore.id === swappableId 
        ? { 
            ...chore, 
            status: 'claimed',
            claimedBy: user.id,
            claimedByName: user.name,
            claimedAt: new Date().toISOString()
          } 
        : chore
    );
    
    saveSwappableChores(updatedSwappableChores);
    
    // Add to activity feed
    addActivity('claimed', {
      choreId,
      choreName,
      userName: user.name,
      offeredBy: swappableChores.find(chore => chore.id === swappableId)?.offeredByName,
    });
    
    showNotification(`You claimed "${choreName}"`, 'success');
    return updatedSwappableChores.find(chore => chore.id === swappableId);
  };
  
  const cancelSwappableChore = (swappableId, choreId, choreName) => {
    const updatedSwappableChores = swappableChores.map(chore => 
      chore.id === swappableId 
        ? { 
            ...chore, 
            status: 'cancelled',
            cancelledAt: new Date().toISOString()
          } 
        : chore
    );
    
    saveSwappableChores(updatedSwappableChores);
    
    // Add to activity feed
    addActivity('swap_cancelled', {
      choreId,
      choreName,
      userName: user.name,
    });
    
    showNotification(`"${choreName}" is no longer up for grabs`, 'info');
    return true;
  };
  
  const getChoreSwapStatus = (choreId) => {
    // Find the most recent entry for this chore that's not cancelled
    const swappableChore = [...swappableChores]
      .filter(chore => chore.choreId === choreId && chore.status !== 'cancelled')
      .sort((a, b) => new Date(b.offeredAt) - new Date(a.offeredAt))[0];
    
    return swappableChore || null;
  };
  
  const getAvailableChores = () => {
    return swappableChores.filter(chore => chore.status === 'available')
      .sort((a, b) => new Date(b.offeredAt) - new Date(a.offeredAt));
  };
  
  // Activity feed functions
  const addActivity = (type, data) => {
    const newActivity = {
      id: uuidv4(),
      type, // comment, completed, up_for_grabs, claimed, approved, rejected, pending_approval, etc.
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      data,
      timestamp: new Date().toISOString(),
    };
    
    const updatedActivities = [newActivity, ...activities].slice(0, 100); // Keep only the latest 100 activities
    saveActivities(updatedActivities);
    
    return newActivity;
  };
  
  const getRecentActivities = (limit = 20) => {
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  };
  
  const value = {
    // Comments
    comments,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByChoreId,
    
    // Approval
    markForApproval,
    approveChore,
    rejectChore,
    
    // Swapping
    putChoreUpForGrabs,
    claimChore,
    cancelSwappableChore,
    getChoreSwapStatus,
    getAvailableChores,
    
    // Activity Feed
    addActivity,
    getRecentActivities,
  };
  
  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export default CollaborationProvider;