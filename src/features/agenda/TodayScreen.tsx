import { Card, Loader, Stack, Text, Title } from "@mantine/core";
import { useAgenda } from "./useAgenda";
import { useTasks } from "../tasks/useTasks";
import DayCard from "./DayCard";

interface TodayScreenProps {
  userId: string;
}

export default function TodayScreen({ userId }: Readonly<TodayScreenProps>) {
  const res = useAgenda(userId);
  const tasks = useTasks(userId);
  const taskList = tasks.data ?? [];

  if (res.status === "pending") return <Loader />;
  if (res.status === "error") return <Text>{res.error.message}</Text>;
  if (taskList.length === 0) return <Text>Aún no tienes tareas</Text>;

  const allGoals = taskList.flatMap((t) => t.goals);
  const todayAgenda = res.agenda.find((t) => t.date === res.today);
  const upcoming = res.agenda.filter((t) => t.date !== res.today);

  return (
    <>
      <Card withBorder>
        <Stack>
          <Title order={3}>Hoy</Title>
          {todayAgenda ? (
            <DayCard day={todayAgenda} allGoals={allGoals} />
          ) : (
            <Card withBorder>
              <Text>Nada programado para hoy</Text>
            </Card>
          )}
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
