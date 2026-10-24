import { Loader, Stack, Text } from "@mantine/core";
import { useAgenda } from "./useAgenda";
import { useTasks } from "../tasks/useTasks";

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

  return (
    <Stack>
      <Text>{res.today}</Text>
      {res.agenda.map((day) => (
        <Stack key={day.date} gap={"xs"}>
          <Text>{day.date}</Text>
          {day.goalIds.map((id) => {
            const goal = allGoals.find((g) => g.id === id);
            if (!goal) return null;
            return (
              <Text key={id}>
                {goal.title} · {goal.est_minutes} min
              </Text>
            );
          })}
        </Stack>
      ))}
    </Stack>
  );
}
