import { useMemo } from "react";
import { fmt, fmtPct } from "../lib/simulate";
import { computeStats } from "../lib/stats";

export default function SimulationLog({ log, startBankroll }) {
  const stats = useMemo(() => computeStats(log, startBankroll), [log, startBankroll]);

  return (
    <div>
      {/* Summary chips */}
      <div className="track-summary">
        <Chip label="Actual Win %" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.wins}W / ${stats.losses}L`} />
        <Chip label="Longest Win Streak" value={stats.longestWinStreak} />
        <Chip label="Longest Loss Streak" value={stats.longestLossStreak} />
        <Chip label="Peak Bankroll" value={fmt(stats.peak)} />
        <Chip label="Max Drawdown" value={fmt(stats.maxDrawdown)} sub={`${stats.maxDrawdownPct.toFixed(1)}%`} />
        <Chip label="Net Profit" value={fmt(stats.netProfit)} sub={fmtPct(stats.roi)} />
      </div>

      {/* Day-by-day table */}
      <div className="track-table-wrap">
        <table className="track-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Stake</th>
              <th>Result</th>
              <th>P / L</th>
              <th>Bankroll</th>
            </tr>
          </thead>
          <tbody>
            {log.map((r) => (
              <tr key={r.day}>
                <td>{r.day}</td>
                <td>{fmt(r.stake)}</td>
                <td>
                  <span className={r.won ? "pill-win" : "pill-loss"}>
                    {r.won ? "WIN" : "LOSS"}
                  </span>
                </td>
                <td style={{ color: r.delta >= 0 ? "#34d399" : "#f87171" }}>
                  {r.delta >= 0 ? "+" : ""}{fmt(r.delta)}
                </td>
                <td>{fmt(r.bankroll)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Chip({ label, value, sub }) {
  return (
    <div className="track-chip">
      <div className="track-chip-label">{label}</div>
      <div className="track-chip-value">{value}</div>
      {sub && <div className="track-chip-sub">{sub}</div>}
    </div>
  );
}
