import { v4 as uuidv4 } from 'uuid';
import { rules } from './_shared/data.js';

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