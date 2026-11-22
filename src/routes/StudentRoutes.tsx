import { Routes, Route, Navigate } from "react-router";
import AppLayout from "../features/layout/AppLayout";
import { Stack } from "@mantine/core";
import StartSessionButton from "../features/sessions/StartSessionButton";
import ManualSessionButton from "../features/sessions/ManualSessionButton";
import TodayScreen from "../features/agenda/TodayScreen";
import TasksScreen from "../features/tasks/TasksScreen";
import CalendarScreen from "../features/calendar/CalendarScreen";
import StatsScreen from "../features/stats/StatsScreen";
import SettingsScreen from "../features/settings/SettingsScreen";
import { studentNavItems } from "../features/layout/navItems";

interface StudentRoutesProps {
  userId: string;
}

export default function StudentRoutes({
  userId,
}: Readonly<StudentRoutesProps>) {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/today" replace />} />
      <Route path="/" element={<Navigate to="/today" replace />} />
      <Route element={<AppLayout userId={userId} items={studentNavItems} />}>
        <Route
          path="/today"
          element={
            <Stack>
              <StartSessionButton userId={userId} />
              <ManualSessionButton userId={userId} />
              <TodayScreen userId={userId} />
            </Stack>
          }
        />
        <Route path="/tasks" element={<TasksScreen userId={userId} />} />
        <Route path="/calendar" element={<CalendarScreen userId={userId} />} />
        <Route path="/stats" element={<StatsScreen userId={userId} />} />
        <Route path="/settings" element={<SettingsScreen userId={userId} />} />
      </Route>
    </Routes>
  );
}
