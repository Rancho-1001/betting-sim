import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { signIn, signUp, configured } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    const fn = mode === "login" ? signIn : signUp;
    const { data, error } = await fn(email, password);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    // If email confirmation is on, signUp returns a user with no session.
    if (mode === "signup" && !data.session) {
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("login");
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div className="accent-dot" />
          <span className="subtitle-tag">Bankroll Compounder</span>
        </div>
        <h1 className="app-title" style={{ fontSize: 24, marginBottom: 4 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="app-desc" style={{ marginBottom: 24 }}>
          {mode === "login"
            ? "Sign in to access your bet journal anywhere."
            : "Sign up to track your bets in the cloud."}
        </p>

        {!configured ? (
          <div className="auth-error">
            Supabase isn't configured. Set <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code>.
          </div>
        ) : (
          <form onSubmit={submit} className="auth-form">
            <label className="auth-label">Email</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={6}
              required
            />

            {error && <div className="auth-error">{error}</div>}
            {notice && <div className="auth-notice">{notice}</div>}

            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? "…" : mode === "login" ? "Sign in" : "Sign up"}
            </button>
          </form>
        )}

        <div className="auth-switch">
          {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setMode((m) => (m === "login" ? "signup" : "login"));
              setError("");
              setNotice("");
            }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
