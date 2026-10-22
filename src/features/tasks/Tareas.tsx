import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import {
  Card,
  Stack,
  Text,
  Title,
  Badge,
  Group,
  Progress,
} from "@mantine/core";
import { calculatePercentage } from "../../lib/progress";

interface TareasProps {
  userId: string;
}

export default function Tareas({ userId }: Readonly<TareasProps>) {
  const { data, isPending, error } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id,title,position,goals(id,title,est_minutes,position,completed_on)",
        )
        .is("archived_at", null)
        .is("goals.archived_at", null)
        .order("position")
        .order("position", { referencedTable: "goals" });

      if (error) throw new Error(error.message);

      return data;
    },
  });

  if (isPending) return <Text>Cargando...</Text>;
  if (error) return <Text>{error.message}</Text>;
  if (data.length === 0) return <Text>Aún no tienes tareas</Text>;

  const allGoals = data.flatMap((t) => t.goals);
  const totalGlobal = allGoals.length;
  const completedGlobal = allGoals.filter((g) => g.completed_on).length;
  const percentageGlobal = calculatePercentage({
    completed: completedGlobal,
    total: totalGlobal,
  });

  return (
    <>
      <Card>
        <Stack>
          <Group justify={"space-between"}>
            <Title order={4}>Progreso total</Title>
            <Text>{`${completedGlobal} de ${totalGlobal} meta(s)`}</Text>
          </Group>
          <Progress value={percentageGlobal} />
        </Stack>
      </Card>
      {data.map((t) => {
        const total = t.goals.length;
        const completed = t.goals.filter((g) => g.completed_on).length;
        const percentage = calculatePercentage({ completed, total });
        return (
          <Card key={t.id}>
            <Stack>
              <Group justify={"space-between"}>
                <Title order={4}>{t.title}</Title>
                <Text>{`${completed} de ${total} meta(s)`}</Text>
              </Group>
              <Progress value={percentage} />
              {total === 0 ? (
                <Text>Sin metas</Text>
              ) : (
                <Stack gap={"xs"}>
                  {t.goals.map((g) => (
                    <Group key={g.id}>
                      <Title order={5}>
                        {g.title} {g.completed_on && <Badge>Hecha</Badge>}
                      </Title>
                      <Text>{g.est_minutes} min</Text>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>
        );
      })}
    </>
  );
}
