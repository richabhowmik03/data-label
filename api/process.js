import { simpleStore, evaluateRule } from '../lib/simple-store.js';

export default async function handler(req, res) {
  console.log('[API] Process endpoint called');
  
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

    console.log('[API] Processing payload:', JSON.stringify(payload));

    // Get all enabled rules ordered by priority
    const allRules = simpleStore.getRules();
    const rules = allRules.filter(rule => rule.enabled).sort((a, b) => b.priority - a.priority);

    console.log(`[API] Processing with ${rules.length} active rules`);

    // Evaluate rules and collect matching labels
    const appliedLabels = [];
    for (const rule of rules) {
      if (evaluateRule(payload, rule)) {
        appliedLabels.push(rule.label);
        console.log(`[API] Rule "${rule.name}" matched, applied label: ${rule.label}`);
      }
    }

    // Store processed data
    const processedEntry = {
      id: `entry-${Date.now()}`,
      payload,
      labels: appliedLabels,
      created_at: new Date().toISOString()
    };

    // Store in local store
    simpleStore.addProcessedEntry(processedEntry);
    
    // Also try to store via central data API for cross-function access
    try {
      const baseUrl = req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/data?action=add-processed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedEntry)
      });
      console.log('[API] Stored in central data API:', response.status);
    } catch (error) {
      console.log('[API] Central data API not available, using local store only');
    }
    
    console.log('[API] Stored processed entry:', processedEntry.id);

    const response = {
      id: processedEntry.id,
      labels: appliedLabels,
      timestamp: processedEntry.created_at
    };
    
    console.log('[API] Sending response:', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('[API] Error processing payload:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message
    });
  }
}