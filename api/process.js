import { supabase, evaluateRule } from '../lib/supabase.js';

export default async function handler(req, res) {
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

    // Get all enabled rules ordered by priority
    const { data: rules, error: rulesError } = await supabase
      .from('rules')
      .select('*')
      .eq('enabled', true)
      .order('priority', { ascending: false });

    if (rulesError) {
      console.error('[API] Error fetching rules:', rulesError);
      return res.status(500).json({ error: 'Failed to fetch rules', details: rulesError.message });
    }

    console.log(`[API] Processing payload with ${rules.length} active rules`);

    // Evaluate rules and collect matching labels
    const appliedLabels = [];
    for (const rule of rules) {
      if (evaluateRule(payload, rule)) {
        appliedLabels.push(rule.label);
        console.log(`[API] Rule "${rule.name}" matched, applied label: ${rule.label}`);
      }
    }

    // Store processed data in Supabase
    const { data: processedEntry, error: insertError } = await supabase
      .from('processed_data')
      .insert([{
        payload,
        labels: appliedLabels
      }])
      .select()
      .single();

    if (insertError) {
      console.error('[API] Error storing processed data:', insertError);
      return res.status(500).json({ error: 'Failed to store processed data', details: insertError.message });
    }

    console.log(`[API] Processed entry with labels: [${appliedLabels.join(', ')}]`);

    return res.status(200).json({
      id: processedEntry.id,
      labels: appliedLabels,
      timestamp: processedEntry.created_at
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}