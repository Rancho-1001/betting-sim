import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { simulateYear, fmt, fmtPct } from "./lib/simulate";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./context/ThemeContext";
import SliderInput from "./components/SliderInput";
import StatCard from "./components/StatCard";
import CustomTooltip from "./components/CustomTooltip";
import SimulationLog from "./components/SimulationLog";
import BetJournal from "./components/BetJournal";

export default function BettingSim() {
  const { theme, toggleTheme } = useTheme();

  const [bankroll, setBankroll] = useLocalStorage("bcsim-bankroll", 2000);
  const [units, setUnits] = useLocalStorage("bcsim-units", 20);
  const [odds, setOdds] = useLocalStorage("bcsim-odds", 3.0);
  const [winRate, setWinRate] = useLocalStorage("bcsim-winrate", 70);
  const [showScenarios, setShowScenarios] = useState(false);
  const [tab, setTab] = useState("sim");

  const unitSize = bankroll / units;

  const mainSim = useMemo(
    () => simulateYear(bankroll, units, odds, winRate / 100, 42),
    [bankroll, units, odds, winRate]
  );

  const scenarios = useMemo(() => {
    if (!showScenarios) return [];
    return [
      { seed: 1, color: "#22d3ee" },
      { seed: 2, color: "#a78bfa" },
      { seed: 3, color: "#34d399" },
      { seed: 4, color: "#f87171" },
      { seed: 5, color: "#fbbf24" },
    ].map((s) => ({
      ...simulateYear(bankroll, units, odds, winRate / 100, s.seed),
      color: s.color,
      seed: s.seed,
    }));
  }, [bankroll, units, odds, winRate, showScenarios]);

  const profit = mainSim.final - bankroll;
  const roi = (profit / bankroll) * 100;
  const dailyEV =
    (winRate / 100) * (odds - 1) * unitSize - (1 - winRate / 100) * unitSize;

  const chartData = mainSim.data.map((pt, i) => {
    const entry = { day: pt.day, Main: pt.bankroll };
    scenarios.forEach((s, si) => {
      entry[`S${si + 1}`] = s.data[i]?.bankroll ?? 0;
    });
    return entry;
  });

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@400;600;800&display=swap');
        input[type=range] { height: 4px; }
        * { box-sizing: border-box; }
      `}</style>

      <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
        {theme === "dark" ? "☀" : "✦"}
      </button>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div className="accent-dot" />
          <span className="subtitle-tag">Unit Betting Simulator</span>
        </div>
        <h1 className="app-title">Bankroll Compounder</h1>
        <p className="app-desc">Compound growth simulation over 365 days</p>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Controls */}
        <div className="controls-panel">
          <div className="section-label" style={{ marginBottom: 20 }}>Parameters</div>

          <SliderInput
            label="Starting Bankroll"
            value={bankroll}
            setValue={setBankroll}
            min={500} max={20000} step={500}
            prefix="$"
          />
          <SliderInput label="Units" value={units} setValue={setUnits} min={10} max={50} step={5} />
          <SliderInput label="Decimal Odds" value={odds} setValue={setOdds} min={1.5} max={6} step={0.5} />
          <SliderInput
            label="Win Rate"
            value={winRate}
            setValue={setWinRate}
            min={40} max={80} step={1}
            suffix="%"
          />

          <div className="derived-stats">
            <div className="derived-row">
              <span className="derived-label">Unit Size</span>
              <span className="derived-value">${unitSize.toFixed(2)}</span>
            </div>
            <div className="derived-row">
              <span className="derived-label">Daily EV</span>
              <span className="derived-value" style={{ color: dailyEV > 0 ? "#34d399" : "#f87171" }}>
                {dailyEV > 0 ? "+" : ""}{fmt(dailyEV)}
              </span>
            </div>
            <div className="derived-row">
              <span className="derived-label">Break-even rate</span>
              <span className="derived-value">{(1 / odds * 100).toFixed(1)}%</span>
            </div>
          </div>

          <button
            onClick={() => setShowScenarios((s) => !s)}
            className={`scenarios-btn${showScenarios ? " active" : ""}`}
          >
            {showScenarios ? "Hide" : "Show"} 5 Random Scenarios
          </button>
        </div>

        {/* Right side */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard
              label="Final Bankroll"
              value={fmt(mainSim.final)}
              sub={`Started at $${bankroll.toLocaleString()}`}
              accent={profit > 0 ? "#22d3ee" : "#f87171"}
            />
            <StatCard
              label="Total Profit"
              value={(profit >= 0 ? "+" : "") + fmt(profit)}
              accent={profit > 0 ? "#34d399" : "#f87171"}
            />
            <StatCard
              label="ROI"
              value={fmtPct(roi)}
              sub={`${mainSim.wins}W / ${mainSim.losses}L`}
              accent="#a78bfa"
            />
          </div>

          <div className="chart-panel">
            <div className="section-label" style={{ marginBottom: 16 }}>
              Bankroll Growth — 365 Days
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="day"
                  stroke="var(--chart-axis)"
                  tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "DM Mono" }}
                  label={{ value: "Day", position: "insideBottom", offset: -2, fill: "var(--text-muted)", fontSize: 11 }}
                />
                <YAxis
                  stroke="var(--chart-axis)"
                  tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "DM Mono" }}
                  tickFormatter={(v) =>
                    v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={bankroll} stroke="var(--chart-ref)" strokeDasharray="4 4" />
                {showScenarios &&
                  scenarios.map((s, i) => (
                    <Line
                      key={i}
                      type="monotone"
                      dataKey={`S${i + 1}`}
                      stroke={s.color}
                      strokeWidth={1}
                      dot={false}
                      opacity={0.4}
                      name={`Scenario ${i + 1}`}
                    />
                  ))}
                <Line
                  type="monotone"
                  dataKey="Main"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  dot={false}
                  name="Expected Path"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-caption">
              Dashed line = starting bankroll ${bankroll.toLocaleString()} · Cyan = expected path (mean outcome)
            </div>
          </div>
        </div>
      </div>

      {/* Tracker */}
      <div className="tracker-panel">
        <div className="tracker-tabs">
          <button
            className={`tracker-tab${tab === "sim" ? " active" : ""}`}
            onClick={() => setTab("sim")}
          >
            Simulation Log
          </button>
          <button
            className={`tracker-tab${tab === "journal" ? " active" : ""}`}
            onClick={() => setTab("journal")}
          >
            My Bets
          </button>
        </div>
        {tab === "sim" ? (
          <SimulationLog log={mainSim.log} startBankroll={bankroll} />
        ) : (
          <BetJournal />
        )}
      </div>

      {/* Warning */}
      <div className="warning-box">
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span className="warning-text">
          This simulation uses a fixed random seed for the "expected path." Real outcomes will vary
          widely. Professional bettors rarely sustain 55%+ win rates long-term. The break-even win
          rate at {odds}x decimal odds is {(1 / odds * 100).toFixed(1)}%. Bet responsibly.
        </span>
      </div>
    </div>
  );
}
