import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "../types";

// Everything the rest of the app can read about the logged user
export interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
