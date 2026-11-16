import { Alert, Center, Loader, Paper, Stack, Text } from "@mantine/core";
import { BarChart } from "@mantine/charts";
import { groupByDay } from "../../lib/stats/groupByDay";
import { useSessions } from "../sessions/useSessions";
import { toPaceSessions } from "../../lib/stats/toPaceSessions";
import { calculateTotals } from "../../lib/stats/calculateTotals";
import { calculatePace } from "../../lib/stats/calculatePace";
import { classifyPace } from "../../lib/stats/classifyPace";
import type { PaceStatus } from "../../lib/stats/types";
import { formatShortDay } from "../../lib/agenda/formatShortDay";
import { formatDay } from "../../lib/agenda/formatDay";

interface SummaryTabProps {
  userId: string;
}

const paceLabels: Record<PaceStatus, string> = {
  "on-track": "vas según lo estimado",
  slower: "tardas más de lo estimado",
  faster: "tardas menos de lo estimado",
};

export default function SummaryTab({ userId }: Readonly<SummaryTabProps>) {
  const sessionsQuery = useSessions(userId);
  if (sessionsQuery.isPending)
    return (
      <Center mt="md">
        <Loader />
      </Center>
    );

  if (sessionsQuery.isError)
    return (
      <Center mt="md">
        <Alert color="red">No se pudieron cargar las sesiones</Alert>
      </Center>
    );

  if (sessionsQuery.data.length === 0)
    return (
      <Text mt="md" ta="center">
        Aún no hay sesiones registradas
      </Text>
    );

  const paceSessions = toPaceSessions(sessionsQuery.data);
  const totals = calculateTotals(paceSessions);
  const pace = calculatePace(paceSessions);

  const paceText =
    pace === null
      ? "sin datos (ninguna sesión tiene metas)"
      : `${pace.toFixed(2)} (${paceLabels[classifyPace(pace)]})`;

  const days = groupByDay(sessionsQuery.data);

  return (
    <Stack mt="md">
      <Text>Tiempo real: {totals.realMinutes} min</Text>
      <Text>Tiempo estimado: {totals.estimatedMinutes} min</Text>
      <Text>Sesiones cerradas: {sessionsQuery.data.length}</Text>
      <Text>Ritmo: {paceText}</Text>
      <Paper withBorder p="md" radius="md">
        <Text fw={700}>Minutos por día</Text>
        <BarChart
          mt="xl"
          h={250}
          data={days}
          dataKey="date"
          series={[{ name: "minutes", label: "Minutos", color: "blue.6" }]}
          xAxisProps={{ tickFormatter: (date) => formatShortDay(date) }}
          tooltipProps={{
            labelFormatter: (date) =>
              typeof date === "string" ? formatDay(date) : date,
          }}
        />
      </Paper>
    </Stack>
  );
}
