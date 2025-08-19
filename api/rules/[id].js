import { database } from '../../lib/database.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const { name, conditions, label, priority, enabled } = req.body;

      console.log(`[API] Updating rule: ${id}`);
      const rule = await database.updateRule(id, {
        name,
        conditions,
        label,
        priority,
        enabled
      });

      console.log(`[API] Updated rule: ${rule.name}`);
      return res.status(200).json(rule);
    }

    if (req.method === 'DELETE') {
      console.log(`[API] Deleting rule: ${id}`);
      await database.deleteRule(id);
      console.log(`[API] Deleted rule: ${id}`);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Error in rule endpoint:', error);
    if (error.message === 'Rule not found') {
      return res.status(404).json({ error: 'Rule not found' });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}