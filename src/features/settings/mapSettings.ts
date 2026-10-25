import type { UserSettings } from "../../lib/agenda/types";

interface SettingsRow {
  work_days: number[];
  daily_minutes: number;
  start_date: string;
  timezone: string;
}

export function mapSettingsRow({
  work_days,
  daily_minutes,
  start_date,
  timezone,
}: SettingsRow): UserSettings {
  return {
    workDays: work_days,
    dailyMinutes: daily_minutes,
    startDate: start_date,
    timezone,
  };
}
