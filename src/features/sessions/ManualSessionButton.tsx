import { Button } from "@mantine/core";
import { useState } from "react";
import ManualSessionModal from "./ManualSessionModal";

interface ManualSessionButtonProps {
  userId: string;
}

export default function ManualSessionButton({
  userId,
}: Readonly<ManualSessionButtonProps>) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button variant="light" onClick={() => setIsOpen(true)}>
        Registrar sesión pasada
      </Button>
      {isOpen && (
        <ManualSessionModal onClose={() => setIsOpen(false)} userId={userId} />
      )}
    </>
  );
}
