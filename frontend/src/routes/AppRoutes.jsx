import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/Dashboard';
import WorkoutTracker from '../pages/WorkoutTracker';
import Analytics from '../pages/Analytics';
import DietPlanner from '../pages/DietPlanner';
import ProgressTracker from '../pages/ProgressTracker';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Goals from '../pages/Goals';
import ExerciseLibrary from '../pages/ExerciseLibrary';
import AIRecommendations from '../pages/AIRecommendations';
import Reports from '../pages/Reports';
import Notifications from '../pages/Notifications';
import Attendance from '../pages/Attendance';
import AdminPanel from '../pages/AdminPanel';

import Layout from '../components/Layout';

// Loading Spinner for route transitions
const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 border-4 border-green-500/10 border-t-green-500 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">
        Fitnova Security Loading...
      </p>
    </div>
  </div>
);

// Reusable Protected Route Component
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect unauthorized users to login
    return <Navigate to="/login" replace />;
  }

  // Onboarding Redirection Logic
  if (!user.is_onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  if (user.is_onboarded && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  // Role verification (e.g. admin restricted views) - default to 'user' if not specified
  const userRole = user.role || 'user';
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Wrap in global layout with responsive navbar/sidebar
  return <Layout>{children}</Layout>;
};

// Reusable Public Route Component (redirects to dashboard if already authenticated)
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />

      {/* Protected routes */}
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/workouts" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <WorkoutTracker />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/exercises" 
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <ExerciseLibrary />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/ai-coach" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <AIRecommendations />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Analytics />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/diet" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <DietPlanner />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/progress" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <ProgressTracker />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/goals" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Goals />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/attendance" 
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Attendance />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/reports" 
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Reports />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Notifications />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Profile />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/settings" 
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Settings />
          </ProtectedRoute>
        } 
      />

      {/* Admin Protected Console */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all fallback redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
