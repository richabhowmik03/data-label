// Central data endpoint that all other functions can use
import { simpleStore } from '../lib/simple-store.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`[DataAPI] ${req.method} ${req.url} - Query:`, req.query);

  try {
    const { action } = req.query;

    switch (action) {
      case 'get-rules':
        const rules = simpleStore.getRules();
        return res.status(200).json(rules);

      case 'add-processed':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        const entry = simpleStore.addProcessedEntry(req.body);
        return res.status(200).json(entry);

      case 'get-statistics':
        const { label, from, to } = req.query;
        const stats = simpleStore.getStatistics({ label, from, to });
        return res.status(200).json(stats);

      case 'get-processed':
        const processed = simpleStore.getProcessedData();
        return res.status(200).json(processed);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('[DataAPI] Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}