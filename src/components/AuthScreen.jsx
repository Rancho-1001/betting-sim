import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle, configured } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const google = async () => {
    setError("");
    setBusy(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setBusy(false);
    }
    // On success the browser redirects to Google, so no further state needed.
  };

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
          <>
          <button type="button" className="auth-google" onClick={google} disabled={busy}>
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.5 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.5 29.7 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.6 0 10.7-2.1 14.6-5.6l-6.7-5.7c-2.1 1.5-4.9 2.4-7.9 2.4-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.7 5.7C42 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z" />
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider"><span>or</span></div>

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
          </>
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
