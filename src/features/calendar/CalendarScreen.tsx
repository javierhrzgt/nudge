import { Center, Indicator, Loader, Stack, Text, Title } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useAgenda } from "../agenda/useAgenda";
import { useTasks } from "../tasks/useTasks";
import { getDayMarks } from "../../lib/agenda/dayMarks";
import { mapTasks } from "../tasks/mapTasks";
import dayjs from "dayjs";
import type { DayMark } from "../../lib/agenda/types";

const markColors: Record<DayMark, string> = {
  done: "green",
  pending: "blue",
  partial: "yellow",
};

interface CalendarScreenProps {
  userId: string;
}

export default function CalendarScreen({
  userId,
}: Readonly<CalendarScreenProps>) {
  const agendaQuery = useAgenda(userId);
  const tasks = useTasks(userId);

  if (agendaQuery.status === "pending" || tasks.isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );

  if (agendaQuery.status === "error")
    return <Text>{agendaQuery.error.message}</Text>;
  if (tasks.isError) return <Text>{tasks.error.message}</Text>;

  const allGoals = mapTasks(tasks.data).flatMap((t) => t.goals);
  const marks = getDayMarks(agendaQuery.agenda, allGoals);

  return (
    <Stack>
      <Title ta="center" order={3}>
        Calendario
      </Title>
      <Calendar
        locale="es"
        highlightToday
        fullWidth
        firstDayOfWeek={0}
        renderDay={(date) => {
          const day = dayjs(date).date();
          const mark = marks[date];
          const color = mark ? markColors[mark] : undefined;
          return (
            <Indicator color={color} size={6} offset={-2} disabled={!mark}>
              <div>{day}</div>
            </Indicator>
          );
        }}
      />
    </Stack>
  );
}
