import { rules } from '../_shared/data.js';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const ruleIndex = rules.findIndex(r => r.id === id);
      if (ruleIndex === -1) {
        return res.status(404).json({ error: 'Rule not found' });
      }
      
      rules[ruleIndex] = {
        ...rules[ruleIndex],
        ...req.body,
        id: id,
        updatedAt: new Date().toISOString()
      };
      
      rules.sort((a, b) => b.priority - a.priority);
      
      res.status(200).json(rules[ruleIndex]);
    } catch (error) {
      res.status(400).json({ error: 'Invalid rule format', details: error.message });
    }
    return;
  }

  if (req.method === 'DELETE') {
    const ruleIndex = rules.findIndex(r => r.id === id);
    if (ruleIndex === -1) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    rules.splice(ruleIndex, 1);
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}