export interface PaceSession {
  durationMinutes: number;
  estimatedMinutes: number;
}

export interface SessionGoal {
  id: string;
  title: string;
  estMinutes: number;
}
export interface ClosedSession {
  id: string;
  startedAt: string;
  localDate: string;
  durationMinutes: number;
  goals: SessionGoal[];
}

export interface Totals {
  realMinutes: number;
  estimatedMinutes: number;
}
