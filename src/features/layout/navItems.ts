export interface NavItemsParams {
  to: string;
  label: string;
}

export const studentNavItems: NavItemsParams[] = [
  { to: "/today", label: "Hoy" },
  { to: "/tasks", label: "Tareas" },
  { to: "/calendar", label: "Calendario" },
  { to: "/stats", label: "Estadísticas" },
  { to: "/settings", label: "Ajustes" },
];

export const teacherNavItems: NavItemsParams[] = [
  { to: "/students", label: "Estudiantes" },
];
