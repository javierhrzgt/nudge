import { Routes, Route, Navigate } from "react-router";
import { Center, Loader, Stack } from "@mantine/core";
import { useAuth } from "./features/auth/useAuth";
import AppLayout from "./features/layout/AppLayout";
import LoginForm from "./features/auth/LoginForm";
import TodayScreen from "./features/agenda/TodayScreen";
import StartSessionButton from "./features/sessions/StartSessionButton";
import SettingsScreen from "./features/settings/SettingsScreen";
import CalendarScreen from "./features/calendar/CalendarScreen";
import ManualSessionButton from "./features/sessions/ManualSessionButton";
import TasksScreen from "./features/tasks/TasksScreen";
import StatsScreen from "./features/stats/StatsScreen";

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
    <Routes>
      <Route path="*" element={<Navigate to="/today" replace />} />
      <Route path="/" element={<Navigate to="/today" replace />} />
      <Route element={<AppLayout userId={session.user.id} />}>
        <Route
          path="/today"
          element={
            <Stack>
              <StartSessionButton userId={session.user.id} />
              <ManualSessionButton userId={session.user.id} />
              <TodayScreen userId={session.user.id} />
            </Stack>
          }
        />
        <Route
          path="/tasks"
          element={<TasksScreen userId={session.user.id} />}
        />
        <Route
          path="/calendar"
          element={<CalendarScreen userId={session.user.id} />}
        />
        <Route path="/stats" element={<StatsScreen />} />
        <Route
          path="/settings"
          element={<SettingsScreen userId={session.user.id} />}
        />
      </Route>
    </Routes>
  );
}
