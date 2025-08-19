import { db } from '../lib/supabase.js';

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
      const rules = await db.getRules();
      console.log(`[API] Returning ${rules.length} rules`);
      return res.status(200).json(rules);
    }

    if (req.method === 'POST') {
      const { name, conditions, label, priority = 1, enabled = true } = req.body;

      if (!name || !conditions || !label) {
        return res.status(400).json({ error: 'Missing required fields: name, conditions, label' });
      }

      console.log(`[API] Creating rule: ${name}`);
      const rule = await db.createRule({
        name,
        conditions,
        label,
        priority,
        enabled
      });

      console.log(`[API] Created rule with ID: ${rule.id}`);
      return res.status(201).json(rule);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Error in rules endpoint:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}