import { storage, getProcessedData, getStatistics } from './_shared/data.js';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { label, from, to } = req.query;
      let filteredData = getProcessedData();
      
      console.log(`[API] Statistics request - Total entries: ${filteredData.length}`);
      
      // Apply date filters
      if (from || to) {
        const fromDate = from ? new Date(from) : new Date(0);
        const toDate = to ? new Date(to) : new Date();
        
        filteredData = filteredData.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= fromDate && entryDate <= toDate;
        });
        console.log(`[API] After date filter: ${filteredData.length} entries`);
      }
      
      // Apply label filter
      if (label) {
        filteredData = filteredData.filter(entry => 
          entry.labels.includes(label)
        );
        console.log(`[API] After label filter (${label}): ${filteredData.length} entries`);
      }
      
      // Calculate statistics from filtered data
      const labelCounts = {};
      let totalProcessed = filteredData.length;
      
      filteredData.forEach(entry => {
        entry.labels.forEach(lbl => {
          labelCounts[lbl] = (labelCounts[lbl] || 0) + 1;
        });
      });
      
      const labelPercentages = {};
      Object.keys(labelCounts).forEach(lbl => {
        labelPercentages[lbl] = totalProcessed > 0 
          ? Math.round((labelCounts[lbl] / totalProcessed) * 100 * 100) / 100 
          : 0;
      });
      
      const result = {
        totalProcessed,
        labelCounts,
        labelPercentages,
        lastUpdated: storage.statistics.lastUpdated,
        recentEntries: filteredData.slice(-10).reverse()
      };
      
      console.log(`[API] Returning statistics:`, {
        totalProcessed: result.totalProcessed,
        labelCounts: result.labelCounts,
        recentEntriesCount: result.recentEntries.length
      });
      
      res.status(200).json(result);
    } catch (error) {
      console.error('[API] Statistics query failed:', error);
      res.status(400).json({ error: 'Statistics query failed', details: error.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}