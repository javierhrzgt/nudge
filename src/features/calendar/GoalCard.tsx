import { Card, Group, Text, Badge } from "@mantine/core";

interface GoalCardProps {
  title: string;
  minutes: number;
  color: string;
}

export default function GoalCard({
  title,
  minutes,
  color,
}: Readonly<GoalCardProps>) {
  return (
    <Card withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Text lineClamp={1}>{title}</Text>
        <Badge variant="light" flex="none" color={color}>
          {minutes} min
        </Badge>
      </Group>
    </Card>
  );
}
