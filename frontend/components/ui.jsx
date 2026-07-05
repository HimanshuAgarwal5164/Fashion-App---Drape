export function ScoreBadge({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 70 ? "#22c55e" : pct >= 45 ? "#f59e0b" : "#94a3b8";
  return (
    <span className="score-badge" style={{ background: color }}>
      {pct}% match
    </span>
  );
}

export function ColourDots({ palette = [] }) {
  return (
    <div className="colour-dots">
      {palette.map((hex, i) => (
        <span key={`${hex}-${i}`} className="colour-dot" title={hex} style={{ background: hex }} />
      ))}
    </div>
  );
}

export function Tag({ children, accent }) {
  return (
    <span className={`tag${accent ? " tag-accent" : ""}`}>
      {children}
    </span>
  );
}

export function Section({ title, children }) {
  return (
    <div className="section-card">
      <h3 className="section-title">{title}</h3>
      <div className="section-body">{children}</div>
    </div>
  );
}

export function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`select-control${value ? "" : " placeholder"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
