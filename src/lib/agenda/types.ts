export interface Goal {
  id: string;
  estMinutes: number;
  position: number;
  completedOn: string | null;
}

export interface Settings {
  workDays: number[];
  dailyMinutes: number;
  startDate: string;
}

export interface AgendaDay {
  date: string;
  goalIds: string[];
}

export interface Task {
  id: string;
  position: number;
  goals: Goal[];
}

export interface OpenSession {
  startedAt: string;
  localDate: string;
}
