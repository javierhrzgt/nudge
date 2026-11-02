import { isValid, parseISO } from "date-fns";
import type { Settings } from "../agenda/types";

export function validateSettings(values: Settings): string[] {
  const errors: string[] = [];

  if (values.workDays.length === 0) {
    errors.push("Elige al menos un día de trabajo");
  }

  if (
    values.workDays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
  ) {
    errors.push("Los días deben estar entre domingo y sábado");
  }

  if (
    !Number.isInteger(values.dailyMinutes) ||
    values.dailyMinutes < 1 ||
    values.dailyMinutes > 720
  ) {
    errors.push("Los minutos diarios deben ser un número entero entre 1 y 720");
  }

  if (
    !isValid(parseISO(values.startDate)) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(values.startDate)
  ) {
    errors.push("Selecciona una fecha valida");
  }
  return errors;
}
