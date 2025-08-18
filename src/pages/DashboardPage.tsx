import React, { useState, useEffect } from 'react';
import StatisticsOverview from '../components/StatisticsOverview';
import StatisticsCharts from '../components/StatisticsCharts';
import StatisticsFilters from '../components/StatisticsFilters';
import StatisticsExport from '../components/StatisticsExport';
import RecentEntries from '../components/RecentEntries';
import { Statistics } from '../types/Statistics';
import { statisticsService } from '../services/statisticsService';

const DashboardPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    label: '',
    from: '',
    to: ''
  });

  useEffect(() => {
    loadStatistics();
    const interval = setInterval(loadStatistics, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [filters]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const data = await statisticsService.getStatistics(filters);
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (isLoading && !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">
            Monitor data processing statistics and label distribution in real-time.
          </p>
        </div>
        {statistics && <StatisticsExport statistics={statistics} />}
      </div>

      <StatisticsFilters
        filters={filters}
        availableLabels={statistics ? Object.keys(statistics.labelCounts) : []}
        onFiltersChange={handleFiltersChange}
      />

      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <StatisticsOverview statistics={statistics} />
            <StatisticsCharts statistics={statistics} />
          </div>
          <div>
            <RecentEntries entries={statistics.recentEntries || []} />
          </div>
        </div>
      )}

      {isLoading && statistics && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Refreshing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;