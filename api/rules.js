import { db } from '../lib/database.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const rules = db.getRules();
      return res.status(200).json(rules);
    }

    if (req.method === 'POST') {
      const { name, conditions, label, priority = 1, enabled = true } = req.body;
      
      if (!name || !conditions || !label) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const rule = db.createRule({ name, conditions, label, priority, enabled });
      return res.status(201).json(rule);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}