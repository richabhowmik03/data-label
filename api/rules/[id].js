import { db } from '../../lib/database.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const rule = db.updateRule(id, req.body);
      return res.status(200).json(rule);
    }

    if (req.method === 'DELETE') {
      db.deleteRule(id);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error.message === 'Rule not found') {
      return res.status(404).json({ error: 'Rule not found' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}