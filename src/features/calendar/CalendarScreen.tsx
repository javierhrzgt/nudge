import { Center, Indicator, Loader, Stack, Text, Title } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useAgenda } from "../agenda/useAgenda";
import { getDayMarks } from "../../lib/agenda/dayMarks";
import dayjs from "dayjs";
import type { DayMark } from "../../lib/agenda/types";
import { useState } from "react";
import { dayDetail } from "../../lib/agenda/dayDetail";
import { formatDay } from "../../lib/agenda/formatDay";

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
  const [pickedDay, setPickedDay] = useState<string | null>(null);

  if (agendaQuery.status === "pending")
    return (
      <Center>
        <Loader />
      </Center>
    );

  if (agendaQuery.status === "error")
    return <Text>{agendaQuery.error.message}</Text>;

  const selectedDay = pickedDay ?? agendaQuery.today;
  const allGoals = agendaQuery.tasks.flatMap((t) => t.goals);
  const selectedDayDetail = dayDetail(
    selectedDay,
    agendaQuery.agenda,
    allGoals,
  );
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
        getDayProps={(date) => ({
          selected: date === selectedDay,
          onClick: () => setPickedDay(date),
        })}
        renderDay={(date) => {
          const day = dayjs(date).date();
          const mark = marks[date];
          console.log(`mark: ${mark}`);
          const color = mark ? markColors[mark] : undefined;
          const isPendingOnSelected =
            date === selectedDay && mark === "pending";
          return (
            <Indicator
              color={isPendingOnSelected ? "white" : color}
              size={6}
              offset={-4}
              disabled={!mark}
            >
              <div>{day}</div>
            </Indicator>
          );
        }}
      />
      <Stack>
        <Title order={3}>{formatDay(selectedDay)}</Title>
        {selectedDayDetail.goalsCompleted.length === 0 &&
          selectedDayDetail.goalsPending.length === 0 && (
            <Text>Sin metas para este día</Text>
          )}
        {selectedDayDetail.goalsPending.length > 0 && (
          <>
            <Title order={4}>Metas pendientes</Title>
            {selectedDayDetail.goalsPending.map((pending) => (
              <Text key={pending.id}>
                {pending.title} · {pending.estMinutes} min
              </Text>
            ))}
          </>
        )}
        {selectedDayDetail.goalsCompleted.length > 0 && (
          <>
            <Title order={4}>Metas completadas</Title>
            {selectedDayDetail.goalsCompleted.map((completed) => (
              <Text key={completed.id}>
                {completed.title} · {completed.estMinutes} min
              </Text>
            ))}
          </>
        )}
      </Stack>
    </Stack>
  );
}
