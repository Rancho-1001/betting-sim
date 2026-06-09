import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password });
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, configured: isSupabaseConfigured }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
