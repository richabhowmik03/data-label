import { rules, evaluateRule } from './_shared/data.js';

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
      
      for (const rule of rules) {
        if (evaluateRule(payload, rule)) {
          appliedLabels.push(rule.label);
        }
      }
      
      res.status(200).json({
        labels: appliedLabels,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({ error: 'Testing failed', details: error.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}