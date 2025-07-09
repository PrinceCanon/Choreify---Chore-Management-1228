import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const ChoreContext = createContext();

export const useChores = () => {
  const context = useContext(ChoreContext);
  if (!context) {
    throw new Error('useChores must be used within a ChoreProvider');
  }
  return context;
};

const ChoreProvider = ({ children }) => {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      loadChores();
    }
  }, [user]);

  const loadChores = () => {
    const savedChores = localStorage.getItem('choreify_chores');
    if (savedChores) {
      setChores(JSON.parse(savedChores));
    }
  };

  const saveChores = (updatedChores) => {
    setChores(updatedChores);
    localStorage.setItem('choreify_chores', JSON.stringify(updatedChores));
  };

  const addChore = (choreData) => {
    const newChore = {
      id: uuidv4(),
      ...choreData,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      completedBy: null,
    };

    const updatedChores = [...chores, newChore];
    saveChores(updatedChores);
    showNotification('Chore added successfully!', 'success');
    return newChore;
  };

  const updateChore = (choreId, updates) => {
    const updatedChores = chores.map(chore =>
      chore.id === choreId ? { ...chore, ...updates } : chore
    );
    saveChores(updatedChores);
    showNotification('Chore updated successfully!', 'success');
  };

  const completeChore = (choreId) => {
    const updatedChores = chores.map(chore =>
      chore.id === choreId ? {
        ...chore,
        completed: true,
        completedAt: new Date().toISOString(),
        completedBy: user.id,
      } : chore
    );
    saveChores(updatedChores);
    showNotification('Chore completed! Great job! 🎉', 'success');
  };

  const uncompleteChore = (choreId) => {
    const updatedChores = chores.map(chore =>
      chore.id === choreId ? {
        ...chore,
        completed: false,
        completedAt: null,
        completedBy: null,
      } : chore
    );
    saveChores(updatedChores);
    showNotification('Chore marked as incomplete', 'info');
  };

  const deleteChore = (choreId) => {
    const updatedChores = chores.filter(chore => chore.id !== choreId);
    saveChores(updatedChores);
    showNotification('Chore deleted', 'info');
  };

  const getChoresByStatus = (completed = false) => {
    return chores.filter(chore => chore.completed === completed);
  };

  const getChoresByAssignee = (assigneeId) => {
    return chores.filter(chore => chore.assignedTo === assigneeId);
  };

  const getOverdueChores = () => {
    const now = new Date();
    return chores.filter(chore =>
      !chore.completed &&
      chore.dueDate &&
      new Date(chore.dueDate) < now
    );
  };

  const getTodaysChores = () => {
    const today = new Date().toDateString();
    return chores.filter(chore =>
      !chore.completed &&
      chore.dueDate &&
      new Date(chore.dueDate).toDateString() === today
    );
  };

  const value = {
    chores,
    loading,
    addChore,
    updateChore,
    completeChore,
    uncompleteChore,
    deleteChore,
    getChoresByStatus,
    getChoresByAssignee,
    getOverdueChores,
    getTodaysChores,
  };

  return (
    <ChoreContext.Provider value={value}>
      {children}
    </ChoreContext.Provider>
  );
};

export default ChoreProvider;