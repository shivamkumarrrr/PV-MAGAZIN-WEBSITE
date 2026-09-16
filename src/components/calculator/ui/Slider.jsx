import { useState } from "react";
import theme from "../../../theme.js";

export default function Slider({ value, onChange, min, max, step, unit, label }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(String(value));
  const slug = label ? label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : "slider";

  const commit = () => {
    let n = parseFloat(temp.replace(/\./g, "").replace(",", "."));
    if (isNaN(n)) n = min;
    n = Math.max(min, Math.min(max, n));
    n = Math.round(n / step) * step;
    onChange(n);
    setTemp(String(n));
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 15, color: theme.color.textPrimary, fontWeight: 600 }}>{label}</span>
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              id={`${slug}-value`}
              name={`${slug}-value`}
              autoFocus
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              style={{
                width: 72,
                fontSize: 16,
                fontWeight: 700,
                color: theme.color.textPrimary,
                border: `1.5px solid ${theme.color.accent}`,
                borderRadius: 8,
                padding: "4px 8px",
                textAlign: "right",
                outline: "none",
                fontVariantNumeric: "tabular-nums",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.color.textSecondary }}>{unit}</span>
          </div>
        ) : (
          /* Der Wert steht in einem sichtbar umrandeten Feld, nicht als nackte
             Zahl mit gestricheltem Rahmen beim Hover. Grund: Auf dem Handy gibt
             es kein Hover — dort war nicht zu erkennen, dass man den Wert direkt
             eintippen kann. Dasselbe Feldmuster benutzen LichtBlick und zolar in
             ihren Rechnern (Wert groß, Einheit rechtsbündig daneben).
             <button> statt <span>, damit die Eingabe auch per Tastatur
             erreichbar ist. */
          <button
            type="button"
            onClick={() => { setTemp(String(value)); setEditing(true); }}
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 4,
              fontFamily: "inherit",
              fontSize: 18,
              fontWeight: 700,
              color: theme.color.textPrimary,
              fontVariantNumeric: "tabular-nums",
              cursor: "text",
              padding: "5px 10px",
              borderRadius: 8,
              border: `1px solid ${theme.color.border}`,
              background: theme.color.surface,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.color.textSecondary}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.color.border}
            title="Wert eintippen"
            aria-label={`${label}: ${value.toLocaleString("de-DE")} ${unit} — Wert eintippen`}
          >
            {value.toLocaleString("de-DE")}
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.color.textSecondary }}>{unit}</span>
          </button>
        )}
      </div>
      {/* Die sichtbare Beschriftung steht als <span> in der Kopfzeile, weil
          rechts daneben der editierbare Wert liegt — ein <label for> würde
          beim Anklicken den Schieberegler fokussieren statt das Wertfeld.
          Deshalb trägt der Regler seinen Namen über aria-label, sonst meldet
          ihn der Screenreader nur als "Schieberegler". aria-valuetext liefert
          die Einheit mit: "40 m²" statt "40". */}
      <input
        id={`${slug}-range`}
        name={`${slug}-range`}
        type="range"
        aria-label={label}
        aria-valuetext={unit ? `${value.toLocaleString("de-DE")} ${unit}` : undefined}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: theme.color.accent, height: 6, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: theme.color.textMuted, marginTop: 4 }}>
        <span>{min.toLocaleString("de-DE")} {unit}</span>
        <span>{max.toLocaleString("de-DE")} {unit}</span>
      </div>
    </div>
  );
}
