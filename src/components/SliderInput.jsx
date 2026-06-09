export default function SliderInput({ label, value, setValue, min, max, step, prefix, suffix }) {
  const clamp = (n) => Math.min(max, Math.max(min, n));

  const handleNumberChange = (e) => {
    const raw = e.target.value;
    if (raw === "") return; // allow temporary empty field while typing
    const num = parseFloat(raw);
    if (!Number.isNaN(num)) setValue(num);
  };

  const handleBlur = (e) => {
    const num = parseFloat(e.target.value);
    setValue(Number.isNaN(num) ? min : clamp(num));
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span className="label-text">{label}</span>
        <span className="number-field">
          {prefix && <span className="affix">{prefix}</span>}
          <input
            type="number"
            className="value-input"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleNumberChange}
            onBlur={handleBlur}
          />
          {suffix && <span className="affix">{suffix}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        style={{ width: "100%", cursor: "pointer" }}
      />
    </div>
  );
}
