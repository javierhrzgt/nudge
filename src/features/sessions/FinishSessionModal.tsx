import { useState } from "react";
import type { StudySession } from "../../lib/agenda/types";
import { Button, Modal, NumberInput, Stack } from "@mantine/core";
import { differenceInMinutes, parseISO } from "date-fns";

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

  return (
    <Modal opened onClose={onClose} title="Terminar sesión">
      <Stack>
        <NumberInput
          label="Duración (minutos)"
          value={duration}
          onChange={setDuration}
          min={1}
          allowDecimal={false}
        />
        <Button variant={"default"} onClick={onClose}>
          Cancelar
        </Button>
      </Stack>
    </Modal>
  );
}
