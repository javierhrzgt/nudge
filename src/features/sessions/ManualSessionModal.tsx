import {
  Group,
  Modal,
  NumberInput,
  Stack,
  Button,
  Center,
  Loader,
  Alert,
  Checkbox,
  Text,
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useState } from "react";
import { useAgenda } from "../agenda/useAgenda";
import { useSettings } from "../settings/useSettings";
import { buildStartedAt } from "../../lib/sessions/buildStartedAt";
import { validateManualSession } from "../../lib/sessions/validateManualSession";
import { useCreateManualSession } from "./useCreateManualSession";

interface ManualSessionModalProps {
  userId: string;
  onClose: () => void;
}

export default function ManualSessionModal({
  userId,
  onClose,
}: Readonly<ManualSessionModalProps>) {
  const [sessionDate, setSessionDate] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState<string>("");
  const [sessionDuration, setSessionDuration] = useState<number | string>("");
  const [sessionGoals, setSessionGoals] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const agendaQuery = useAgenda(userId);
  const settingsQuery = useSettings(userId);
  const manualSession = useCreateManualSession(userId);

  if (settingsQuery.isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (settingsQuery.isError) return <Text>{settingsQuery.error.message}</Text>;

  let goalsContent;
  if (agendaQuery.status === "pending") {
    goalsContent = (
      <Center>
        <Loader />
      </Center>
    );
  } else if (agendaQuery.status === "error") {
    goalsContent = <Alert color="red">{agendaQuery.error.message}</Alert>;
  } else {
    const pendingGoals = agendaQuery.tasks.flatMap((task) => {
      return task.goals.filter((goal) => goal.completedOn === null);
    });

    goalsContent =
      pendingGoals.length > 0 ? (
        <Checkbox.Group
          label="Metas completadas"
          value={sessionGoals}
          onChange={setSessionGoals}
        >
          <Stack gap="xs" mt="xs">
            {pendingGoals.map((goal) => (
              <Checkbox
                key={goal.id}
                value={goal.id}
                label={`${goal.title} · ${goal.estMinutes} min`}
              />
            ))}
          </Stack>
        </Checkbox.Group>
      ) : (
        <Text ta="center">No hay metas pendientes</Text>
      );
  }

  const date = sessionDate || null;
  const time = sessionTime || null;
  const timezone = settingsQuery.data.timezone;

  function handleSave() {
    const startedAt = buildStartedAt({ date, time, timezone });
    const duration = sessionDuration === "" ? null : Number(sessionDuration);
    const now = new Date();

    const validationErrors = validateManualSession(startedAt, duration, now);
    setErrors(validationErrors);

    if (
      validationErrors.length > 0 ||
      startedAt === null ||
      date === null ||
      duration === null
    )
      return;

    manualSession.mutate(
      {
        startedAt,
        localDate: date,
        duration,
        goalIds: sessionGoals,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal opened onClose={onClose} title="Crear sesión manual">
      <Stack>
        {manualSession.isError && (
          <Alert color="red">{manualSession.error.message}</Alert>
        )}
        {errors.length > 0 && (
          <Alert color="red">
            {errors.map((error) => (
              <Text key={error}>{error}</Text>
            ))}
          </Alert>
        )}
        <DatePickerInput
          firstDayOfWeek={0}
          label="Fecha"
          locale="es"
          valueFormat="DD/MM/YYYY"
          value={sessionDate}
          onChange={setSessionDate}
        />
        <TimeInput
          label="Hora de inicio"
          value={sessionTime}
          onChange={(e) => {
            setSessionTime(e.currentTarget.value);
          }}
        />
        <NumberInput
          allowDecimal={false}
          min={1}
          max={1440}
          label="Duración (minutos)"
          value={sessionDuration}
          onChange={(duration) => {
            setSessionDuration(duration);
          }}
        />
        {goalsContent}
        <Group grow>
          <Button variant={"default"} onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={manualSession.isPending} onClick={handleSave}>
            Guardar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
