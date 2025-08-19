import { db } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { label, from, to } = req.query;

    console.log('[API] Fetching statistics with filters:', { label, from, to });

    // Get processed data with filters
    const processedData = await db.getProcessedData({ from, to });

    console.log(`[API] Found ${processedData.length} processed entries`);

    // Apply label filter if specified
    let filteredData = processedData;
    if (label) {
      filteredData = processedData.filter(entry => 
        entry.labels && Array.isArray(entry.labels) && entry.labels.includes(label)
      );
      console.log(`[API] After label filter (${label}): ${filteredData.length} entries`);
    }

    // Calculate statistics
    const labelCounts = {};
    const totalProcessed = filteredData.length;

    filteredData.forEach(entry => {
      if (entry.labels && Array.isArray(entry.labels)) {
        entry.labels.forEach(lbl => {
          labelCounts[lbl] = (labelCounts[lbl] || 0) + 1;
        });
      }
    });

    // Calculate percentages
    const labelPercentages = {};
    Object.keys(labelCounts).forEach(lbl => {
      labelPercentages[lbl] = totalProcessed > 0 
        ? Math.round((labelCounts[lbl] / totalProcessed) * 100 * 100) / 100 
        : 0;
    });

    // Get recent entries (last 10)
    const recentEntries = filteredData.slice(0, 10).map(entry => ({
      id: entry.id,
      payload: entry.payload,
      labels: entry.labels || [],
      timestamp: entry.created_at
    }));

    const result = {
      totalProcessed,
      labelCounts,
      labelPercentages,
      lastUpdated: new Date().toISOString(),
      recentEntries
    };

    console.log(`[API] Returning statistics:`, {
      totalProcessed: result.totalProcessed,
      labelCounts: result.labelCounts,
      recentEntriesCount: result.recentEntries.length
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('[API] Error fetching statistics:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}