import theme from "../../../theme.js";
import TiltButton from "./TiltButton.jsx";

// Auto-Fit-Grid statt fester Spaltenzahl: breite Container zeigen die gewünschte Zahl an
// Spalten, schmale (Mobil) lassen die Optionen umbrechen statt sie auf Mini-Größe zu quetschen.
// Die Optionen sind Auswahl-Karten mit dezentem Tilt-on-Hover (TiltButton).
// `renderIcon?: (opt, active) => ReactNode` zeichnet ein Icon über dem Label (z. B. die
// Kompass-Nadeln der Dach-Ausrichtung) — rein textuelle Karten bleiben unverändert.
export default function OptionGroup({ options, selected, onSelect, minCol = 96, renderIcon }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${minCol}px, 1fr))`, gap: 8 }}>
      {options.map((opt) => {
        const label = typeof opt === "string" ? opt : opt.label;
        const active = selected === label;
        return (
          <TiltButton
            key={label}
            onClick={() => onSelect(label)}
            style={{
              padding: renderIcon ? "14px 8px 12px" : "13px 10px",
              borderRadius: 10,
              // Beide Zustände 2px: Mit 1.5px inaktiv und 2px aktiv wuchs die
              // Karte beim Auswählen um einen halben Pixel und das ganze
              // Raster ruckte kurz. Unterschieden wird über die Farbe.
              border: `2px solid ${active ? theme.color.accent : theme.color.border}`,
              background: active ? theme.color.accentSubtle : theme.color.white,
              color: active ? theme.color.accentHover : theme.color.textPrimary,
              fontWeight: active ? 700 : 500,
              fontSize: 15,
              lineHeight: 1.3,
              cursor: "pointer",
              transition: "border-color 0.15s, background-color 0.15s, color 0.15s",
            }}
          >
            {renderIcon && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 9 }}>{renderIcon(opt, active)}</div>
            )}
            {labelParts(label)}
          </TiltButton>
        );
      })}
    </div>
  );
}

// "Flach (0–15°)" brach in schmalen Karten (320px) mitten in der Klammer um
// ("Flach (0–" / "15°)"). Der Klammerteil bleibt daher zusammen und rutscht
// als Ganzes in die zweite Zeile.
function labelParts(label) {
  const m = /^(.*?) (\(.*\))$/.exec(label);
  if (!m) return label;
  return <>{m[1]} <span style={{ whiteSpace: "nowrap" }}>{m[2]}</span></>;
}
