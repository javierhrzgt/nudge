export type UserRole = "student" | "teacher";

export interface ProfileRow {
  display_name: string;
  role: string;
}

export interface UserProfile {
  displayName: string;
  role: UserRole;
}

function isUserRole(value: string): value is UserRole {
  return value === "student" || value === "teacher";
}

export function mapProfile(row: ProfileRow): UserProfile {
  if (!isUserRole(row.role)) throw new Error(`Rol desconocido: "${row.role}"`);

  return { displayName: row.display_name, role: row.role };
}
