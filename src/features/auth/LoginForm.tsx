import { useState, type SubmitEvent } from "react";
import {
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Title,
  Center,
} from "@mantine/core";
import { supabase } from "../../lib/supabase";

export default function LoginForm() {
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.code === "invalid_credentials") {
          setErrorMsg(`Correo o contraseña incorrectos`);
        } else {
          setErrorMsg("No se pudo iniciar sesión. Intenta de nuevo.");
        }
      }
    } catch (error) {
      setErrorMsg(`No se pudo iniciar sesión. Intenta de nuevo. ${error}`);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Center h={"100dvh"}>
      <Stack w={{ base: "100%", sm: 400 }} px={"md"}>
        <Title order={1} ta={"center"}>
          Nudge 🤓
        </Title>
        {errorMsg && <Alert color="red">{errorMsg}</Alert>}
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Button type="submit" loading={submitting}>
              Iniciar Sesión
            </Button>
          </Stack>
        </form>
      </Stack>
    </Center>
  );
}
