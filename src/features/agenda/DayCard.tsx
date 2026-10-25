import { Card, Stack, Text } from "@mantine/core";
import type { AgendaDay } from "../../lib/agenda/types";

interface GoalInfo {
  id: string;
  title: string;
  est_minutes: number;
}

interface DayCardProps {
  day: AgendaDay;
  allGoals: GoalInfo[];
}

export default function DayCard({ day, allGoals }: Readonly<DayCardProps>) {
  return (
    <Card withBorder>
      <Stack gap={"xs"}>
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
    </Card>
  );
}
