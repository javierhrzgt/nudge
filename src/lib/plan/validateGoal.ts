import { MAX_GOAL_MINUTES } from "../limits";
import { validateTask } from "./validateTask";

export function validateGoal(
  title: string,
  estMinutes: number | null,
): string[] {
  const errors: string[] = [...validateTask(title)];

  if (estMinutes === null) {
    errors.push("Indica cuántos minutos dura la meta");
  } else if (
    !Number.isInteger(estMinutes) ||
    estMinutes < 1 ||
    estMinutes > MAX_GOAL_MINUTES
  ) {
    errors.push(
      `La duración debe ser un número entero entre 1 y ${MAX_GOAL_MINUTES} minutos`,
    );
  }
  return errors;
}
