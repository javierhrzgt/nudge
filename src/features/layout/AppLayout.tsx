import {
  Button,
  AppShell,
  Group,
  Container,
  Stack,
  NavLink,
} from "@mantine/core";
import { supabase } from "../../lib/supabase";
import Perfil from "../profile/Perfil";
import { Outlet, NavLink as RouterNavLink } from "react-router";
import { navItems } from "./navItems";

interface AppLayoutProps {
  userId: string;
}

export default function AppLayout({ userId }: Readonly<AppLayoutProps>) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Perfil userId={userId} />
          <Group visibleFrom="sm" wrap="nowrap" gap="xs">
            {navItems.map((item) => (
              <NavLink
                w="auto"
                variant="light"
                style={{ borderRadius: "var(--mantine-radius-sm)" }}
                key={item.label}
                label={item.label}
                renderRoot={({ className, ...others }) => (
                  <RouterNavLink
                    to={item.to}
                    className={className}
                    {...others}
                  />
                )}
              />
            ))}
          </Group>
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
