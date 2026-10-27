import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDay(date: string): string {
  const dateConverted = parseISO(date);
  const dateFormatted = format(dateConverted, "EEEE d 'de' MMMM", {
    locale: es,
  });
  return dateFormatted;
}
