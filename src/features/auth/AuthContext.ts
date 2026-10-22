import type { Session } from "@supabase/supabase-js";
import { createContext } from "react";

export interface AuthState {
  session: Session | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
