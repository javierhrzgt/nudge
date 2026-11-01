import { addMinutes, isAfter } from "date-fns";

export function validateManualSession(
  startedAt: Date | null,
  duration: number | null,
  now: Date,
): string[] {
  const errors: string[] = [];
  const limit = addMinutes(now, 5);

  if (startedAt === null) {
    errors.push("Elige la fecha y la hora de inicio");
  } else if (isAfter(startedAt, limit)) {
    errors.push("La sesión no puede empezar en el futuro");
  }

  if (duration === null) {
    errors.push("Indica cuántos minutos duró la sesión");
  } else if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
    errors.push("La duración debe ser un número entero entre 1 y 1440 minutos");
  }

  return errors;
}
