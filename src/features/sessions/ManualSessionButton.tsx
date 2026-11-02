import { Button } from "@mantine/core";
import { useState } from "react";
import ManualSessionModal from "./ManualSessionModal";

export default function ManualSessionButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button variant="light" onClick={() => setIsOpen(true)}>
        Registrar sesión pasada
      </Button>
      {isOpen && <ManualSessionModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
