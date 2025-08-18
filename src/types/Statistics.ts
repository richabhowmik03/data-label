export interface Statistics {
  totalProcessed: number;
  labelCounts: Record<string, number>;
  labelPercentages?: Record<string, number>;
  lastUpdated: string;
  recentEntries?: Array<{
    id: string;
    payload: any;
    labels: string[];
    timestamp: string;
  }>;
}