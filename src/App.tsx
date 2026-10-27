import { Routes, Route, Navigate } from "react-router";
import { Button, Container, Stack, Center, Loader } from "@mantine/core";
import { supabase } from "./lib/supabase";
import { useAuth } from "./features/auth/useAuth";
import LoginForm from "./features/auth/LoginForm";
import Perfil from "./features/profile/Perfil";
import Tasks from "./features/tasks/Tasks";
import TodayScreen from "./features/agenda/TodayScreen";
import StartSessionButton from "./features/sessions/StartSessionButton";
import SettingsScreen from "./features/settings/SettingsScreen";

export default function App() {
  const { session, loading } = useAuth();

  if (loading)
    return (
      <Center>
        <Loader />
      </Center>
    );

  if (!session) return <LoginForm />;

  return (
    <Container size="xs" py="xl">
      <Stack>
        <Perfil userId={session.user.id} />
        <Routes>
          <Route path="*" element={<Navigate to="/today" replace />} />
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route
            path="/today"
            element={
              <>
                <StartSessionButton userId={session.user.id} />
                <TodayScreen userId={session.user.id} />
              </>
            }
          />
          <Route path="/tasks" element={<Tasks userId={session.user.id} />} />
          <Route
            path="/settings"
            element={<SettingsScreen userId={session.user.id} />}
          />
        </Routes>
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
