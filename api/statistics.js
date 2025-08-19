import { memoryStore } from '../lib/memory-store.js';

export default async function handler(req, res) {
  console.log('[API] Statistics endpoint called');
  console.log('[API] Query parameters:', req.query);
  
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

    // Get debug info first
    const debugInfo = memoryStore.getDebugInfo();
    console.log('[API] Debug info:', debugInfo);

    // Get statistics
    const statistics = memoryStore.getStatistics({ label, from, to });

    console.log(`[API] Returning statistics:`, {
      totalProcessed: statistics.totalProcessed,
      labelCounts: statistics.labelCounts,
      recentEntriesCount: statistics.recentEntries.length
    });

    return res.status(200).json(statistics);
  } catch (error) {
    console.error('[API] Error fetching statistics:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}