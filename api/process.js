import { v4 as uuidv4 } from 'uuid';
import { storage, getRules, evaluateRule, updateStatistics } from './_shared/data.js';

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
    try {
      const payload = req.body;
      const rules = getRules();
      const appliedLabels = [];
      
      console.log(`[API] Processing payload with ${rules.length} rules`);
      
      // Evaluate all active rules
      for (const rule of rules) {
        if (evaluateRule(payload, rule)) {
          appliedLabels.push(rule.label);
          console.log(`[API] Rule "${rule.name}" matched, applied label: ${rule.label}`);
        }
      }
      
      // Store processed data
      const processedEntry = {
        id: uuidv4(),
        payload,
        labels: appliedLabels,
        timestamp: new Date().toISOString()
      };
      
      storage.processedData.push(processedEntry);
      updateStatistics(appliedLabels);
      
      console.log(`[API] Processed entry with labels: [${appliedLabels.join(', ')}]`);
      console.log(`[API] Total processed: ${storage.statistics.totalProcessed}`);
      console.log(`[API] Label counts:`, storage.statistics.labelCounts);
      
      res.status(200).json({
        id: processedEntry.id,
        labels: appliedLabels,
        timestamp: processedEntry.timestamp
      });
    } catch (error) {
      console.error('[API] Processing failed:', error);
      res.status(400).json({ error: 'Processing failed', details: error.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}