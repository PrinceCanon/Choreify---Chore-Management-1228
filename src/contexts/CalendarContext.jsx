import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useChores } from './ChoreContext';
import { useNotification } from './NotificationContext';

const CalendarContext = createContext();

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

const CalendarProvider = ({ children }) => {
  const { user } = useAuth();
  const { chores } = useChores();
  const { showNotification } = useNotification();
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(null); // 'google', 'apple', etc.
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [syncedChores, setSyncedChores] = useState([]);

  useEffect(() => {
    if (user) {
      loadCalendarSettings();
    }
  }, [user]);

  useEffect(() => {
    // When chores change and we're connected, sync changes
    if (connected && chores.length > 0) {
      syncChoresWithCalendar();
    }
  }, [chores, connected]);

  const loadCalendarSettings = () => {
    const savedSettings = localStorage.getItem('choreify_calendar_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setConnected(settings.connected);
      setProvider(settings.provider);
      setLastSynced(settings.lastSynced);
      setSyncedChores(settings.syncedChores || []);
    }
  };

  const saveCalendarSettings = (settings) => {
    localStorage.setItem('choreify_calendar_settings', JSON.stringify({
      connected: settings.connected !== undefined ? settings.connected : connected,
      provider: settings.provider || provider,
      lastSynced: settings.lastSynced || lastSynced,
      syncedChores: settings.syncedChores || syncedChores
    }));
  };

  // Connect to a calendar provider
  const connectCalendar = async (selectedProvider, authCode) => {
    setSyncing(true);
    try {
      // In a real implementation, we would exchange the auth code for tokens
      // For demo purposes, we'll simulate a successful connection
      await simulateApiCall();
      
      setConnected(true);
      setProvider(selectedProvider);
      setLastSynced(new Date().toISOString());
      
      saveCalendarSettings({
        connected: true,
        provider: selectedProvider,
        lastSynced: new Date().toISOString()
      });
      
      showNotification(`Successfully connected to ${formatProviderName(selectedProvider)} Calendar`, 'success');
      
      // Do initial sync
      await syncChoresWithCalendar();
      return true;
    } catch (error) {
      showNotification(`Failed to connect to calendar: ${error.message}`, 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Disconnect from calendar
  const disconnectCalendar = async () => {
    setSyncing(true);
    try {
      // In real implementation, revoke access tokens
      await simulateApiCall();
      
      setConnected(false);
      setProvider(null);
      setSyncedChores([]);
      
      saveCalendarSettings({
        connected: false,
        provider: null,
        syncedChores: []
      });
      
      showNotification('Calendar disconnected successfully', 'info');
      return true;
    } catch (error) {
      showNotification(`Failed to disconnect calendar: ${error.message}`, 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Sync chores with calendar
  const syncChoresWithCalendar = async (force = false) => {
    if (!connected) return false;
    
    setSyncing(true);
    try {
      // Get chores with due dates that need to be synced
      const choresToSync = chores.filter(chore => chore.dueDate);
      
      // For demo, simulate API calls
      await simulateApiCall();
      
      // In a real implementation, we would:
      // 1. Find chores that need to be created in calendar
      // 2. Find chores that need to be updated in calendar
      // 3. Find chores that need to be deleted from calendar
      
      // Track which chores are synced
      const newSyncedChores = choresToSync.map(chore => ({
        choreId: chore.id,
        calendarEventId: `cal_${chore.id}`, // In real impl, this would be returned from the calendar API
        lastSynced: new Date().toISOString(),
        title: chore.title,
        dueDate: chore.dueDate
      }));
      
      setSyncedChores(newSyncedChores);
      setLastSynced(new Date().toISOString());
      
      saveCalendarSettings({
        lastSynced: new Date().toISOString(),
        syncedChores: newSyncedChores
      });
      
      showNotification('Chores synchronized with calendar', 'success');
      return true;
    } catch (error) {
      showNotification(`Failed to sync with calendar: ${error.message}`, 'error');
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Create calendar event for a chore
  const createCalendarEvent = async (chore) => {
    if (!connected || !chore.dueDate) return null;
    
    try {
      // In real implementation, call calendar API
      await simulateApiCall();
      
      // Create event in calendar
      const eventDetails = formatChoreForCalendar(chore);
      
      // Simulate a response from calendar API with an event ID
      const calendarEventId = `cal_${chore.id}`;
      
      // Add to synced chores
      const newSyncedChores = [...syncedChores, {
        choreId: chore.id,
        calendarEventId,
        lastSynced: new Date().toISOString(),
        title: chore.title,
        dueDate: chore.dueDate
      }];
      
      setSyncedChores(newSyncedChores);
      saveCalendarSettings({ syncedChores: newSyncedChores });
      
      return calendarEventId;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return null;
    }
  };

  // Update calendar event for a chore
  const updateCalendarEvent = async (chore) => {
    if (!connected) return false;
    
    try {
      const syncedChore = syncedChores.find(sc => sc.choreId === chore.id);
      if (!syncedChore) return await createCalendarEvent(chore);
      
      // In real implementation, call calendar API
      await simulateApiCall();
      
      // Update event in calendar
      const eventDetails = formatChoreForCalendar(chore);
      
      // Update synced chores
      const newSyncedChores = syncedChores.map(sc => 
        sc.choreId === chore.id 
          ? {
              ...sc,
              lastSynced: new Date().toISOString(),
              title: chore.title,
              dueDate: chore.dueDate
            }
          : sc
      );
      
      setSyncedChores(newSyncedChores);
      saveCalendarSettings({ syncedChores: newSyncedChores });
      
      return true;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      return false;
    }
  };

  // Delete calendar event for a chore
  const deleteCalendarEvent = async (choreId) => {
    if (!connected) return false;
    
    try {
      const syncedChore = syncedChores.find(sc => sc.choreId === choreId);
      if (!syncedChore) return true; // Nothing to delete
      
      // In real implementation, call calendar API
      await simulateApiCall();
      
      // Update synced chores
      const newSyncedChores = syncedChores.filter(sc => sc.choreId !== choreId);
      
      setSyncedChores(newSyncedChores);
      saveCalendarSettings({ syncedChores: newSyncedChores });
      
      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      return false;
    }
  };

  // Format chore data for calendar event
  const formatChoreForCalendar = (chore) => {
    const dueDate = new Date(chore.dueDate);
    
    // For all-day events, end date should be the next day in calendar APIs
    const endDate = new Date(dueDate);
    endDate.setDate(endDate.getDate() + 1);
    
    // Create URL back to the app
    const appUrl = `${window.location.origin}/#/dashboard?chore=${chore.id}`;
    
    return {
      summary: `[Choreify] ${chore.title}`,
      description: `${chore.description || ''}\n\nPriority: ${chore.priority || 'Normal'}\n${chore.assignedTo ? `Assigned to: ${chore.assignedTo}` : ''}\n\nView in Choreify: ${appUrl}`,
      start: {
        date: dueDate.toISOString().split('T')[0], // YYYY-MM-DD
      },
      end: {
        date: endDate.toISOString().split('T')[0], // YYYY-MM-DD
      },
      allDay: true,
      colorId: getColorIdForPriority(chore.priority),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 * 24 } // 1 day before
        ],
      }
    };
  };

  // Helper functions
  const simulateApiCall = () => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const formatProviderName = (provider) => {
    if (!provider) return '';
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  const getColorIdForPriority = (priority) => {
    // Color IDs for Google Calendar API - would be different for other providers
    switch (priority) {
      case 'high': return '4'; // Red
      case 'medium': return '5'; // Yellow
      case 'low': return '2'; // Green
      default: return '1'; // Blue
    }
  };

  const getChoreCalendarStatus = (choreId) => {
    const syncedChore = syncedChores.find(sc => sc.choreId === choreId);
    return {
      synced: !!syncedChore,
      lastSynced: syncedChore?.lastSynced || null,
      calendarEventId: syncedChore?.calendarEventId || null
    };
  };

  // Authorize with Google Calendar
  const authorizeWithGoogle = () => {
    const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Would be set in real implementation
    const redirectUri = `${window.location.origin}/#/calendar-auth`;
    const scope = 'https://www.googleapis.com/auth/calendar';
    const responseType = 'code';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}&access_type=offline&prompt=consent`;
    
    // In real implementation, open this URL and handle the auth code callback
    // For demo, we'll simulate it
    simulateAuthCallback('google');
  };

  // Authorize with Apple Calendar
  const authorizeWithApple = () => {
    // Apple uses a different auth flow
    // For demo, we'll simulate it
    simulateAuthCallback('apple');
  };

  // Simulate auth callback
  const simulateAuthCallback = (provider) => {
    showNotification(`Simulating authentication with ${formatProviderName(provider)} Calendar...`, 'info');
    setTimeout(() => {
      connectCalendar(provider, 'simulated_auth_code');
    }, 1500);
  };

  const value = {
    connected,
    provider,
    syncing,
    lastSynced,
    syncedChores,
    connectCalendar,
    disconnectCalendar,
    syncChoresWithCalendar,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getChoreCalendarStatus,
    authorizeWithGoogle,
    authorizeWithApple,
    formatProviderName
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export default CalendarProvider;