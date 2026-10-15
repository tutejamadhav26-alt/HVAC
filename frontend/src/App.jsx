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
            <div className="min-h-screen transition-colors duration-200 selection:bg-blue-500 selection:text-white">
              <ScrollProgressBar />
              <Navbar />
              <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Routes>
                  {/* Public Landing & Authentication */}
                  <Route path="/welcome" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Operational Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/live" element={
                    <ProtectedRoute>
                      <LiveMonitoring />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai" element={
                    <ProtectedRoute>
                      <AIPredictions />
                    </ProtectedRoute>
                  } />
                  <Route path="/energy" element={
                    <ProtectedRoute>
                      <EnergyMonitoring />
                    </ProtectedRoute>
                  } />
                  <Route path="/history" element={
                    <ProtectedRoute>
                      <HistoricalAnalysis />
                    </ProtectedRoute>
                  } />
                  <Route path="/alerts" element={
                    <ProtectedRoute>
                      <AlertsCenter />
                    </ProtectedRoute>
                  } />
                  <Route path="/simulation" element={
                    <ProtectedRoute allowedRoles={['admin', 'technician', 'staff']}>
                      <SimulationControl />
                    </ProtectedRoute>
                  } />
                  <Route path="/units" element={
                    <ProtectedRoute>
                      <HVACUnits />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/system" element={
                    <ProtectedRoute>
                      <SystemInfo />
                    </ProtectedRoute>
                  } />

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
