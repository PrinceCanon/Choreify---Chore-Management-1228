import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthProvider from './contexts/AuthContext';
import ChoreProvider from './contexts/ChoreContext';
import NotificationProvider from './contexts/NotificationContext';
import LeaderboardProvider from './contexts/LeaderboardContext';
import CalendarProvider from './contexts/CalendarContext';
import CollaborationProvider from './contexts/CollaborationContext';
import CategoryProvider from './contexts/CategoryContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import HouseholdPage from './pages/HouseholdPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import CalendarAuthPage from './pages/CalendarAuthPage';
import ActivityFeedPage from './pages/ActivityFeedPage';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="large" />
          <motion.h1
            className="text-4xl font-bold text-primary-600 mt-6 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Choreify
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Making chores fun and easy
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/household"
            element={
              user ? (
                <Layout>
                  <HouseholdPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/leaderboard"
            element={
              user ? (
                <Layout>
                  <LeaderboardPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user ? (
                <Layout>
                  <ProfilePage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/calendar-auth"
            element={
              user ? (
                <Layout>
                  <CalendarAuthPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/activity"
            element={
              user ? (
                <Layout>
                  <ActivityFeedPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CategoryProvider>
          <ChoreProvider>
            <LeaderboardProvider>
              <CalendarProvider>
                <CollaborationProvider>
                  <AppContent />
                </CollaborationProvider>
              </CalendarProvider>
            </LeaderboardProvider>
          </ChoreProvider>
        </CategoryProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;