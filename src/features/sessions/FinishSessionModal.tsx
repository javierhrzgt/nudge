import { useState } from "react";
import type { StudySession } from "../../lib/agenda/types";
import { Alert, Button, Group, Modal, NumberInput, Stack } from "@mantine/core";
import { differenceInMinutes, parseISO } from "date-fns";
import { useFinishSession } from "./useFinishSession";

interface ModalProps {
  session: StudySession;
  userId: string;
  onClose: () => void;
}

export default function FinishSessionModal({
  session,
  userId,
  onClose,
}: Readonly<ModalProps>) {
  const [duration, setDuration] = useState<number | string>(() =>
    Math.max(1, differenceInMinutes(new Date(), parseISO(session.startedAt))),
  );
  const isValid = typeof duration === "number" && duration >= 1;
  const finishSession = useFinishSession(userId);

  return (
    <Modal opened onClose={onClose} title="Terminar sesión">
      <Stack>
        {finishSession.error && (
          <Alert color="red">{finishSession.error.message}</Alert>
        )}
        <NumberInput
          label="Duración (minutos)"
          value={duration}
          onChange={setDuration}
          min={1}
          allowDecimal={false}
        />
        <Group justify={"center"}>
          <Button variant={"default"} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!isValid}
            loading={finishSession.isPending}
            onClick={() =>
              finishSession.mutate({
                sessionId: session.id,
                duration: Number(duration),
                goalIds: [],
              })
            }
          >
            Terminar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
