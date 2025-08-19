import { simpleStore } from '../lib/simple-store.js';

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

    // Try to get statistics from central data API first
    let statistics;
    try {
      const baseUrl = req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000';
      const params = new URLSearchParams();
      if (label) params.append('label', label);
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      params.append('action', 'get-statistics');
      
      const response = await fetch(`${baseUrl}/api/data?${params}`);
      if (response.ok) {
        statistics = await response.json();
        console.log('[API] Got statistics from central data API');
      } else {
        throw new Error('Central API failed');
      }
    } catch (error) {
      console.log('[API] Central data API not available, using local store');
      statistics = simpleStore.getStatistics({ label, from, to });
    }

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