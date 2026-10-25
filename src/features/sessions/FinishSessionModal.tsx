import { useState } from "react";
import type { StudySession } from "../../lib/agenda/types";
import {
  Alert,
  Button,
  Checkbox,
  Text,
  Group,
  Modal,
  NumberInput,
  Stack,
} from "@mantine/core";
import { differenceInMinutes, parseISO } from "date-fns";
import { useFinishSession } from "./useFinishSession";
import { useAgenda } from "../agenda/useAgenda";
import { useTasks } from "../tasks/useTasks";

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
  const tasksQuery = useTasks(userId);
  const agendaResult = useAgenda(userId);

  const pending =
    tasksQuery.data
      ?.flatMap((t) => t.goals)
      .filter((g) => g.completed_on === null) ?? [];

  const todayDay =
    agendaResult.status === "ready"
      ? agendaResult.agenda.find((d) => d.date === agendaResult.today)
      : undefined;

  const suggestedIds = todayDay?.goalIds ?? [];

  const [selectedIds, setSelectedIds] = useState<string[]>(() => suggestedIds);

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
        {pending.length === 0 ? (
          <Text>No hay metas pendientes</Text>
        ) : (
          <Checkbox.Group
            label="Metas completadas"
            value={selectedIds}
            onChange={setSelectedIds}
          >
            <Stack gap={"xs"}>
              {pending.map((g) => (
                <Checkbox
                  key={g.id}
                  value={g.id}
                  label={`${g.title} · ${g.est_minutes} min`}
                />
              ))}
            </Stack>
          </Checkbox.Group>
        )}
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
                goalIds: selectedIds,
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
