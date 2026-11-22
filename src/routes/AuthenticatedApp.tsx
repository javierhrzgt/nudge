import { Center, Loader, Text } from "@mantine/core";
import { useProfile } from "../features/profile/useProfile";
import StudentRoutes from "./StudentRoutes";
import TeacherRoutes from "./TeacherRoutes";

interface AuthenticatedAppProps {
  userId: string;
}

export default function AuthenticatedApp({
  userId,
}: Readonly<AuthenticatedAppProps>) {
  const profileQuery = useProfile(userId);

  if (profileQuery.isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (profileQuery.isError) return <Text>{profileQuery.error.message}</Text>;

  return profileQuery.data.role === "teacher" ? (
    <TeacherRoutes userId={userId} />
  ) : (
    <StudentRoutes userId={userId} />
  );
}
