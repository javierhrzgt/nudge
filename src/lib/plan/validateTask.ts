import { MAX_TITLE_LENGTH } from "../limits";

export function validateTask(title: string): string[] {
  const errors: string[] = [];
  const length = title.trim().length;
  if (length === 0) {
    errors.push("El título no puede estar vacío");
  }

  if (length > MAX_TITLE_LENGTH) {
    errors.push(
      `El título no puede tener más de ${MAX_TITLE_LENGTH} caracteres`,
    );
  }

  return errors;
}
