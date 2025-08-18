import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';

interface JsonInputProps {
  onKeysChange: (keys: string[]) => void;
}

const JsonInput: React.FC<JsonInputProps> = ({ onKeysChange }) => {
  const [jsonValue, setJsonValue] = useState('');
  const [extractedKeys, setExtractedKeys] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">JSON Input</h3>
        </div>
        <button
          onClick={loadSampleData}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Upload className="h-4 w-4" />
          <span>Load Sample</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste your JSON payload here:
          </label>
          <textarea
            value={jsonValue}
            onChange={(e) => handleJsonChange(e.target.value)}
            className={`w-full h-40 p-3 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-300 bg-red-50' : isValid ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}
            placeholder="Paste your JSON here..."
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isValid && extractedKeys.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Extracted {extractedKeys.length} keys
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedKeys.map((key) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md border border-green-300"
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