import { Tabs } from "@mantine/core";
import SummaryTab from "./SummaryTab";
import HistoryTab from "./HistoryTab";

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
        <HistoryTab userId={userId} />
      </Tabs.Panel>
    </Tabs>
  );
}
