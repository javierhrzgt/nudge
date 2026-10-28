import { Button, AppShell, Group, Container, Stack } from "@mantine/core";
import { supabase } from "../../lib/supabase";
import Perfil from "../profile/Perfil";
import { Outlet } from "react-router";
import { navItems } from "./navItems";
import { useMediaQuery } from "@mantine/hooks";
import MainNav from "./MainNav";

interface AppLayoutProps {
  userId: string;
}

export default function AppLayout({ userId }: Readonly<AppLayoutProps>) {
  const isMobile = useMediaQuery("(max-width:47.99em)", true, {
    getInitialValueInEffect: false,
  });
  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      footer={{ height: 60, collapsed: !isMobile }}
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Perfil userId={userId} />
          <Group visibleFrom="sm" wrap="nowrap" gap="xs">
            <MainNav items={navItems} placement="header" />
          </Group>
          <Button
            size="xs"
            onClick={() => {
              void supabase.auth.signOut();
            }}
          >
            Cerrar sesión
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
      <AppShell.Footer>
        <Group grow h={"100%"} px="xs" gap="xs">
          <MainNav items={navItems} placement="footer" />
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
