import { useMemo, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { fmt, fmtPct } from "../lib/simulate";
import { betsToCSV, csvToBets } from "../lib/csv";
import { useBetJournal } from "../hooks/useBetJournal";

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  date: todayISO(),
  desc: "",
  stake: "",
  odds: "",
  result: "win",
});

export default function BetJournal({ simData, simStart }) {
  const { bets, start, loading, error, addBet: saveBet, removeBet, clearAll: clearAllBets, importBets, setStart } = useBetJournal();
  const [form, setForm] = useState(emptyForm);
  const [xMode, setXMode] = useState("bet"); // "bet" | "date"
  const [showSim, setShowSim] = useState(false);
  const fileRef = useRef(null);

  // Build running bankroll + stats from the chronological bet list.
  const { rows, stats } = useMemo(() => {
    let bankroll = start;
    let wins = 0, losses = 0, pushes = 0, staked = 0;
    let curWin = 0, curLoss = 0, longestWin = 0, longestLoss = 0;
    let peak = start, maxDD = 0;

    const rows = bets.map((b) => {
      const stake = parseFloat(b.stake) || 0;
      const odds = parseFloat(b.odds) || 0;
      let delta = 0;
      if (b.result === "win") {
        delta = stake * (odds - 1);
        wins++; curWin++; curLoss = 0;
        longestWin = Math.max(longestWin, curWin);
      } else if (b.result === "loss") {
        delta = -stake;
        losses++; curLoss++; curWin = 0;
        longestLoss = Math.max(longestLoss, curLoss);
      } else {
        delta = 0; pushes++; // push: stake returned
      }
      staked += stake;
      bankroll += delta;
      if (bankroll > peak) peak = bankroll;
      maxDD = Math.max(maxDD, peak - bankroll);
      return { ...b, stake, odds, delta, bankroll };
    });

    const decided = wins + losses;
    const stats = {
      count: bets.length, wins, losses, pushes,
      winRate: decided > 0 ? (wins / decided) * 100 : 0,
      longestWin, longestLoss, peak, maxDD, staked,
      netProfit: bankroll - start,
      roi: start > 0 ? ((bankroll - start) / start) * 100 : 0,
      final: bankroll,
    };
    return { rows, stats };
  }, [bets, start]);

  // Chart data: start point + running bankroll after each bet.
  // The simulated "expected path" is rebased to the journal's starting
  // bankroll so both lines begin at the same point and compare fairly.
  const chartData = useMemo(() => {
    const scale = simData && simStart > 0 ? start / simStart : 1;
    return [
      { n: 0, label: "Start", Bankroll: start, Sim: start },
      ...rows.map((r, i) => ({
        n: i + 1,
        label: r.date,
        Bankroll: r.bankroll,
        Sim: simData && simData[i + 1] != null
          ? parseFloat((simData[i + 1].bankroll * scale).toFixed(2))
          : undefined,
      })),
    ];
  }, [rows, start, simData, simStart]);

  const addBet = (e) => {
    e.preventDefault();
    if (!form.stake || !form.odds) return;
    saveBet(form);
    setForm({ ...emptyForm(), date: form.date });
  };

  const clearAll = () => {
    if (window.confirm("Clear all logged bets? This cannot be undone.")) clearAllBets();
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const exportCSV = () => {
    const csv = betsToCSV(bets);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bet-journal-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = csvToBets(String(reader.result));
      if (imported.length === 0) {
        window.alert("No valid bets found in that CSV.");
        return;
      }
      if (bets.length > 0 &&
          !window.confirm(`Replace your ${bets.length} logged bet(s) with ${imported.length} imported bet(s)?`)) {
        return;
      }
      importBets(imported);
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-importing the same file
  };

  return (
    <div>
      {loading && <div className="journal-status">Loading your journal…</div>}
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Starting bankroll + CSV actions */}
      <div className="journal-head">
        <label className="journal-start">
          <span className="track-chip-label">Starting Bankroll</span>
          <span className="number-field">
            <span className="affix">$</span>
            <input
              type="number"
              className="value-input"
              min={0}
              value={start}
              onChange={(e) => setStart(parseFloat(e.target.value) || 0)}
            />
          </span>
        </label>
        <div className="journal-actions">
          <button className="jf-ghost" onClick={exportCSV} disabled={bets.length === 0}>
            ↓ Export CSV
          </button>
          <button className="jf-ghost" onClick={() => fileRef.current?.click()}>
            ↑ Import CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={importCSV}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="track-summary">
        <Chip label="Real Win %" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.wins}W / ${stats.losses}L${stats.pushes ? ` / ${stats.pushes}P` : ""}`} />
        <Chip label="Current Bankroll" value={fmt(stats.final)} />
        <Chip label="Net Profit" value={fmt(stats.netProfit)} sub={fmtPct(stats.roi)} />
        <Chip label="Total Staked" value={fmt(stats.staked)} sub={`${stats.count} bets`} />
        <Chip label="Longest Win Streak" value={stats.longestWin} />
        <Chip label="Max Drawdown" value={fmt(stats.maxDD)} />
      </div>

      {/* Live bankroll chart */}
      {rows.length > 0 && (
        <div className="journal-chart">
          <div className="journal-chart-head">
            <div className="section-label">
              Actual Bankroll — {rows.length} bet{rows.length === 1 ? "" : "s"}
            </div>
            <div className="chart-toggles">
              <div className="seg">
                <button className={`seg-btn${xMode === "bet" ? " active" : ""}`} onClick={() => setXMode("bet")}>Bet #</button>
                <button className={`seg-btn${xMode === "date" ? " active" : ""}`} onClick={() => setXMode("date")}>Date</button>
              </div>
              {simData && (
                <button
                  className={`seg-btn standalone${showSim ? " active" : ""}`}
                  onClick={() => setShowSim((s) => !s)}
                  title="Overlay the simulated expected path, rebased to your starting bankroll"
                >
                  {showSim ? "✓ " : ""}Expected path
                </button>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey="n"
                stroke="var(--chart-axis)"
                tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "DM Mono" }}
                tickFormatter={(n) => (xMode === "date" ? (chartData[n]?.label ?? n) : n)}
                label={{ value: xMode === "date" ? "Date" : "Bet #", position: "insideBottom", offset: -2, fill: "var(--text-muted)", fontSize: 11 }}
              />
              <YAxis
                stroke="var(--chart-axis)"
                tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "DM Mono" }}
                tickFormatter={(v) =>
                  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                }
                width={60}
              />
              <Tooltip content={<JournalTooltip xMode={xMode} />} />
              {showSim && <Legend wrapperStyle={{ fontFamily: "DM Mono", fontSize: 11 }} />}
              <ReferenceLine y={start} stroke="var(--chart-ref)" strokeDasharray="4 4" />
              {showSim && simData && (
                <Line
                  type="monotone"
                  dataKey="Sim"
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                  name="Expected (sim)"
                  connectNulls
                />
              )}
              <Line
                type="monotone"
                dataKey="Bankroll"
                stroke={stats.netProfit >= 0 ? "#34d399" : "#f87171"}
                strokeWidth={2.5}
                dot={{ r: 2 }}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-caption">
            Dashed line = starting bankroll {fmt(start)}
            {showSim ? " · Purple = simulated expected path (rebased)" : ` · ${stats.netProfit >= 0 ? "Green" : "Red"} = your actual bankroll`}
          </div>
        </div>
      )}

      {/* Add form */}
      <form className="journal-form" onSubmit={addBet}>
        <input type="date" value={form.date} onChange={set("date")} className="jf-input" />
        <input type="text" placeholder="Description (optional)" value={form.desc} onChange={set("desc")} className="jf-input jf-desc" />
        <input type="number" placeholder="Stake" step="0.01" min="0" value={form.stake} onChange={set("stake")} className="jf-input jf-num" />
        <input type="number" placeholder="Odds" step="0.01" min="1" value={form.odds} onChange={set("odds")} className="jf-input jf-num" />
        <select value={form.result} onChange={set("result")} className="jf-input jf-select">
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="push">Push</option>
        </select>
        <button type="submit" className="jf-add">+ Add</button>
      </form>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="journal-empty">No bets logged yet. Add your first bet above.</div>
      ) : (
        <div className="track-table-wrap">
          <table className="track-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Stake</th>
                <th>Odds</th>
                <th>Result</th>
                <th>P / L</th>
                <th>Bankroll</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td className="jf-desc-cell">{r.desc || "—"}</td>
                  <td>{fmt(r.stake)}</td>
                  <td>{r.odds.toFixed(2)}</td>
                  <td>
                    <span className={r.result === "win" ? "pill-win" : r.result === "loss" ? "pill-loss" : "pill-push"}>
                      {r.result.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: r.delta > 0 ? "#34d399" : r.delta < 0 ? "#f87171" : "var(--text-faint)" }}>
                    {r.delta > 0 ? "+" : ""}{fmt(r.delta)}
                  </td>
                  <td>{fmt(r.bankroll)}</td>
                  <td>
                    <button className="jf-del" onClick={() => removeBet(r.id)} title="Delete">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="jf-clear" onClick={clearAll}>Clear all</button>
        </div>
      )}
    </div>
  );
}

function JournalTooltip({ active, payload, label, xMode }) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    const heading = label === 0
      ? "Start"
      : xMode === "date"
        ? `${point.label} · Bet ${label}`
        : `Bet ${label} · ${point.label}`;
    return (
      <div className="chart-tooltip">
        <div className="tooltip-day">{heading}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {fmt(p.value)}
          </div>
        ))}
      </div>
    );
  }
  return null;
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
