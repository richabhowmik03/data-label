import { database } from '../../../lib/database.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    console.log(`[API] Toggling rule: ${id}`);
    
    // Get current rules to find the one to toggle
    const rules = await database.getRules();
    const currentRule = rules.find(r => r.id === id);
    
    if (!currentRule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Toggle the enabled status
    const updatedRule = await database.updateRule(id, { enabled: !currentRule.enabled });
    
    console.log(`[API] Toggled rule ${id}: enabled = ${updatedRule.enabled}`);
    return res.status(200).json(updatedRule);
  } catch (error) {
    console.error('[API] Error toggling rule:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}