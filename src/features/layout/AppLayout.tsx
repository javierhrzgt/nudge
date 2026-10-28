import { Button, AppShell, Group, Container, Stack } from "@mantine/core";
import { supabase } from "../../lib/supabase";
import Perfil from "../profile/Perfil";
import { Outlet } from "react-router";

interface AppLayoutProps {
  userId: string;
}

export default function AppLayout({ userId }: Readonly<AppLayoutProps>) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Perfil userId={userId} />
          <Button
            size="xs"
            onClick={() => {
              void supabase.auth.signOut();
            }}
          >
            Cerrar Sesión
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="xs">
          <Stack>
            <Outlet />
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
