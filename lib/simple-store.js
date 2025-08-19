// Simple in-memory store that works within a single function execution
let store = {
  rules: [
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
  ],
  processedData: []
};

// Global store that persists across requests in the same container
if (!global.dataStore) {
  global.dataStore = { ...store };
  console.log('[SimpleStore] Initialized global store with default data');
}

export const simpleStore = {
  getRules() {
    console.log(`[SimpleStore] Getting ${global.dataStore.rules.length} rules`);
    return global.dataStore.rules;
  },

  addRule(rule) {
    const newRule = { ...rule, id: `rule-${Date.now()}` };
    global.dataStore.rules.push(newRule);
    global.dataStore.rules.sort((a, b) => b.priority - a.priority);
    console.log(`[SimpleStore] Added rule: ${newRule.name}, total: ${global.dataStore.rules.length}`);
    return newRule;
  },

  updateRule(id, updates) {
    const index = global.dataStore.rules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    
    global.dataStore.rules[index] = { 
      ...global.dataStore.rules[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    global.dataStore.rules.sort((a, b) => b.priority - a.priority);
    console.log(`[SimpleStore] Updated rule: ${id}`);
    return global.dataStore.rules[index];
  },

  deleteRule(id) {
    const index = global.dataStore.rules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    
    global.dataStore.rules.splice(index, 1);
    console.log(`[SimpleStore] Deleted rule: ${id}, remaining: ${global.dataStore.rules.length}`);
  },

  addProcessedEntry(entry) {
    global.dataStore.processedData.push(entry);
    console.log(`[SimpleStore] Added processed entry: ${entry.id}, total: ${global.dataStore.processedData.length}`);
    console.log(`[SimpleStore] Entry labels: [${entry.labels.join(', ')}]`);
    return entry;
  },

  getProcessedData() {
    console.log(`[SimpleStore] Getting ${global.dataStore.processedData.length} processed entries`);
    return global.dataStore.processedData;
  },

  getStatistics(filters = {}) {
    const data = global.dataStore.processedData;
    console.log(`[SimpleStore] Calculating statistics from ${data.length} entries`);
    
    let filteredData = [...data];
    
    // Apply date filters
    if (filters.from || filters.to) {
      const fromDate = filters.from ? new Date(filters.from) : new Date(0);
      const toDate = filters.to ? new Date(filters.to) : new Date();
      
      filteredData = data.filter(entry => {
        const entryDate = new Date(entry.created_at);
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }
    
    // Apply label filter
    if (filters.label) {
      filteredData = filteredData.filter(entry => 
        entry.labels && Array.isArray(entry.labels) && entry.labels.includes(filters.label)
      );
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
    
    console.log(`[SimpleStore] Statistics calculated:`, {
      totalProcessed: stats.totalProcessed,
      labelCounts: stats.labelCounts,
      recentEntriesCount: stats.recentEntries.length
    });
    
    return stats;
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