import type { OpenSession } from "../../lib/agenda/types";

interface SessionRow {
  started_at: string;
  local_date: string;
}

export function mapSession(row: SessionRow | null): OpenSession | null {
  if (row === null) {
    return null;
  }
  return { startedAt: row.started_at, localDate: row.local_date };
}
