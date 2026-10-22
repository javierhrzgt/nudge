import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { Text, Stack, Title } from "@mantine/core";

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

  if (isPending) return <Text>Cargando...</Text>;
  if (error) return <Text>{error.message}</Text>;
  return (
    <Stack>
      <Title>{data.display_name}</Title>
      <Text>{data.role}</Text>
    </Stack>
  );
}
