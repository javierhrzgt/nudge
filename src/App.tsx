import { Button, Container, Stack, Center, Loader } from "@mantine/core";
import { supabase } from "./lib/supabase";
import Perfil from "./features/profile/Perfil";
import Tareas from "./features/tasks/Tareas";
import LoginForm from "./features/auth/LoginForm";
import { useAuth } from "./features/auth/useAuth";

export default function App() {
  const { session, loading } = useAuth();

  if (loading)
    return (
      <Center>
        <Loader />
      </Center>
    );
  return (
    <Container size="xs" py="xl">
      <Stack>
        {!session && <LoginForm />}
        {session && (
          <Stack>
            <Perfil userId={session.user.id} />
            <Tareas userId={session.user.id} />
            <Button
              onClick={() => {
                void supabase.auth.signOut();
              }}
            >
              Cerrar Sesión
            </Button>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
