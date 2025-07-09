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
  // We can't directly use useCalendar here due to circular dependency
  // We'll use a ref for the calendar context later

  const calendarRef = React.useRef(null);

  // Allow setting the calendar context from outside
  const setCalendarContext = (calendarContext) => {
    calendarRef.current = calendarContext;
  };

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

  const addChore = async (choreData) => {
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

    // Sync with calendar if connected
    if (calendarRef.current?.connected && newChore.dueDate) {
      try {
        await calendarRef.current.createCalendarEvent(newChore);
      } catch (error) {
        console.error('Failed to add chore to calendar:', error);
      }
    }

    return newChore;
  };

  const updateChore = async (choreId, updates) => {
    const chore = chores.find(c => c.id === choreId);
    const updatedChore = { ...chore, ...updates };
    
    const updatedChores = chores.map(chore =>
      chore.id === choreId ? updatedChore : chore
    );
    
    saveChores(updatedChores);
    showNotification('Chore updated successfully!', 'success');

    // Sync with calendar if connected
    if (calendarRef.current?.connected && updatedChore.dueDate) {
      try {
        await calendarRef.current.updateCalendarEvent(updatedChore);
      } catch (error) {
        console.error('Failed to update chore in calendar:', error);
      }
    } else if (calendarRef.current?.connected && !updatedChore.dueDate) {
      // If due date was removed, delete from calendar
      try {
        await calendarRef.current.deleteCalendarEvent(choreId);
      } catch (error) {
        console.error('Failed to delete chore from calendar:', error);
      }
    }
  };

  const completeChore = async (choreId) => {
    const chore = chores.find(c => c.id === choreId);
    const updatedChore = {
      ...chore,
      completed: true,
      completedAt: new Date().toISOString(),
      completedBy: user.id,
    };
    
    const updatedChores = chores.map(c =>
      c.id === choreId ? updatedChore : c
    );
    
    saveChores(updatedChores);
    showNotification('Chore completed! Great job! 🎉', 'success');

    // Remove from calendar when completed
    if (calendarRef.current?.connected) {
      try {
        await calendarRef.current.deleteCalendarEvent(choreId);
      } catch (error) {
        console.error('Failed to delete completed chore from calendar:', error);
      }
    }
  };

  const uncompleteChore = async (choreId) => {
    const chore = chores.find(c => c.id === choreId);
    const updatedChore = {
      ...chore,
      completed: false,
      completedAt: null,
      completedBy: null,
    };
    
    const updatedChores = chores.map(c =>
      c.id === choreId ? updatedChore : c
    );
    
    saveChores(updatedChores);
    showNotification('Chore marked as incomplete', 'info');

    // Add back to calendar if it has a due date
    if (calendarRef.current?.connected && updatedChore.dueDate) {
      try {
        await calendarRef.current.createCalendarEvent(updatedChore);
      } catch (error) {
        console.error('Failed to add chore back to calendar:', error);
      }
    }
  };

  const deleteChore = async (choreId) => {
    const updatedChores = chores.filter(chore => chore.id !== choreId);
    saveChores(updatedChores);
    showNotification('Chore deleted', 'info');

    // Remove from calendar
    if (calendarRef.current?.connected) {
      try {
        await calendarRef.current.deleteCalendarEvent(choreId);
      } catch (error) {
        console.error('Failed to delete chore from calendar:', error);
      }
    }
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
    setCalendarContext,
  };

  return (
    <ChoreContext.Provider value={value}>
      {children}
    </ChoreContext.Provider>
  );
};

export default ChoreProvider;