import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatShortDay(date: string): string {
  const dateConverted = parseISO(date);
  const dateFormatted = format(dateConverted, "d MMM", {
    locale: es,
  });
  return dateFormatted;
}
