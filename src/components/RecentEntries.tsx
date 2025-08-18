import React from 'react';
import { Clock, Tag } from 'lucide-react';

interface RecentEntry {
  id: string;
  payload: any;
  labels: string[];
  timestamp: string;
}

interface RecentEntriesProps {
  entries: RecentEntry[];
}

const RecentEntries: React.FC<RecentEntriesProps> = ({ entries }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No recent entries</p>
          <p className="text-sm text-gray-400">Processed data will appear here</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-wrap gap-1">
                  {entry.labels.length > 0 ? (
                    entry.labels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {label}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                      No labels
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatTime(entry.timestamp)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 font-mono max-h-20 overflow-y-auto">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(entry.payload, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentEntries;