import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import { ScrollProgressBar } from './components/ScrollReveal';

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
      <BrowserRouter>
        <DataProvider>
          <div className="min-h-screen transition-colors duration-200 selection:bg-blue-500 selection:text-white">
            <ScrollProgressBar />
            <Navbar />
            <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/live" element={<LiveMonitoring />} />
                <Route path="/ai" element={<AIPredictions />} />
                <Route path="/energy" element={<EnergyMonitoring />} />
                <Route path="/history" element={<HistoricalAnalysis />} />
                <Route path="/alerts" element={<AlertsCenter />} />
                <Route path="/simulation" element={<SimulationControl />} />
                <Route path="/units" element={<HVACUnits />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/system" element={<SystemInfo />} />
              </Routes>
            </main>
          </div>
        </DataProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
