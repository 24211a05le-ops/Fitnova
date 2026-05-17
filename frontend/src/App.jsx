import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { PredictionProvider } from './context/PredictionContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <PredictionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PredictionProvider>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;