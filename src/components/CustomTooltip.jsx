import { fmt } from "../lib/simulate";

export default function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-day">Day {label}</div>
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
