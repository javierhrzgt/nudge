import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { Text, Title, Center, Loader, Group, Badge } from "@mantine/core";

interface PerfilProps {
  userId: string;
}

export default function Perfil({ userId }: Readonly<PerfilProps>) {
  const { data, isPending, error } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name,role")
        .eq("id", userId)
        .single();

      if (error) throw new Error(error.message);

      return data;
    },
  });

  if (isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (error) return <Text>{error.message}</Text>;
  return (
    <Group gap={"xs"} wrap="nowrap">
      <Title order={4} miw={0} lineClamp={1}>
        {data.display_name}
      </Title>
      <Badge size="xs" flex={"none"}>
        {data.role}
      </Badge>
    </Group>
  );
}
