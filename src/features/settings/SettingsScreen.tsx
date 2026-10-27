import { Center, Loader, Text } from "@mantine/core";
import { useSettings } from "./useSettings";
import SettingsForm from "./SettingsForm";

interface SettingsScreenProps {
  userId: string;
}

export default function SettingsScreen({
  userId,
}: Readonly<SettingsScreenProps>) {
  const settings = useSettings(userId);

  if (settings.isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );

  if (settings.error) return <Text>{settings.error.message}</Text>;
  if (!settings.data) return <Text>No hay ajustes configurados</Text>;
  return <SettingsForm initial={settings.data} userId={userId} />;
}
