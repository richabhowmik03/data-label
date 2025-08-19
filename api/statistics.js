import { db } from '../lib/database.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const processedData = db.getProcessedData();

    // Calculate statistics
    const labelCounts = {};
    const totalProcessed = processedData.length;

    processedData.forEach(entry => {
      if (entry.labels && Array.isArray(entry.labels)) {
        entry.labels.forEach(label => {
          labelCounts[label] = (labelCounts[label] || 0) + 1;
        });
      }
    });

    // Calculate percentages
    const labelPercentages = {};
    Object.keys(labelCounts).forEach(label => {
      labelPercentages[label] = totalProcessed > 0 
        ? Math.round((labelCounts[label] / totalProcessed) * 100 * 100) / 100 
        : 0;
    });

    // Get recent entries (last 10)
    const recentEntries = processedData.slice(-10).reverse().map(entry => ({
      id: entry.id,
      payload: entry.payload,
      labels: entry.labels || [],
      timestamp: entry.timestamp
    }));

    return res.status(200).json({
      totalProcessed,
      labelCounts,
      labelPercentages,
      lastUpdated: new Date().toISOString(),
      recentEntries
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}