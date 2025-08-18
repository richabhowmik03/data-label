import React, { useState } from 'react';
import { Play, FileText, AlertCircle, Tag, Check } from 'lucide-react';
import { ruleService } from '../services/ruleService';

interface JsonProcessorProps {
  onProcessComplete: () => void;
  isDarkMode: boolean;
}

const JsonProcessor: React.FC<JsonProcessorProps> = ({ onProcessComplete, isDarkMode }) => {
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
    <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-green-600" />
        <h3 className={`text-lg font-semibold transition-colors duration-200 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Process New Data</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            JSON Payload
          </label>
          <textarea
            value={jsonValue}
            onChange={(e) => handleJsonChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`w-full h-32 p-3 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
              error 
                ? isDarkMode 
                  ? 'border-red-500 bg-red-900/20 text-white' 
                  : 'border-red-300 bg-red-50 text-gray-900'
                : isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900'
            }`}
            placeholder='{"key": "value", "number": 123}'
          />
          <p className={`text-xs mt-1 transition-colors duration-200 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Tip: Press Ctrl+Enter to process quickly
          </p>
        </div>

        {error && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg transition-colors duration-200 ${
            isDarkMode 
              ? 'text-red-400 bg-red-900/20 border border-red-800' 
              : 'text-red-600 bg-red-50 border border-red-200'
          }`}>
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {processResult && (
          <div className={`border rounded-lg p-4 transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-800' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className={`text-sm font-medium transition-colors duration-200 ${
                isDarkMode ? 'text-green-300' : 'text-green-800'
              }`}>
                Successfully Processed
              </span>
              <span className={`text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {new Date(processResult.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {processResult.labels.length > 0 ? (
              <div className="space-y-2">
                <p className={`text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-green-300' : 'text-green-700'
                }`}>Applied Labels:</p>
                <div className="flex flex-wrap gap-2">
                  {processResult.labels.map((label, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-green-800 text-green-200 border-green-700' 
                          : 'bg-green-100 text-green-800 border-green-300'
                      }`}
                    >
                      <Tag className="h-3 w-3 inline mr-1" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-green-300' : 'text-green-700'
              }`}>
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