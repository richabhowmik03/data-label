import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Play, Tag } from 'lucide-react';
import { ruleService } from '../services/ruleService';

interface JsonInputProps {
  onKeysChange: (keys: string[]) => void;
  rules: any[];
  isDarkMode: boolean;
}

const JsonInput: React.FC<JsonInputProps> = ({ onKeysChange, rules, isDarkMode }) => {
  const [jsonValue, setJsonValue] = useState('');
  const [extractedKeys, setExtractedKeys] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [testResults, setTestResults] = useState<{ labels: string[]; timestamp: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const sampleJson = `{
  "CompanyName": "Fortune Company",
  "Product": "Chocolate",
  "Size": "Small",
  "Price": 2,
  "Currency": "USD",
  "Weight": "10 gm",
  "BatchID": 15,
  "MFGUnit": "df_rd-15",
  "Quantity": 1800,
  "MOQ": 200
}`;

  // Auto-load sample data on component mount if no JSON is present
  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    setError('');

    if (!value.trim()) {
      setExtractedKeys([]);
      setIsValid(false);
      onKeysChange([]);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      const keys = Object.keys(parsed);
      setExtractedKeys(keys);
      setIsValid(true);
      onKeysChange(keys);
    } catch (err) {
      setError('Invalid JSON format');
      setExtractedKeys([]);
      setIsValid(false);
      onKeysChange([]);
    }
  };

  const loadSampleData = () => {
    setJsonValue(sampleJson);
    handleJsonChange(sampleJson);
  };

  const testRules = async () => {
    await processRules(false);
  };

  const addToDashboard = async () => {
    await processRules(true);
  };

  const processRules = async (addToDashboard: boolean) => {
    if (!isValid || !jsonValue.trim()) {
      setError('Please provide valid JSON first');
      return;
    }

    setError('');
    setIsTesting(true);

    try {
      const parsed = JSON.parse(jsonValue);
      const result = addToDashboard 
        ? await ruleService.processPayload(parsed)
        : await ruleService.testPayload(parsed);
      setTestResults(result);
    } catch (err) {
      console.error('Frontend error during rule processing:', err);
      setError(`Failed to ${addToDashboard ? 'process' : 'test'} rules. Please check your JSON and try again.`);
      setTestResults(null);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className={`text-lg font-semibold transition-colors duration-200 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>JSON Input</h3>
        </div>
        <button
          onClick={loadSampleData}
          className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Load Sample</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Paste your JSON payload here:
          </label>
          <textarea
            value={jsonValue}
            onChange={(e) => handleJsonChange(e.target.value)}
            className={`w-full h-40 p-3 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
              error 
                ? isDarkMode 
                  ? 'border-red-500 bg-red-900/20 text-white' 
                  : 'border-red-300 bg-red-50 text-gray-900'
                : isValid 
                  ? isDarkMode 
                    ? 'border-green-500 bg-green-900/20 text-white' 
                    : 'border-green-300 bg-green-50 text-gray-900'
                  : isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
            }`}
            placeholder="Paste your JSON here..."
          />
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

        {isValid && (
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={testRules}
                disabled={isTesting || rules.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>{isTesting ? 'Testing...' : 'Test Rules'}</span>
              </button>
              
              <button
                onClick={addToDashboard}
                disabled={isTesting || rules.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Tag className="h-4 w-4" />
                <span>{isTesting ? 'Processing...' : 'Add to Dashboard'}</span>
              </button>
            </div>
            
            {rules.length === 0 && (
              <span className={`text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Create some rules first to test</span>
            )}
          </div>
        )}

        {testResults && (
          <div className={`border rounded-lg p-4 transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="h-5 w-5 text-blue-600" />
              <span className={`text-sm font-medium transition-colors duration-200 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                Test Results
              </span>
              <span className={`text-xs transition-colors duration-200 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {new Date(testResults.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            {testResults.labels.length > 0 ? (
              <div className="space-y-2">
                <p className={`text-sm transition-colors duration-200 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>Applied Labels:</p>
                <div className="flex flex-wrap gap-2">
                  {testResults.labels.map((label, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-blue-800 text-blue-200 border-blue-700' 
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                No rules matched this JSON payload.
              </p>
            )}
          </div>
        )}

        {isValid && extractedKeys.length > 0 && (
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
                Extracted {extractedKeys.length} keys
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedKeys.map((key) => (
                <span
                  key={key}
                  className={`px-2 py-1 text-xs font-medium rounded-md border transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-green-800 text-green-200 border-green-700' 
                      : 'bg-green-100 text-green-800 border-green-300'
                  }`}
                >
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonInput;