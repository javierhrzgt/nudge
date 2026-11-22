import { Routes, Route, Navigate } from "react-router";
import AppLayout from "../features/layout/AppLayout";
import { teacherNavItems } from "../features/layout/navItems";
import StudentsScreen from "../features/students/StudentsScreen";

interface TeacherRoutesProps {
  userId: string;
}

export default function TeacherRoutes({
  userId,
}: Readonly<TeacherRoutesProps>) {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/students" replace />} />
      <Route path="/" element={<Navigate to="/students" replace />} />
      <Route element={<AppLayout userId={userId} items={teacherNavItems} />}>
        <Route path="/students" element={<StudentsScreen userId={userId} />} />
      </Route>
    </Routes>
  );
}
