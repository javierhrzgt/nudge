import { Tabs, Text } from "@mantine/core";

export default function StatsScreen() {
  return (
    <Tabs defaultValue="summary">
      <Tabs.List>
        <Tabs.Tab value="summary">Resumen</Tabs.Tab>
        <Tabs.Tab value="history">Historial</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="summary">
        <Text>Este es el resumen (pendiente)</Text>
      </Tabs.Panel>
      <Tabs.Panel value="history">
        <Text>Este es el historial (pendiente)</Text>
      </Tabs.Panel>
    </Tabs>
  );
}
