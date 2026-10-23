import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { ScrollProgressBar } from './components/ScrollReveal';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import AIPredictions from './pages/AIPredictions';
import EnergyMonitoring from './pages/EnergyMonitoring';
import HistoricalAnalysis from './pages/HistoricalAnalysis';
import AlertsCenter from './pages/AlertsCenter';
import SimulationControl from './pages/SimulationControl';
import HVACUnits from './pages/HVACUnits';
import Settings from './pages/Settings';
import SystemInfo from './pages/SystemInfo';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <DataProvider>
            <div className="min-h-screen transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
              <ScrollProgressBar />
              <Navbar />
              <main className="py-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Routes>
                  {/* Public Landing & Authentication */}
                  <Route path="/welcome" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Operational Routes: 4 Primary Core Pages */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/devices" element={
                    <ProtectedRoute>
                      <HVACUnits />
                    </ProtectedRoute>
                  } />
                  <Route path="/recommendations" element={
                    <ProtectedRoute>
                      <AIPredictions />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />

                  {/* Backward-compatibility aliases */}
                  <Route path="/units" element={<Navigate to="/devices" replace />} />
                  <Route path="/ai" element={<Navigate to="/recommendations" replace />} />
                  <Route path="/live" element={<Navigate to="/" replace />} />
                  <Route path="/energy" element={<Navigate to="/" replace />} />
                  <Route path="/alerts" element={<Navigate to="/" replace />} />
                  <Route path="/simulation" element={<Navigate to="/settings" replace />} />
                  <Route path="/system" element={<Navigate to="/settings" replace />} />

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/welcome" replace />} />
                </Routes>
              </main>
            </div>
          </DataProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
