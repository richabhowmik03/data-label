import { memoryStore, evaluateRule } from '../lib/memory-store.js';

export default async function handler(req, res) {
  console.log('[API] Test endpoint called');
  
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

  try {
    const payload = req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    console.log('[API] Testing payload:', JSON.stringify(payload));

    // Get all enabled rules ordered by priority
    const allRules = memoryStore.getRules();
    const rules = allRules.filter(rule => rule.enabled).sort((a, b) => b.priority - a.priority);

    console.log(`[API] Testing with ${rules.length} active rules`);

    // Evaluate rules and collect matching labels (without storing)
    const appliedLabels = [];
    for (const rule of rules) {
      if (evaluateRule(payload, rule)) {
        appliedLabels.push(rule.label);
        console.log(`[API] Test - Rule "${rule.name}" matched, label: ${rule.label}`);
      }
    }

    console.log(`[API] Test result - Labels: [${appliedLabels.join(', ')}]`);

    return res.status(200).json({
      labels: appliedLabels,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error testing payload:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}