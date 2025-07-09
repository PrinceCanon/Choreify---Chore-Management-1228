import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { useChores } from './contexts/ChoreContext';
import { useCalendar } from './contexts/CalendarContext';

// This component resolves circular dependency between ChoreContext and CalendarContext
const ContextBridge = () => {
  const choreContext = useChores();
  const calendarContext = useCalendar();
  
  useEffect(() => {
    // Allow ChoreContext to access CalendarContext methods
    choreContext.setCalendarContext(calendarContext);
  }, [choreContext, calendarContext]);
  
  return null;
};

// Wrap App with ContextBridge
const AppWithContextBridge = () => {
  return (
    <React.StrictMode>
      <App />
      <ContextBridge />
    </React.StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<AppWithContextBridge />);