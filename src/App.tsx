import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import ConfigurationPage from './pages/ConfigurationPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [activeTab, setActiveTab] = useState('configuration');
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Navigate to="/configuration" replace />} />
            <Route path="/configuration" element={<ConfigurationPage isDarkMode={isDarkMode} />} />
            <Route path="/dashboard" element={<DashboardPage isDarkMode={isDarkMode} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;