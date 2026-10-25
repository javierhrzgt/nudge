import { Alert, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useDiscardSession } from "./useDiscardSession";

interface ModalProps {
  sessionId: string;
  userId: string;
  onClose: () => void;
}

export default function DiscardSessionModal({
  sessionId,
  userId,
  onClose,
}: Readonly<ModalProps>) {
  const discardSession = useDiscardSession(userId);
  return (
    <Modal opened onClose={onClose} title="Descartar sesión">
      <Stack>
        {discardSession.error && (
          <Alert color="red">{discardSession.error.message}</Alert>
        )}
        <Text>Se borrará esta sesión. No se puede deshacer.</Text>
        <Group justify={"center"}>
          <Button variant={"default"} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            color={"red"}
            loading={discardSession.isPending}
            onClick={() => discardSession.mutate(sessionId)}
          >
            Descartar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
