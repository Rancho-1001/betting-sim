export default function StatCard({ label, value, sub, accent }) {
  // Shrink the value font as the string grows so big numbers never overflow.
  const len = String(value).length;
  const fontSize = len > 13 ? 14 : len > 10 ? 16 : len > 8 ? 18 : 20;

  return (
    <div className="stat-card" style={{ borderColor: accent ?? "var(--border)" }}>
      <div className="stat-label">{label}</div>
      <div
        className="stat-value"
        style={{ color: accent ?? "var(--text-primary)", fontSize }}
      >
        {value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
