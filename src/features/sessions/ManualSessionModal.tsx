import { Group, Modal, NumberInput, Stack, Button } from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { useState } from "react";

interface ManualSessionModalProps {
  onClose: () => void;
}

export default function ManualSessionModal({
  onClose,
}: Readonly<ManualSessionModalProps>) {
  const [sessionDate, setSessionDate] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState<string>("");
  const [sessionDuration, setSessionDuration] = useState<number | string>("");
  return (
    <Modal opened onClose={onClose} title="Crear sesión manual">
      <Stack>
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
        <Group grow>
          <Button variant={"default"} onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled>Guardar</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
