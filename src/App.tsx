import { useEffect, useState } from "react";
import { Button, Container, Text, Stack } from "@mantine/core";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";
import Perfil from "./features/profile/Perfil";
import Tareas from "./features/tasks/Tareas";
import LoginForm from "./features/auth/LoginForm";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function cargarSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(`Error al obtener sesión: ${error.message}`);
        setSession(data.session);
      } catch (error) {
        console.warn(error);
      }
    }
    cargarSession();
    const { data } = supabase.auth.onAuthStateChange((_e, newSession) => {
      setSession(newSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <Container size="xs" py="xl">
      <Stack>
        <Text>{session ? "Hay sesión" : "No hay sesión"}</Text>
        {!session && <LoginForm />}
        {session && (
          <Stack>
            <Perfil userId={session.user.id} />
            <Tareas userId={session.user.id} />
            <Button
              onClick={() => {
                supabase.auth.signOut();
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
