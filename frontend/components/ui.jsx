export function ScoreBadge({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 70 ? "#22c55e" : pct >= 45 ? "#f59e0b" : "#94a3b8";
  return (
    <span style={{ background: color, color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>
      {pct}% match
    </span>
  );
}

export function ColourDots({ palette = [] }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
      {palette.map((hex, i) => (
        <span key={`${hex}-${i}`} title={hex} style={{ width: 18, height: 18, borderRadius: "50%", background: hex, border: "1px solid #e2e8f0", display: "inline-block" }} />
      ))}
    </div>
  );
}

export function Tag({ children, accent }) {
  return (
    <span style={{ background: accent ? "#ede9fe" : "#f1f5f9", color: accent ? "#7c3aed" : "#475569", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 500, textTransform: "capitalize" }}>
      {children}
    </span>
  );
}

export function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

export function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, color: value ? "#1e293b" : "#94a3b8", background: "#fff", cursor: "pointer", outline: "none" }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
