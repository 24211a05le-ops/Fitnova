import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
