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
import { useMediaQuery } from "@mantine/hooks";

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
            {navItems.map((item) => (
              <NavLink
                py={6}
                px="xl"
                w="auto"
                variant="light"
                style={{ borderRadius: "var(--mantine-radius-lg)" }}
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
          {navItems.map((item) => (
            <NavLink
              w="auto"
              variant="filled"
              style={{
                borderRadius: "var(--mantine-radius-xl)",
              }}
              styles={{ body: { textAlign: "center" } }}
              key={item.label}
              label={item.label}
              renderRoot={({ className, ...others }) => (
                <RouterNavLink to={item.to} className={className} {...others} />
              )}
            />
          ))}
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
