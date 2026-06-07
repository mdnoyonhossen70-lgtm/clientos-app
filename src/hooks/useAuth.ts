import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const localModeKey = "clientos.local-mode";
const productionUrl = "https://clientosx.netlify.app";

function authRedirectUrl() {
  return import.meta.env.PROD ? productionUrl : window.location.origin;
}

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  localMode: boolean;
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    session: null,
    loading: isSupabaseConfigured,
    localMode: localStorage.getItem(localModeKey) === "true",
  });

  useEffect(() => {
    if (!supabase) {
      setAuth((current) => ({ ...current, loading: false }));
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setAuth((current) => ({
        ...current,
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
      }));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth((current) => ({
        ...current,
        session,
        user: session?.user ?? null,
        loading: false,
        localMode: current.localMode && !session,
      }));
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return useMemo(
    () => ({
      ...auth,
      isSupabaseConfigured,
      isAuthenticated: Boolean(auth.user || auth.localMode),
      async signInWithEmail(email: string) {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: authRedirectUrl() },
        });
        if (error) throw error;
      },
      async signInWithGoogle() {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: authRedirectUrl() },
        });
        if (error) throw error;
      },
      continueLocally() {
        localStorage.setItem(localModeKey, "true");
        setAuth((current) => ({ ...current, localMode: true }));
      },
      async signOut() {
        localStorage.removeItem(localModeKey);
        if (supabase && auth.user) await supabase.auth.signOut();
        setAuth((current) => ({ ...current, user: null, session: null, localMode: false }));
      },
    }),
    [auth],
  );
}
