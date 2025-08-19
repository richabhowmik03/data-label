import { db, evaluateRule } from '../lib/database.js';

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

  try {
    const payload = req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    // Get enabled rules sorted by priority
    const rules = db.getRules().filter(rule => rule.enabled).sort((a, b) => b.priority - a.priority);

    // Evaluate rules and collect labels
    const appliedLabels = [];
    for (const rule of rules) {
      if (evaluateRule(payload, rule)) {
        appliedLabels.push(rule.label);
      }
    }

    // Store processed data
    const processedEntry = db.processData(payload, appliedLabels);

    return res.status(200).json({
      id: processedEntry.id,
      labels: appliedLabels,
      timestamp: processedEntry.timestamp
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}