import { v4 as uuidv4 } from 'uuid';

// In-memory storage (in production, you'd want to use a database)
let rules = [
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

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    console.log(`Returning ${rules.length} rules`);
    res.status(200).json(rules);
    return;
  }

  if (req.method === 'POST') {
    try {
      const rule = {
        id: uuidv4(),
        name: req.body.name,
        conditions: req.body.conditions,
        label: req.body.label,
        priority: req.body.priority || 1,
        enabled: req.body.enabled !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      rules.push(rule);
      rules.sort((a, b) => b.priority - a.priority);
      
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ error: 'Invalid rule format', details: error.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}