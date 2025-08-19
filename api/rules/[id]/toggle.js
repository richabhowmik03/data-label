// This would need to be shared with the main rules.js file
let rules = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { id } = req.query;
    const rule = rules.find(r => r.id === id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    rule.enabled = !rule.enabled;
    rule.updatedAt = new Date().toISOString();
    
    res.status(200).json(rule);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}