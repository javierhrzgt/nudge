import { activeDay } from "../../lib/agenda/activeDay";
import { generarAgenda } from "../../lib/agenda/agenda";
import { useOpenSession } from "../sessions/useOpenSession";
import { useSettings } from "../settings/useSettings";
import { mapTasks } from "../tasks/mapTasks";
import { useTasks } from "../tasks/useTasks";

export function useAgenda(userId: string) {
  const settings = useSettings(userId);
  const tasks = useTasks(userId);
  const openSession = useOpenSession(userId);

  if (settings.isPending || tasks.isPending || openSession.isPending) {
    return { status: "pending" as const };
  }

  const error = settings.error ?? tasks.error ?? openSession.error;
  if (error) {
    return { status: "error" as const, error };
  }

  if (!settings.data || !tasks.data) {
    return { status: "pending" as const };
  }

  const today = activeDay(
    new Date(),
    settings.data.timezone,
    openSession.data ?? null,
  );

  const mappedTasks = mapTasks(tasks.data);
  const agenda = generarAgenda(mappedTasks, settings.data, today);

  return { status: "ready" as const, tasks: mappedTasks, agenda, today };
}
