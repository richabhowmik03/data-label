import React, { useState } from 'react';
import { Play, FileText, AlertCircle, Tag, Check } from 'lucide-react';
import { ruleService } from '../services/ruleService';

interface JsonProcessorProps {
  onProcessComplete: () => void;
}

const JsonProcessor: React.FC<JsonProcessorProps> = ({ onProcessComplete }) => {
  const [jsonValue, setJsonValue] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{ labels: string[]; timestamp: string } | null>(null);

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    setError('');
    setProcessResult(null);
  };

  const processJson = async () => {
    if (!jsonValue.trim()) {
      setError('Please enter JSON data to process');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const parsed = JSON.parse(jsonValue);
      const result = await ruleService.processPayload(parsed);
      setProcessResult(result);
      onProcessComplete(); // Refresh dashboard statistics
      setJsonValue(''); // Clear input after successful processing
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format');
      } else {
        setError('Failed to process JSON. Please try again.');
      }
      setProcessResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      processJson();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Process New Data</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON Payload
          </label>
          <textarea
            value={jsonValue}
            onChange={(e) => handleJsonChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-full h-32 p-3 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder='{"key": "value", "number": 123}'
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Press Ctrl+Enter to process quickly
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {processResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Successfully Processed
              </span>
              <span className="text-xs text-green-600">
                {new Date(processResult.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {processResult.labels.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-green-700">Applied Labels:</p>
                <div className="flex flex-wrap gap-2">
                  {processResult.labels.map((label, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-300"
                    >
                      <Tag className="h-3 w-3 inline mr-1" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-green-700">
                No rules matched this JSON payload.
              </p>
            )}
          </div>
        )}

        <button
          onClick={processJson}
          disabled={isProcessing || !jsonValue.trim()}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="h-4 w-4" />
          <span>{isProcessing ? 'Processing...' : 'Process & Add to Dashboard'}</span>
        </button>
      </div>
    </div>
  );
};

export default JsonProcessor;