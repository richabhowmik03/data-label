import { db } from '../../../lib/database.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const rules = db.getRules();
    const currentRule = rules.find(r => r.id === id);
    
    if (!currentRule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    const updatedRule = db.updateRule(id, { enabled: !currentRule.enabled });
    return res.status(200).json(updatedRule);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}