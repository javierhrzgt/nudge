import { Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { formatElapsed } from "../../lib/agenda/formatElapsed";

interface ElapsedTimeProps {
  startedAt: string;
}

export default function ElapsedTime({ startedAt }: Readonly<ElapsedTimeProps>) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return <Text size={"xl"}>{formatElapsed(now, startedAt)}</Text>;
}
