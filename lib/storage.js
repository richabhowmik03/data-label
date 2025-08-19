import { promises as fs } from 'fs';
import path from 'path';

// Use /tmp directory which is writable in Vercel
const DATA_DIR = '/tmp';
const RULES_FILE = path.join(DATA_DIR, 'rules.json');
const PROCESSED_DATA_FILE = path.join(DATA_DIR, 'processed_data.json');

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

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read data from file with fallback
async function readJsonFile(filePath, defaultData = []) {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`[Storage] File ${filePath} not found, using default data`);
    return defaultData;
  }
}

// Write data to file
async function writeJsonFile(filePath, data) {
  try {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`[Storage] Successfully wrote to ${filePath}`);
  } catch (error) {
    console.error(`[Storage] Error writing to ${filePath}:`, error);
    throw error;
  }
}

// Storage operations
export const storage = {
  async getRules() {
    console.log('[Storage] Getting rules...');
    const rules = await readJsonFile(RULES_FILE, DEFAULT_RULES);
    console.log(`[Storage] Found ${rules.length} rules`);
    return rules;
  },

  async saveRules(rules) {
    console.log(`[Storage] Saving ${rules.length} rules...`);
    await writeJsonFile(RULES_FILE, rules);
  },

  async getProcessedData() {
    console.log('[Storage] Getting processed data...');
    const data = await readJsonFile(PROCESSED_DATA_FILE, []);
    console.log(`[Storage] Found ${data.length} processed entries`);
    return data;
  },

  async saveProcessedData(data) {
    console.log(`[Storage] Saving ${data.length} processed entries...`);
    await writeJsonFile(PROCESSED_DATA_FILE, data);
  },

  async addProcessedEntry(entry) {
    console.log('[Storage] Adding processed entry:', entry.id);
    const data = await this.getProcessedData();
    data.push(entry);
    await this.saveProcessedData(data);
    console.log(`[Storage] Total processed entries: ${data.length}`);
    return entry;
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