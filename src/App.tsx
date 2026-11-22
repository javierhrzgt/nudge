import { Center, Loader } from "@mantine/core";
import { useAuth } from "./features/auth/useAuth";
import LoginForm from "./features/auth/LoginForm";
import AuthenticatedApp from "./routes/AuthenticatedApp";

export default function App() {
  const { session, loading } = useAuth();

  if (loading)
    return (
      <Center>
        <Loader />
      </Center>
    );

  if (!session) return <LoginForm />;

  return <AuthenticatedApp userId={session.user.id} />;
}
