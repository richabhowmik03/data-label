// Shared data store for Vercel serverless functions
// Note: In serverless environments, this data resets between function invocations
// For production, you'd want to use a database like Supabase, MongoDB, or Redis

// Initialize with default rules every time (since serverless functions are stateless)
const defaultRules = [
  {
    id: 'default-rule-1',
    name: 'High Value Companies',
    conditions: {
      type: 'group',
      operator: 'OR',
      conditions: [
        { type: 'condition', key: 'CompanyName', operator: '=', value: 'Google' },
        {
          type: 'group',
          operator: 'AND',
          conditions: [
            { type: 'condition', key: 'CompanyName', operator: '=', value: 'Amazon' },
            { type: 'condition', key: 'Price', operator: '<', value: '2.5' }
          ]
        }
      ]
    },
    label: 'Green',
    priority: 3,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'default-rule-2',
    name: 'Standard Price Products',
    conditions: {
      type: 'group',
      operator: 'AND',
      conditions: [
        { type: 'condition', key: 'Price', operator: '=', value: '2' }
      ]
    },
    label: 'Orange',
    priority: 2,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'default-rule-3',
    name: 'Low MOQ Budget Products',
    conditions: {
      type: 'group',
      operator: 'AND',
      conditions: [
        { type: 'condition', key: 'MOQ', operator: '<', value: '100' },
        { type: 'condition', key: 'Price', operator: '<', value: '1.5' }
      ]
    },
    label: 'Green',
    priority: 1,
    enabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Global storage - will reset between serverless function invocations
let rules = [...defaultRules];
let processedData = [];

// Simple in-memory storage for demo purposes
// In production, you'd use a proper database
const storage = {
  rules: [...defaultRules],
  processedData: [],
  statistics: {
    totalProcessed: 0,
    labelCounts: {},
    lastUpdated: new Date().toISOString()
  }
};

// Utility functions
function evaluateCondition(data, condition) {
  const { key, operator, value } = condition;
  const dataValue = data[key];
  
  if (dataValue === undefined) return false;
  
  const numericValue = parseFloat(value);
  const numericDataValue = parseFloat(dataValue);
  
  switch (operator) {
    case '=':
      return String(dataValue).toLowerCase() === String(value).toLowerCase();
    case '!=':
      return String(dataValue).toLowerCase() !== String(value).toLowerCase();
    case '<':
      return !isNaN(numericDataValue) && !isNaN(numericValue) && numericDataValue < numericValue;
    case '>':
      return !isNaN(numericDataValue) && !isNaN(numericValue) && numericDataValue > numericValue;
    case '<=':
      return !isNaN(numericDataValue) && !isNaN(numericValue) && numericDataValue <= numericValue;
    case '>=':
      return !isNaN(numericDataValue) && !isNaN(numericValue) && numericDataValue >= numericValue;
    default:
      return false;
  }
}

function evaluateRule(data, rule) {
  if (!rule.enabled) return false;
  
  function evaluateGroup(group) {
    if (group.type === 'condition') {
      return evaluateCondition(data, group);
    }
    
    if (group.type === 'group') {
      const results = group.conditions.map(evaluateGroup);
      return group.operator === 'AND' 
        ? results.every(Boolean)
        : results.some(Boolean);
    }
    
    return false;
  }
  
  return evaluateGroup(rule.conditions);
}

function updateStatistics(labels) {
  storage.statistics.totalProcessed++;
  labels.forEach(label => {
    storage.statistics.labelCounts[label] = (storage.statistics.labelCounts[label] || 0) + 1;
  });
  storage.statistics.lastUpdated = new Date().toISOString();
}

// Get current data (always fresh)
function getRules() {
  return storage.rules.length > 0 ? storage.rules : [...defaultRules];
}

function getProcessedData() {
  return storage.processedData;
}

function getStatistics() {
  return storage.statistics;
}

// Export data and functions
export {
  storage,
  defaultRules,
  evaluateRule,
  updateStatistics,
  getRules,
  getProcessedData,
  getStatistics
};