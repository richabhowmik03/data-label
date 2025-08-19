import { Statistics } from '../types/Statistics';

const API_BASE = '/api';

export const statisticsService = {
  async getStatistics(): Promise<Statistics> {
    const response = await fetch(`${API_BASE}/statistics`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  }
};