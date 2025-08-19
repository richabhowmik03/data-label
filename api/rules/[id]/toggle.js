import { supabase } from '../../../lib/supabase.js';

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

  const { id } = req.query;

  try {
    // First get the current rule
    const { data: currentRule, error: fetchError } = await supabase
      .from('rules')
      .select('enabled')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('[API] Error fetching rule for toggle:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch rule', details: fetchError.message });
    }

    if (!currentRule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Toggle the enabled status
    const { data: rule, error } = await supabase
      .from('rules')
      .update({ enabled: !currentRule.enabled })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API] Error toggling rule:', error);
      return res.status(500).json({ error: 'Failed to toggle rule', details: error.message });
    }

    console.log(`[API] Toggled rule ${id}: enabled = ${rule.enabled}`);
    return res.status(200).json(rule);
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}