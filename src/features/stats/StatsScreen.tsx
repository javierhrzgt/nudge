import { Tabs, Text } from "@mantine/core";
import SummaryTab from "./SummaryTab";

interface StatsScreenProps {
  userId: string;
}

export default function StatsScreen({ userId }: Readonly<StatsScreenProps>) {
  return (
    <Tabs defaultValue="summary">
      <Tabs.List>
        <Tabs.Tab value="summary">Resumen</Tabs.Tab>
        <Tabs.Tab value="history">Historial</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="summary">
        <SummaryTab userId={userId} />
      </Tabs.Panel>
      <Tabs.Panel value="history">
        <Text>Este es el historial (pendiente)</Text>
      </Tabs.Panel>
    </Tabs>
  );
}
