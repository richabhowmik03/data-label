import { supabase } from '../../lib/supabase.js';

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

      const { data: rule, error } = await supabase
        .from('rules')
        .update({
          name,
          conditions,
          label,
          priority,
          enabled
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[API] Error updating rule:', error);
        return res.status(500).json({ error: 'Failed to update rule', details: error.message });
      }

      if (!rule) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      console.log(`[API] Updated rule: ${rule.name}`);
      return res.status(200).json(rule);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[API] Error deleting rule:', error);
        return res.status(500).json({ error: 'Failed to delete rule', details: error.message });
      }

      console.log(`[API] Deleted rule: ${id}`);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}