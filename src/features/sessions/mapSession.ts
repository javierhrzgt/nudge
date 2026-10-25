import type { StudySession } from "../../lib/agenda/types";

interface SessionRow {
  id: string;
  started_at: string;
  local_date: string;
}

export function mapSession(row: SessionRow | null): StudySession | null {
  if (row === null) {
    return null;
  }
  return { id: row.id, startedAt: row.started_at, localDate: row.local_date };
}
