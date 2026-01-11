export type QueryTrend = { month: string; queries: number; resolved: number };
export type Category = { name: string; value: number; color?: string };
export type UserGrowth = { month: string; users: number };

export interface AnalyticsData {
  totalQueries: number;
  queryTrends: QueryTrend[];
  categoryData: Category[];
  activeUsers: number;
  userGrowth: UserGrowth[];
  resolutionRate: string;
  casesResolved: number;
  userSatisfaction: string;
  platformUptime: string;
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch("/api/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}