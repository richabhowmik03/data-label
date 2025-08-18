import React from 'react';
import { Activity, Tag, Clock, TrendingUp } from 'lucide-react';
import { Statistics } from '../types/Statistics';

interface StatisticsOverviewProps {
  statistics: Statistics;
}

const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({ statistics }) => {
  const totalLabels = Object.keys(statistics.labelCounts).length;
  const mostFrequentLabel = Object.entries(statistics.labelCounts).reduce(
    (max, [label, count]) => (count > max.count ? { label, count } : max),
    { label: '', count: 0 }
  );

  const cards = [
    {
      title: 'Total Processed',
      value: statistics.totalProcessed.toLocaleString(),
      icon: Activity,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Unique Labels',
      value: totalLabels.toString(),
      icon: Tag,
      color: 'green',
      change: '+3%'
    },
    {
      title: 'Most Frequent',
      value: mostFrequentLabel.label || 'N/A',
      subtitle: mostFrequentLabel.count > 0 ? `${mostFrequentLabel.count} items` : '',
      icon: TrendingUp,
      color: 'purple',
      change: '+5%'
    },
    {
      title: 'Last Updated',
      value: new Date(statistics.lastUpdated).toLocaleTimeString(),
      subtitle: new Date(statistics.lastUpdated).toLocaleDateString(),
      icon: Clock,
      color: 'orange',
      change: 'Live'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      change: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      change: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      change: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      change: 'text-orange-600'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const colors = colorClasses[card.color as keyof typeof colorClasses];
        const Icon = card.icon;

        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className={`p-3 ${colors.bg} rounded-lg`}>
                <Icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <span className={`text-sm font-medium ${colors.change}`}>
                {card.change}
              </span>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              {card.subtitle && (
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsOverview;