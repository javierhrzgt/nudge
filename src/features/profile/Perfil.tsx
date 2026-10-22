import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import {
  Text,
  Stack,
  Title,
  Center,
  Loader,
  Group,
  Badge,
} from "@mantine/core";

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
    <Stack>
      <Group>
        <Title>{data.display_name}</Title>
        <Badge>{data.role}</Badge>
      </Group>
    </Stack>
  );
}
