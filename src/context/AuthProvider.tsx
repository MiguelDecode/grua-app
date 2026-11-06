import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";
import { AuthContext } from "./authContext";

interface AuthProviderProps {
  children: ReactNode;
}

// Remembers which user the loaded profile belongs to
interface ProfileResult {
  userId: string;
  profile: Profile | null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(
    null,
  );

  // Listen to login and logout events (also fires once when the app starts)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setIsAuthReady(true);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  // Load the profile (and therefore the role) whenever the logged user changes
  useEffect(() => {
    if (!userId) return;

    let isCancelled = false;

    async function loadProfile(id: string) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      // Ignore the result if the user changed while we were waiting
      if (isCancelled) return;

      if (error) {
        console.error(error.message);
      }

      setProfileResult({ userId: id, profile: error ? null : data });
    }

    loadProfile(userId);

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  // The profile only counts if it belongs to the current user
  const isProfileReady = !userId || profileResult?.userId === userId;
  const profile =
    userId && isProfileReady ? (profileResult?.profile ?? null) : null;
  const isLoading = !isAuthReady || !isProfileReady;

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
