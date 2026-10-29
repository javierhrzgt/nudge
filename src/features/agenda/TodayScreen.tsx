import { Alert, Card, Center, Loader, Stack, Text, Title } from "@mantine/core";
import { useAgenda } from "./useAgenda";
import DayCard from "./DayCard";
import { useSetGoalCompleted } from "../tasks/useSetGoalCompleted";
import { completedOnDay } from "../../lib/agenda/completedOnDay";

interface TodayScreenProps {
  userId: string;
}

export default function TodayScreen({ userId }: Readonly<TodayScreenProps>) {
  const agendaQuery = useAgenda(userId);
  const setCompleted = useSetGoalCompleted(userId);

  if (agendaQuery.status === "pending")
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (agendaQuery.status === "error")
    return <Text>{agendaQuery.error.message}</Text>;
  if (agendaQuery.tasks.length === 0) return <Text>Aún no tienes tareas</Text>;

  const allGoals = agendaQuery.tasks.flatMap((t) => t.goals);
  const todayAgenda = agendaQuery.agenda.find(
    (t) => t.date === agendaQuery.today,
  );
  const upcoming = agendaQuery.agenda.filter(
    (t) => t.date !== agendaQuery.today,
  );
  const { completed, totalMinutes } = completedOnDay(
    agendaQuery.today,
    allGoals,
  );

  let cardContent;
  if (todayAgenda) {
    cardContent = (
      <DayCard
        day={todayAgenda}
        allGoals={allGoals}
        onComplete={(goalId) =>
          setCompleted.mutate({ goalId, date: agendaQuery.today })
        }
        completingGoalId={
          setCompleted.isPending ? setCompleted.variables?.goalId : null
        }
      />
    );
  } else if (completed > 0) {
    cardContent = (
      <Card withBorder>
        <Text>Cumpliste por hoy · {totalMinutes} min</Text>
      </Card>
    );
  } else {
    cardContent = (
      <Card withBorder>
        <Text>Nada programado para hoy</Text>
      </Card>
    );
  }

  return (
    <>
      <Card withBorder>
        <Stack>
          <Title order={3}>Hoy</Title>
          {setCompleted.error && (
            <Alert color="red">{setCompleted.error.message}</Alert>
          )}
          {cardContent}
        </Stack>
      </Card>
      <Card withBorder>
        <Stack>
          <Title order={3}>Próximos días</Title>
          {upcoming.map((day) => (
            <DayCard key={day.date} day={day} allGoals={allGoals} />
          ))}
        </Stack>
      </Card>
    </>
  );
}
