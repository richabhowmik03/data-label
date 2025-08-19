import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// In-memory storage
let rules = [];
let processedData = [];
let statistics = {
  totalProcessed: 0,
  labelCounts: {},
  lastUpdated: new Date()
};

// Helper functions
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

// Routes

// Rules endpoints
app.get('/api/rules', (req, res) => {
  res.json(rules);
});

app.post('/api/rules', (req, res) => {
  try {
    const rule = {
      id: uuidv4(),
      name: req.body.name,
      conditions: req.body.conditions,
      label: req.body.label,
      priority: req.body.priority || 1,
      enabled: req.body.enabled !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    rules.push(rule);
    rules.sort((a, b) => b.priority - a.priority); // Sort by priority
    
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ error: 'Invalid rule format', details: error.message });
  }
});

app.put('/api/rules/:id', (req, res) => {
  try {
    const ruleIndex = rules.findIndex(r => r.id === req.params.id);
    if (ruleIndex === -1) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date()
    };
    
    rules.sort((a, b) => b.priority - a.priority);
    
    res.json(rules[ruleIndex]);
  } catch (error) {
    res.status(400).json({ error: 'Invalid rule format', details: error.message });
  }
});

app.delete('/api/rules/:id', (req, res) => {
  const ruleIndex = rules.findIndex(r => r.id === req.params.id);
  if (ruleIndex === -1) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  
  rules.splice(ruleIndex, 1);
  res.status(204).send();
});

app.post('/api/rules/:id/toggle', (req, res) => {
  const rule = rules.find(r => r.id === req.params.id);
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  
  rule.enabled = !rule.enabled;
  rule.updatedAt = new Date();
  
  res.json(rule);
});

// Processing endpoint
app.post('/api/process', (req, res) => {
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
      timestamp: new Date()
    };
    
    processedData.push(processedEntry);
    updateStatistics(appliedLabels);
    
    res.json({
      id: processedEntry.id,
      labels: appliedLabels,
      timestamp: processedEntry.timestamp
    });
  } catch (error) {
    res.status(400).json({ error: 'Processing failed', details: error.message });
  }
});

// Test endpoint (doesn't save to dashboard)
app.post('/api/test', (req, res) => {
  try {
    const payload = req.body;
    const appliedLabels = [];
    
    // Evaluate all active rules
    for (const rule of rules) {
      if (evaluateRule(payload, rule)) {
        appliedLabels.push(rule.label);
      }
    }
    
    // Don't store in processedData or update statistics for test
    res.json({
      labels: appliedLabels,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(400).json({ error: 'Testing failed', details: error.message });
  }
});

// Statistics endpoint
app.get('/api/statistics', (req, res) => {
  try {
    const { label, from, to } = req.query;
    let filteredData = processedData;
    
    // Apply date filters
    if (from || to) {
      const fromDate = from ? new Date(from) : new Date(0);
      const toDate = to ? new Date(to) : new Date();
      
      filteredData = processedData.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }
    
    // Apply label filter
    if (label) {
      filteredData = filteredData.filter(entry => 
        entry.labels.includes(label)
      );
    }
    
    // Calculate statistics
    const labelCounts = {};
    let totalProcessed = filteredData.length;
    
    filteredData.forEach(entry => {
      entry.labels.forEach(lbl => {
        labelCounts[lbl] = (labelCounts[lbl] || 0) + 1;
      });
    });
    
    const labelPercentages = {};
    Object.keys(labelCounts).forEach(lbl => {
      labelPercentages[lbl] = totalProcessed > 0 
        ? Math.round((labelCounts[lbl] / totalProcessed) * 100 * 100) / 100 
        : 0;
    });
    
    res.json({
      totalProcessed,
      labelCounts,
      labelPercentages,
      lastUpdated: statistics.lastUpdated,
      recentEntries: filteredData.slice(-10).reverse()
    });
  } catch (error) {
    res.status(400).json({ error: 'Statistics query failed', details: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    rulesCount: rules.length,
    processedCount: processedData.length
  });
});

// Swagger documentation endpoint
app.get('/api/docs', (req, res) => {
  const docs = {
    openapi: '3.0.0',
    info: {
      title: 'Advanced Data Labeling Engine API',
      version: '1.0.0',
      description: 'API for intelligent data labeling and processing'
    },
    paths: {
      '/api/rules': {
        get: {
          summary: 'Get all rules',
          responses: { '200': { description: 'Array of rules' } }
        },
        post: {
          summary: 'Create new rule',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    conditions: { type: 'object' },
                    label: { type: 'string' },
                    priority: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      },
      '/api/process': {
        post: {
          summary: 'Process JSON payload',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' }
              }
            }
          }
        }
      },
      '/api/statistics': {
        get: {
          summary: 'Get processing statistics',
          parameters: [
            { name: 'label', in: 'query', schema: { type: 'string' } },
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } }
          ]
        }
      }
    }
  };
  
  res.json(docs);
});

// Serve static files from dist directory
app.use(express.static(path.join(process.cwd(), 'dist')));

// Handle client-side routing - serve index.html for non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // In development, serve a simple HTML page since dist doesn't exist
  if (process.env.NODE_ENV !== 'production') {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Advanced Data Labeling Engine</title>
          <script>window.location.href = 'http://localhost:5173';</script>
        </head>
        <body>
          <p>Redirecting to development server at <a href="http://localhost:5173">http://localhost:5173</a></p>
        </body>
      </html>
    `);
  } else {
    // For production, serve the React app
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  }
});

// Initialize with sample data
const sampleRules = [
  {
    id: uuidv4(),
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
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
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
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
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
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

rules = sampleRules;

// Log initialization for debugging
console.log(`Initialized with ${rules.length} default rules:`);
rules.forEach(rule => {
  console.log(`- ${rule.name} (${rule.label}, Priority: ${rule.priority})`);
});
app.listen(PORT, () => {
  console.log(`Advanced Data Labeling Engine API running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api/docs`);
});

export default app;