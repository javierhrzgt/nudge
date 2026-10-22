export interface Goal {
  id: string;
  taskId: string;
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
