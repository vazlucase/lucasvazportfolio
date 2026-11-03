export type Period = '30d' | '3m' | '1y';
export interface Metric { value: number; previous: number; change: number | null }
export interface Breakdown { name: string; value: number; percentage?: number }
export interface DailyPoint { date: string; available: boolean; views: number; visitors: number; sessions: number; contacts: number; activeSeconds: number; previousViews: number }
export interface AnalyticsSession { authenticated: boolean; configured: boolean; local: boolean; storage: 'local' | 'redis' | null }
export interface AnalyticsReport {
  period: Period;
  range: { start: number; end: number; previousStart: number; previousEnd: number; days: number };
  meta: { startedAt: number; totalViews: number; updatedAt: number; lastEventAt: number | null; storage: 'local' | 'redis'; local: boolean; timezone: string; historyDays: number; comparisonComplete: boolean };
  metrics: Record<'views' | 'visitors' | 'sessions' | 'engagementRate' | 'avgActiveSeconds' | 'contacts' | 'contactRate' | 'projects' | 'completionRate', Metric>;
  daily: DailyPoint[];
  breakdowns: Record<'sources' | 'devices' | 'browsers' | 'pages' | 'projects' | 'sections' | 'contacts' | 'hours' | 'visitorTypes', Breakdown[]>;
  realtime: { activeVisitors: number; viewsToday: number; recent: { id: string; type: string; label: string; at: number; source: string; device: string }[] };
  insights: { tone: string; title: string; text: string }[];
}
