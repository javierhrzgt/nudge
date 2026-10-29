import {
  Alert,
  Button,
  Chip,
  Group,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import type { Settings } from "../../lib/agenda/types";
import { useState } from "react";
import { validateSettings } from "../../lib/settings/validateSettings";
import { useUpdateSettings } from "./useUpdateSettings";
import { DatePickerInput } from "@mantine/dates";

interface SettingsFormProp {
  userId: string;
  initial: Settings;
}

const dayOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

export default function SettingsForm({
  userId,
  initial,
}: Readonly<SettingsFormProp>) {
  const [minutes, setMinutes] = useState<number | string>(
    () => initial.dailyMinutes,
  );
  const [workDays, setWorkDays] = useState(() => initial.workDays);
  const [startDate, setStartDate] = useState<string | null>(
    () => initial.startDate,
  );
  const updateSettings = useUpdateSettings(userId);

  const values: Settings = {
    workDays,
    dailyMinutes: Number(minutes),
    startDate: startDate ?? "",
  };

  const errors = validateSettings(values);

  return (
    <Stack>
      {updateSettings.isSuccess && <Text c="green">Guardado</Text>}
      {errors.map((err) => (
        <Alert color="red" key={err}>
          {err}
        </Alert>
      ))}
      <NumberInput
        label="Minutos diarios"
        value={minutes}
        onChange={(value) => {
          setMinutes(value);
          updateSettings.reset();
        }}
        min={1}
        allowDecimal={false}
      />
      <Chip.Group
        multiple={true}
        value={workDays.map(String)}
        onChange={(selected) => {
          setWorkDays(selected.map(Number));
          updateSettings.reset();
        }}
      >
        <Group>
          {dayOfWeek.map((day) => (
            <Chip key={String(day.value)} value={String(day.value)}>
              {day.label}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
      <DatePickerInput
        label="Fecha de inicio"
        locale="es"
        valueFormat="DD/MM/YYYY"
        value={startDate}
        onChange={(date) => {
          setStartDate(date);
          updateSettings.reset();
        }}
      />
      {updateSettings.error && (
        <Alert color="red">{updateSettings.error.message}</Alert>
      )}
      <Button
        disabled={errors.length > 0}
        loading={updateSettings.isPending}
        onClick={() => updateSettings.mutate(values)}
      >
        Guardar
      </Button>
    </Stack>
  );
}
