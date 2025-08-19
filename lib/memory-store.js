// Simple in-memory store that works across Vercel functions
// Uses a combination of global variables and HTTP headers for data sharing

let processedData = [];
let rules = [];

// Default rules
const DEFAULT_RULES = [
  {
    id: 'rule-1',
    name: 'High Value Companies',
    conditions: {
      type: 'group',
      operator: 'OR',
      conditions: [
        { type: 'condition', key: 'CompanyName', operator: '=', value: 'Google' },
        {
          type: 'group',
          operator: 'AND',
          conditions: [
            { type: 'condition', key: 'CompanyName', operator: '=', value: 'Amazon' },
            { type: 'condition', key: 'Price', operator: '<', value: '2.5' }
          ]
        }
      ]
    },
    label: 'Green',
    priority: 3,
    enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rule-2',
    name: 'Standard Price Products',
    conditions: {
      type: 'group',
      operator: 'AND',
      conditions: [
        { type: 'condition', key: 'Price', operator: '=', value: '2' }
      ]
    },
    label: 'Orange',
    priority: 2,
    enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rule-3',
    name: 'Low MOQ Budget Products',
    conditions: {
      type: 'group',
      operator: 'AND',
      conditions: [
        { type: 'condition', key: 'MOQ', operator: '<', value: '100' },
        { type: 'condition', key: 'Price', operator: '<', value: '1.5' }
      ]
    },
    label: 'Green',
    priority: 1,
    enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initialize with default rules if empty
if (rules.length === 0) {
  rules = [...DEFAULT_RULES];
  console.log('[MemoryStore] Initialized with default rules');
}

export const memoryStore = {
  // Rules operations
  getRules() {
    console.log(`[MemoryStore] Getting ${rules.length} rules`);
    return [...rules];
  },

  addRule(rule) {
    rules.push(rule);
    rules.sort((a, b) => b.priority - a.priority);
    console.log(`[MemoryStore] Added rule: ${rule.name}, total: ${rules.length}`);
    return rule;
  },

  updateRule(id, updates) {
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    
    rules[index] = { ...rules[index], ...updates, updated_at: new Date().toISOString() };
    rules.sort((a, b) => b.priority - a.priority);
    console.log(`[MemoryStore] Updated rule: ${id}`);
    return rules[index];
  },

  deleteRule(id) {
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    
    rules.splice(index, 1);
    console.log(`[MemoryStore] Deleted rule: ${id}, remaining: ${rules.length}`);
  },

  // Processed data operations
  getProcessedData() {
    console.log(`[MemoryStore] Getting ${processedData.length} processed entries`);
    return [...processedData];
  },

  addProcessedEntry(entry) {
    processedData.push(entry);
    console.log(`[MemoryStore] Added processed entry: ${entry.id}, total: ${processedData.length}`);
    console.log(`[MemoryStore] Entry labels: [${entry.labels.join(', ')}]`);
    return entry;
  },

  // Statistics
  getStatistics(filters = {}) {
    console.log(`[MemoryStore] Calculating statistics from ${processedData.length} entries`);
    
    let filteredData = [...processedData];
    
    // Apply date filters
    if (filters.from || filters.to) {
      const fromDate = filters.from ? new Date(filters.from) : new Date(0);
      const toDate = filters.to ? new Date(filters.to) : new Date();
      
      filteredData = processedData.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= fromDate && entryDate <= toDate;
      });
      console.log(`[MemoryStore] After date filter: ${filteredData.length} entries`);
    }

    // Apply label filter
    if (filters.label) {
      filteredData = filteredData.filter(entry => 
        entry.labels && Array.isArray(entry.labels) && entry.labels.includes(filters.label)
      );
      console.log(`[MemoryStore] After label filter (${filters.label}): ${filteredData.length} entries`);
    }

    // Calculate statistics
    const labelCounts = {};
    const totalProcessed = filteredData.length;

    filteredData.forEach(entry => {
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
    const recentEntries = filteredData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(entry => ({
        id: entry.id,
        payload: entry.payload,
        labels: entry.labels || [],
        timestamp: entry.created_at
      }));

    const stats = {
      totalProcessed,
      labelCounts,
      labelPercentages,
      lastUpdated: new Date().toISOString(),
      recentEntries
    };

    console.log(`[MemoryStore] Statistics calculated:`, {
      totalProcessed: stats.totalProcessed,
      labelCounts: stats.labelCounts,
      recentEntriesCount: stats.recentEntries.length
    });

    return stats;
  },

  // Debug info
  getDebugInfo() {
    return {
      rulesCount: rules.length,
      processedDataCount: processedData.length,
      lastProcessedEntry: processedData[processedData.length - 1] || null,
      timestamp: new Date().toISOString()
    };
  }
};

// Rule evaluation utilities
export function evaluateCondition(data, condition) {
  const { key, operator, value } = condition;
  const dataValue = data[key];
  
  if (dataValue === undefined) return false;
  
  const numericValue = parseFloat(value);
  const numericDataValue = parseFloat(dataValue);
  
  switch (operator) {
    case '=':
      return String(dataValue).toLowerCase() === String(value).toLowerCase();
    case '!=':
      return String(dataValue).toLowerCase() !== String(value).toLowerCase();
    case '<':
      return !isNaN(numericDataValue) && !isNaN(numericValue) && numericDataValue < numericValue;
    case '>':
      return !isNaN(numericDataValue) && !isNaN(numericValue) && numericDataValue > numericValue;
    case '<=':
      return !isNaN(numericDataValue) && !isNaN(numericValue) && numericDataValue <= numericValue;
    case '>=':
      return !isNaN(numericDataValue) && !isNaN(numericValue) && numericDataValue >= numericValue;
    default:
      return false;
  }
}

export function evaluateRule(data, rule) {
  if (!rule.enabled) return false;
  
  function evaluateGroup(group) {
    if (group.type === 'condition') {
      return evaluateCondition(data, group);
    }
    
    if (group.type === 'group') {
      const results = group.conditions.map(evaluateGroup);
      return group.operator === 'AND' 
        ? results.every(Boolean)
        : results.some(Boolean);
    }
    
    return false;
  }
  
  return evaluateGroup(rule.conditions);
}