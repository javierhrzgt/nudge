import type { Session } from "@supabase/supabase-js";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { AuthContext } from "./AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({
  children,
}: Readonly<AuthProviderProps>) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(`Error al obtener sesión: ${error.message}`);
        setSession(data.session);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    void loadSession();
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "SIGNED_OUT") queryClient.clear();
      setSession(newSession);
    });

    return () => data.subscription.unsubscribe();
  }, [queryClient]);
  return <AuthContext value={{ session, loading }}>{children}</AuthContext>;
}
