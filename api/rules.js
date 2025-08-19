import { supabase } from '../lib/supabase.js';

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
      const { data: rules, error } = await supabase
        .from('rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) {
        console.error('[API] Error fetching rules:', error);
        return res.status(500).json({ error: 'Failed to fetch rules', details: error.message });
      }

      console.log(`[API] Returning ${rules.length} rules`);
      return res.status(200).json(rules);
    }

    if (req.method === 'POST') {
      const { name, conditions, label, priority = 1, enabled = true } = req.body;

      if (!name || !conditions || !label) {
        return res.status(400).json({ error: 'Missing required fields: name, conditions, label' });
      }

      const { data: rule, error } = await supabase
        .from('rules')
        .insert([{
          name,
          conditions,
          label,
          priority,
          enabled
        }])
        .select()
        .single();

      if (error) {
        console.error('[API] Error creating rule:', error);
        return res.status(500).json({ error: 'Failed to create rule', details: error.message });
      }

      console.log(`[API] Created rule: ${rule.name}`);
      return res.status(201).json(rule);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}