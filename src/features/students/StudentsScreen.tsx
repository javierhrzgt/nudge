import { Alert, Center, Loader, Paper, Stack, Text } from "@mantine/core";
import { useStudents } from "./useStudents";
import { Link } from "react-router";

interface StudentsScreenProps {
  userId: string;
}

export default function StudentsScreen({
  userId,
}: Readonly<StudentsScreenProps>) {
  const studentsQuery = useStudents(userId);

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

  if (studentsQuery.data.length === 0)
    return <Text ta="center">Aún no tienes estudiantes vinculados</Text>;

  return (
    <Stack>
      {studentsQuery.data.map((student) => (
        <Paper
          withBorder
          p="md"
          radius="md"
          c="var(--mantine-color-text)"
          key={student.studentId}
          component={Link}
          to={`/students/${student.studentId}`}
        >
          <Text>{student.displayName}</Text>
        </Paper>
      ))}
    </Stack>
  );
}
