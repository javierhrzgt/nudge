import { Stack, Title } from "@mantine/core";
import { Calendar } from "@mantine/dates";

export default function CalendarScreen() {
  return (
    <Stack>
      <Title ta="center" order={3}>
        Calendario
      </Title>
      <Calendar locale="es" highlightToday fullWidth firstDayOfWeek={0} />
    </Stack>
  );
}
