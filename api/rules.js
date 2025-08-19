import { storage } from '../lib/storage.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      console.log('[API] Fetching rules...');
      const rules = await storage.getRules();
      console.log(`[API] Returning ${rules.length} rules`);
      return res.status(200).json(rules);
    }

    if (req.method === 'POST') {
      const { name, conditions, label, priority = 1, enabled = true } = req.body;

      if (!name || !conditions || !label) {
        return res.status(400).json({ error: 'Missing required fields: name, conditions, label' });
      }

      console.log(`[API] Creating rule: ${name}`);
      
      const rules = await storage.getRules();
      const newRule = {
        id: `rule-${Date.now()}`,
        name,
        conditions,
        label,
        priority,
        enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      rules.push(newRule);
      rules.sort((a, b) => b.priority - a.priority);
      await storage.saveRules(rules);

      console.log(`[API] Created rule with ID: ${newRule.id}`);
      return res.status(201).json(newRule);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Error in rules endpoint:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}