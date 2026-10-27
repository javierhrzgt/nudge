import { Card, Checkbox, Stack, Text } from "@mantine/core";
import type { AgendaDay } from "../../lib/agenda/types";
import { formatDay } from "../../lib/agenda/formatDay";

interface GoalInfo {
  id: string;
  title: string;
  est_minutes: number;
}

interface DayCardProps {
  day: AgendaDay;
  allGoals: GoalInfo[];
  onComplete?: (goalId: string) => void;
  completingGoalId?: string | null;
}

export default function DayCard({
  day,
  allGoals,
  onComplete,
  completingGoalId,
}: Readonly<DayCardProps>) {
  return (
    <Card withBorder>
      <Stack gap={"xs"}>
        <Text fw={600}>{formatDay(day.date)}</Text>
        {day.goalIds.map((id) => {
          const goal = allGoals.find((g) => g.id === id);
          if (!goal) return null;
          return onComplete ? (
            <Checkbox
              key={goal.id}
              label={`${goal.title} · ${goal.est_minutes} min`}
              checked={false}
              disabled={completingGoalId === goal.id}
              onChange={() => onComplete(goal.id)}
            />
          ) : (
            <Text key={goal.id}>
              {goal.title} · {goal.est_minutes} min
            </Text>
          );
        })}
      </Stack>
    </Card>
  );
}
