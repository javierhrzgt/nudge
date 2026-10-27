import {
  Card,
  Stack,
  Text,
  Title,
  Badge,
  Group,
  Progress,
  Center,
  Loader,
  Button,
  Alert,
} from "@mantine/core";
import { calculatePercentage } from "../../lib/progress";
import { useTasks } from "./useTasks";
import { useUnsetGoalCompleted } from "./useUnsetGoalCompleted";

interface TareasProps {
  userId: string;
}

export default function Tareas({ userId }: Readonly<TareasProps>) {
  const { data, isPending, error } = useTasks(userId);
  const unsetGoal = useUnsetGoalCompleted(userId);

  if (isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );
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
      {unsetGoal.error && <Alert color="red">{unsetGoal.error.message}</Alert>}
      <Card withBorder>
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
          <Card key={t.id} withBorder>
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
                    <Group key={g.id} justify={"space-between"}>
                      <Group>
                        {g.completed_on && <Badge>Hecha</Badge>}
                        <Title order={5}>{g.title}</Title>
                        <Text>{g.est_minutes} min</Text>
                      </Group>
                      {g.completed_on && (
                        <Button
                          size={"xs"}
                          variant={"subtle"}
                          onClick={() => unsetGoal.mutate(g.id)}
                          loading={
                            unsetGoal.isPending && unsetGoal.variables === g.id
                          }
                        >
                          Desmarcar
                        </Button>
                      )}
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
