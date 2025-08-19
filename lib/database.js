import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('[Database] Supabase credentials not found, using fallback');
      return null;
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Database] Supabase client initialized');
  }
  
  return supabase;
}

// Fallback in-memory store for when Supabase is not available
let fallbackRules = [
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

let fallbackProcessedData = [];

export const database = {
  // Rules operations
  async getRules() {
    const client = getSupabaseClient();
    
    if (client) {
      try {
        console.log('[Database] Fetching rules from Supabase');
        const { data, error } = await client
          .from('rules')
          .select('*')
          .order('priority', { ascending: false });
        
        if (error) throw error;
        
        console.log(`[Database] Found ${data.length} rules in Supabase`);
        return data;
      } catch (error) {
        console.error('[Database] Error fetching rules from Supabase:', error);
      }
    }
    
    console.log(`[Database] Using fallback rules: ${fallbackRules.length}`);
    return fallbackRules;
  },

  async createRule(rule) {
    const client = getSupabaseClient();
    
    if (client) {
      try {
        console.log('[Database] Creating rule in Supabase:', rule.name);
        const { data, error } = await client
          .from('rules')
          .insert([rule])
          .select()
          .single();
        
        if (error) throw error;
        
        console.log('[Database] Created rule in Supabase:', data.id);
        return data;
      } catch (error) {
        console.error('[Database] Error creating rule in Supabase:', error);
      }
    }
    
    // Fallback
    const newRule = { ...rule, id: `rule-${Date.now()}` };
    fallbackRules.push(newRule);
    fallbackRules.sort((a, b) => b.priority - a.priority);
    console.log('[Database] Created rule in fallback store:', newRule.id);
    return newRule;
  },

  async updateRule(id, updates) {
    const client = getSupabaseClient();
    
    if (client) {
      try {
        console.log('[Database] Updating rule in Supabase:', id);
        const { data, error } = await client
          .from('rules')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        console.log('[Database] Updated rule in Supabase:', data.id);
        return data;
      } catch (error) {
        console.error('[Database] Error updating rule in Supabase:', error);
      }
    }
    
    // Fallback
    const index = fallbackRules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    
    fallbackRules[index] = { 
      ...fallbackRules[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    fallbackRules.sort((a, b) => b.priority - a.priority);
    console.log('[Database] Updated rule in fallback store:', id);
    return fallbackRules[index];
  },

  async deleteRule(id) {
    const client = getSupabaseClient();
    
    if (client) {
      try {
        console.log('[Database] Deleting rule from Supabase:', id);
        const { error } = await client
          .from('rules')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        console.log('[Database] Deleted rule from Supabase:', id);
        return;
      } catch (error) {
        console.error('[Database] Error deleting rule from Supabase:', error);
      }
    }
    
    // Fallback
    const index = fallbackRules.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Rule not found');
    
    fallbackRules.splice(index, 1);
    console.log('[Database] Deleted rule from fallback store:', id);
  },

  // Processed data operations
  async addProcessedEntry(entry) {
    const client = getSupabaseClient();
    
    if (client) {
      try {
        console.log('[Database] Adding processed entry to Supabase:', entry.id);
        const { data, error } = await client
          .from('processed_data')
          .insert([{
            id: entry.id,
            payload: entry.payload,
            labels: entry.labels,
            created_at: entry.created_at
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        console.log('[Database] Added processed entry to Supabase:', data.id);
        return data;
      } catch (error) {
        console.error('[Database] Error adding processed entry to Supabase:', error);
      }
    }
    
    // Fallback
    fallbackProcessedData.push(entry);
    console.log(`[Database] Added processed entry to fallback store: ${entry.id}, total: ${fallbackProcessedData.length}`);
    return entry;
  },

  async getStatistics(filters = {}) {
    const client = getSupabaseClient();
    
    if (client) {
      try {
        console.log('[Database] Fetching statistics from Supabase with filters:', filters);
        
        let query = client.from('processed_data').select('*');
        
        // Apply filters
        if (filters.from) {
          query = query.gte('created_at', filters.from);
        }
        if (filters.to) {
          query = query.lte('created_at', filters.to);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        let filteredData = data;
        
        // Apply label filter (can't do this in SQL easily with arrays)
        if (filters.label) {
          filteredData = data.filter(entry => 
            entry.labels && entry.labels.includes(filters.label)
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
        const recentEntries = filteredData.slice(0, 10).map(entry => ({
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
        
        console.log(`[Database] Supabase statistics:`, {
          totalProcessed: stats.totalProcessed,
          labelCounts: stats.labelCounts,
          recentEntriesCount: stats.recentEntries.length
        });
        
        return stats;
      } catch (error) {
        console.error('[Database] Error fetching statistics from Supabase:', error);
      }
    }
    
    // Fallback statistics
    console.log(`[Database] Calculating fallback statistics from ${fallbackProcessedData.length} entries`);
    
    let filteredData = [...fallbackProcessedData];
    
    // Apply date filters
    if (filters.from || filters.to) {
      const fromDate = filters.from ? new Date(filters.from) : new Date(0);
      const toDate = filters.to ? new Date(filters.to) : new Date();
      
      filteredData = fallbackProcessedData.filter(entry => {
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
    
    console.log(`[Database] Fallback statistics:`, {
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