import { simpleStore } from '../lib/simple-store.js';

export default async function handler(req, res) {
  console.log(`[API] Rules endpoint called - Method: ${req.method}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const rules = simpleStore.getRules();
      console.log(`[API] Returning ${rules.length} rules`);
      return res.status(200).json(rules);
    }

    if (req.method === 'POST') {
      const { name, conditions, label, priority = 1, enabled = true } = req.body;

      if (!name || !conditions || !label) {
        return res.status(400).json({ error: 'Missing required fields: name, conditions, label' });
      }

      console.log(`[API] Creating rule: ${name}`);
      
      const newRule = {
        name,
        conditions,
        label,
        priority,
        enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const createdRule = simpleStore.addRule(newRule);
      console.log(`[API] Created rule with ID: ${createdRule.id}`);
      return res.status(201).json(createdRule);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Error in rules endpoint:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}