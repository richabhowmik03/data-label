import { v4 as uuidv4 } from 'uuid';
import { rules, processedData, evaluateRule, updateStatistics } from './_shared/data.js';

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
      const appliedLabels = [];
      
      // Evaluate all active rules
      for (const rule of rules) {
        if (evaluateRule(payload, rule)) {
          appliedLabels.push(rule.label);
        }
      }
      
      // Store processed data
      const processedEntry = {
        id: uuidv4(),
        payload,
        labels: appliedLabels,
        timestamp: new Date().toISOString()
      };
      
      processedData.push(processedEntry);
      updateStatistics(appliedLabels);
      
      console.log(`Processed entry with labels: ${appliedLabels.join(', ')}`);
      
      res.status(200).json({
        id: processedEntry.id,
        labels: appliedLabels,
        timestamp: processedEntry.timestamp
      });
    } catch (error) {
      console.error('Processing failed:', error);
      res.status(400).json({ error: 'Processing failed', details: error.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}