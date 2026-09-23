import theme from "../../../theme.js";
import { formatSpan } from "../../../lib/calculate.js";

// Ohne vs. mit Speicher nebeneinander (Muster SMA Solarrechner). Beide
// Spalten kommen aus calculate() — hier wird nur dargestellt. Die vom
// Nutzer gewählte Variante ist markiert.
export default function SpeicherVergleich({ ohne, mit, mitKwh, gewaehlt }) {
  if (!ohne || !mit) return null;
  const kwh = Number(mitKwh).toLocaleString("de-DE");
  const rows = [
    ["Autarkie", (r) => `${r.autarkie} %`],
    ["Ersparnis pro Jahr", (r) => `${formatSpan(r.jahresErsparnis)} €`],
    ["Investition (ca.)", (r) => `${r.investition.toLocaleString("de-DE")} €`],
    ["Amortisation", (r) => `${formatSpan(r.amortisation)} Jahre`],
    ["Nettoersparnis nach 25 Jahren", (r) => `${formatSpan(r.ersparnis25, 22)} €`],
  ];
  const col = (key, titel, r) => {
    const aktiv = gewaehlt === key;
    return (
      <div className="sv-col" style={{ background: aktiv ? theme.color.accentSubtle : theme.color.white, border: aktiv ? `2px solid ${theme.color.accent}` : `1px solid ${theme.color.border}`, padding: aktiv ? 15 : 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap-reverse", justifyContent: "space-between", alignItems: "center", gap: 6, marginBottom: 12, minHeight: 24 }}>
          <div style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 600, color: theme.color.textPrimary }}>{titel}</div>
          {aktiv && <span style={{ fontSize: 11.5, fontWeight: 600, padding: "2px 8px", borderRadius: theme.radius.pill, background: theme.color.accent, color: theme.color.white, whiteSpace: "nowrap" }}>Ihre Wahl</span>}
        </div>
        {rows.map(([label, f]) => (
          <div key={label} className="sv-row">
            <div style={{ fontSize: 12.5, color: theme.color.textSecondary }}>{label}</div>
            <div style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{f(r)}</div>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div style={{ background: theme.color.white, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: "20px 18px", marginBottom: 16 }}>
      <style>{`
        .sv-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .sv-col { border-radius: ${theme.radius.lg}px; min-width: 0; }
        .sv-row { padding: 8px 0; border-top: 1px solid ${theme.color.border}; }
        @media (max-width: 420px) { .sv-grid { gap: 8px; } .sv-col { padding: 12px !important; } }
      `}</style>
      <div style={{ fontFamily: theme.font.display, fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Mit oder ohne Speicher?</div>
      <div style={{ fontSize: 13, color: theme.color.textSecondary, margin: "2px 0 14px" }}>Dieselbe Anlage, zwei Varianten — so sehen Sie, was der Speicher bringt und kostet.</div>
      <div className="sv-grid">
        {col("ohne", "Ohne Speicher", ohne)}
        {col("mit", `Mit ${kwh} kWh Speicher`, mit)}
      </div>
      <div style={{ fontSize: 12, color: theme.color.textMuted, marginTop: 10, lineHeight: 1.5 }}>
        {mit.amortisation > ohne.amortisation + 0.5
          ? "Der Speicher verlängert die Amortisation etwas, macht Sie aber deutlich unabhängiger vom Netz."
          : "Beide Varianten amortisieren sich ähnlich schnell — der Speicher macht Sie vor allem unabhängiger vom Netz."}
      </div>
    </div>
  );
}

