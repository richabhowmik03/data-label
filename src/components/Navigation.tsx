import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, BarChart3, Zap, Moon, Sun } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  isDarkMode, 
  onToggleDarkMode 
}) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`shadow-sm border-b transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <h1 className={`text-xl font-bold transition-colors duration-200 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Advanced Data Labeling Engine
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link
              to="/configuration"
              onClick={() => onTabChange('configuration')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive('/configuration')
                  ? isDarkMode 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-blue-100 text-blue-700'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Configuration</span>
            </Link>
            
            <Link
              to="/dashboard"
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive('/dashboard')
                  ? isDarkMode 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-blue-100 text-blue-700'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;