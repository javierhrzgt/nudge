import { Text, Title, Center, Loader, Group, Badge } from "@mantine/core";
import { useProfile } from "./useProfile";

interface ProfileProps {
  userId: string;
}

export default function Profile({ userId }: Readonly<ProfileProps>) {
  const profileQuery = useProfile(userId);

  if (profileQuery.isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (profileQuery.isError)
    return <Text ta="center">{profileQuery.error.message}</Text>;

  return (
    <Group gap="xs" wrap="nowrap">
      <Title
        order={4}
        miw={0}
        lineClamp={1}
        title={profileQuery.data.displayName}
      >
        {profileQuery.data.displayName}
      </Title>
      <Badge size="xs" flex="none">
        {profileQuery.data.role}
      </Badge>
    </Group>
  );
}
