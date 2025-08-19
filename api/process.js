import { v4 as uuidv4 } from 'uuid';

// Shared storage (in production, use a database)
let processedData = [];
let statistics = {
  totalProcessed: 0,
  labelCounts: {},
  lastUpdated: new Date()
};

// Default rules (should be shared with rules.js)
const rules = [
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
  statistics.totalProcessed++;
  labels.forEach(label => {
    statistics.labelCounts[label] = (statistics.labelCounts[label] || 0) + 1;
  });
  statistics.lastUpdated = new Date();
}

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const payload = req.body;
      const appliedLabels = [];
      
      // Evaluate all active rules
      for (const rule of rules) {
        if (evaluateRule(payload, rule)) {
          appliedLabels.push(rule.label);
        }
      }
      
      // Store processed data
      const processedEntry = {
        id: uuidv4(),
        payload,
        labels: appliedLabels,
        timestamp: new Date().toISOString()
      };
      
      processedData.push(processedEntry);
      updateStatistics(appliedLabels);
      
      res.status(200).json({
        id: processedEntry.id,
        labels: appliedLabels,
        timestamp: processedEntry.timestamp
      });
    } catch (error) {
      res.status(400).json({ error: 'Processing failed', details: error.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}