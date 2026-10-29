export interface NavItemsParams {
  to: string;
  label: string;
}

export const navItems: NavItemsParams[] = [
  { to: "/today", label: "Hoy" },
  { to: "/tasks", label: "Tareas" },
  { to: "/calendar", label: "Calendario" },
  { to: "/settings", label: "Ajustes" },
];
