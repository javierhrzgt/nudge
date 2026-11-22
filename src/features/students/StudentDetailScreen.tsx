import { Link, useParams } from "react-router";
import { useStudents } from "./useStudents";
import {
  Alert,
  Anchor,
  Center,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import TasksScreen from "../tasks/TasksScreen";
import CalendarScreen from "../calendar/CalendarScreen";
import StatsScreen from "../stats/StatsScreen";

interface StudentDetailScreenProps {
  teacherId: string;
}

export default function StudentDetailScreen({
  teacherId,
}: Readonly<StudentDetailScreenProps>) {
  const { studentId } = useParams();
  const studentsQuery = useStudents(teacherId);

  if (studentsQuery.isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );

  if (studentsQuery.isError)
    return (
      <Center>
        <Alert color="red">No se pudieron cargar los estudiantes</Alert>
      </Center>
    );

  const student = studentsQuery.data.find(
    (student) => student.studentId === studentId,
  );

  if (!student)
    return (
      <Group justify="center">
        <Anchor component={Link} to={"/students"} underline="hover">
          ← Volver
        </Anchor>
        <Text>Estudiante no encontrado</Text>
      </Group>
    );

  return (
    <Stack>
      <Anchor component={Link} to={"/students"} underline="hover">
        ← Volver a estudiantes
      </Anchor>
      <Title ta="center">{student.displayName}</Title>
      <Tabs defaultValue="tasks">
        <Tabs.List>
          <Tabs.Tab value="tasks">Tareas</Tabs.Tab>
          <Tabs.Tab value="calendar">Calendario</Tabs.Tab>
          <Tabs.Tab value="stats">Estadísticas</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tasks" pt="md">
          <TasksScreen userId={student.studentId} readOnly={true} />
        </Tabs.Panel>
        <Tabs.Panel value="calendar" pt="md">
          <CalendarScreen userId={student.studentId} />
        </Tabs.Panel>
        <Tabs.Panel value="stats" pt="md">
          <StatsScreen userId={student.studentId} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
