import { Rule } from '../types/Rule';

const API_BASE = '/api';

export const ruleService = {
  async getRules(): Promise<Rule[]> {
    const response = await fetch(`${API_BASE}/rules`);
    if (!response.ok) throw new Error('Failed to fetch rules');
    return response.json();
  },

  async createRule(rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule> {
    const response = await fetch(`${API_BASE}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    if (!response.ok) throw new Error('Failed to create rule');
    return response.json();
  },

  async updateRule(id: string, rule: Partial<Rule>): Promise<Rule> {
    const response = await fetch(`${API_BASE}/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    if (!response.ok) throw new Error('Failed to update rule');
    return response.json();
  },

  async deleteRule(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/rules/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete rule');
  },

  async toggleRule(id: string): Promise<Rule> {
    const response = await fetch(`${API_BASE}/rules/${id}/toggle`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to toggle rule');
    return response.json();
  },

  async processPayload(payload: any): Promise<{ id: string; labels: string[]; timestamp: string }> {
    const response = await fetch(`${API_BASE}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to process payload');
    return response.json();
  }
};