import { Statistics } from '../types/Statistics';

const API_BASE = '/api';

export const statisticsService = {
  async getStatistics(filters: { label?: string; from?: string; to?: string } = {}): Promise<Statistics> {
    const params = new URLSearchParams();
    if (filters.label) params.append('label', filters.label);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);

    const response = await fetch(`${API_BASE}/statistics?${params}`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  }
};