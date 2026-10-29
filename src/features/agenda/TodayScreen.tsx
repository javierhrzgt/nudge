import { Alert, Card, Center, Loader, Stack, Text, Title } from "@mantine/core";
import { useAgenda } from "./useAgenda";
import { useTasks } from "../tasks/useTasks";
import DayCard from "./DayCard";
import { useSetGoalCompleted } from "../tasks/useSetGoalCompleted";
import { mapTasks } from "../tasks/mapTasks";
import { completedOnDay } from "../../lib/agenda/completedOnDay";

interface TodayScreenProps {
  userId: string;
}

export default function TodayScreen({ userId }: Readonly<TodayScreenProps>) {
  const res = useAgenda(userId);
  const tasks = useTasks(userId);
  const taskList = tasks.data ?? [];
  const setCompleted = useSetGoalCompleted(userId);

  if (res.status === "pending")
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (res.status === "error") return <Text>{res.error.message}</Text>;
  if (taskList.length === 0) return <Text>Aún no tienes tareas</Text>;

  const allGoals = mapTasks(taskList).flatMap((t) => t.goals);
  const todayAgenda = res.agenda.find((t) => t.date === res.today);
  const upcoming = res.agenda.filter((t) => t.date !== res.today);
  const { completed, totalMinutes } = completedOnDay(res.today, allGoals);

  let cardContent;
  if (todayAgenda) {
    cardContent = (
      <DayCard
        day={todayAgenda}
        allGoals={allGoals}
        onComplete={(goalId) =>
          setCompleted.mutate({ goalId, date: res.today })
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
