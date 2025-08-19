import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let isSupabaseConfigured = false;

// Check if Supabase is properly configured
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    isSupabaseConfigured = true;
    console.log('[Supabase] Successfully configured');
  } catch (error) {
    console.error('[Supabase] Configuration error:', error);
    isSupabaseConfigured = false;
  }
} else {
  console.warn('[Supabase] Environment variables not found, using fallback mode');
  isSupabaseConfigured = false;
}

// Fallback in-memory storage for when Supabase is not configured
// Use global variables to persist data across function calls in the same container
global.fallbackRules = global.fallbackRules || [
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

global.fallbackProcessedData = global.fallbackProcessedData || [];

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

// Database operations with fallback
export const db = {
  async getRules() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rules')
          .select('*')
          .order('priority', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[DB] Error fetching rules from Supabase:', error);
        console.log('[DB] Falling back to in-memory storage');
        return fallbackRules;
      }
    }
    return global.fallbackRules;
  },

  async createRule(rule) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rules')
          .insert([rule])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[DB] Error creating rule in Supabase:', error);
        // Fallback to in-memory
        const newRule = {
          ...rule,
          id: `rule-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        global.fallbackRules.push(newRule);
        return newRule;
      }
    }
    
    const newRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    global.fallbackRules.push(newRule);
    return newRule;
  },

  async updateRule(id, updates) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('rules')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('[DB] Error updating rule in Supabase:', error);
        // Fallback to in-memory
        const ruleIndex = global.fallbackRules.findIndex(r => r.id === id);
        if (ruleIndex !== -1) {
          global.fallbackRules[ruleIndex] = { ...global.fallbackRules[ruleIndex], ...updates, updated_at: new Date().toISOString() };
          return global.fallbackRules[ruleIndex];
        }
        throw new Error('Rule not found');
      }
    }
    
    const ruleIndex = global.fallbackRules.findIndex(r => r.id === id);
    if (ruleIndex !== -1) {
      global.fallbackRules[ruleIndex] = { ...global.fallbackRules[ruleIndex], ...updates, updated_at: new Date().toISOString() };
      return global.fallbackRules[ruleIndex];
    }
    throw new Error('Rule not found');
  },

  async deleteRule(id) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('rules')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return;
      } catch (error) {
        console.error('[DB] Error deleting rule from Supabase:', error);
        // Fallback to in-memory
        const ruleIndex = global.fallbackRules.findIndex(r => r.id === id);
        if (ruleIndex !== -1) {
          global.fallbackRules.splice(ruleIndex, 1);
        }
        return;
      }
    }
    
    const ruleIndex = global.fallbackRules.findIndex(r => r.id === id);
    if (ruleIndex !== -1) {
      global.fallbackRules.splice(ruleIndex, 1);
    }
  },

  async processData(payload, labels) {
    const processedEntry = {
      id: `entry-${Date.now()}`,
      payload,
      labels,
      created_at: new Date().toISOString()
    };

    console.log('[DB] Processing data entry:', processedEntry);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('processed_data')
          .insert([processedEntry])
          .select()
          .single();
        
        if (error) throw error;
        console.log('[DB] Stored in Supabase:', data);
        return data;
      } catch (error) {
        console.error('[DB] Error storing processed data in Supabase:', error);
        // Fallback to in-memory
        global.fallbackProcessedData.push(processedEntry);
        console.log('[DB] Stored in fallback:', processedEntry);
        return processedEntry;
      }
    }
    
    global.fallbackProcessedData.push(processedEntry);
    console.log('[DB] Stored in fallback (no Supabase):', processedEntry);
    console.log('[DB] Total fallback entries:', global.fallbackProcessedData.length);
    return processedEntry;
  },

  async getProcessedData(filters = {}) {
    console.log('[DB] Getting processed data with filters:', filters);
    
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('processed_data')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters.from) {
          query = query.gte('created_at', filters.from);
        }
        if (filters.to) {
          query = query.lte('created_at', filters.to);
        }

        const { data, error } = await query;
        if (error) throw error;
        console.log('[DB] Retrieved from Supabase:', data?.length || 0, 'entries');
        return data;
      } catch (error) {
        console.error('[DB] Error fetching processed data from Supabase:', error);
        console.log('[DB] Falling back to in-memory data:', global.fallbackProcessedData.length, 'entries');
        return global.fallbackProcessedData;
      }
    }
    
    console.log('[DB] Using fallback data:', global.fallbackProcessedData.length, 'entries');
    return global.fallbackProcessedData;
  }
};

export { supabase, isSupabaseConfigured };