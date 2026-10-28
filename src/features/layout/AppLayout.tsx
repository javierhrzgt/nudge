import { Container, Stack, Button } from "@mantine/core";
import { supabase } from "../../lib/supabase";
import Perfil from "../profile/Perfil";
import { Outlet } from "react-router";

interface AppLayoutProps {
  userId: string;
}

export default function AppLayout({ userId }: Readonly<AppLayoutProps>) {
  return (
    <Container size="xs" py="xl">
      <Stack>
        <Perfil userId={userId} />
        <Outlet />
        <Button
          onClick={() => {
            void supabase.auth.signOut();
          }}
        >
          Cerrar Sesión
        </Button>
      </Stack>
    </Container>
  );
}
