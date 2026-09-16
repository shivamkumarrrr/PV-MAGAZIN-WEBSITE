import theme from "../../../theme.js";
import TiltButton from "./TiltButton.jsx";
import RoofIcon from "./RoofIcon.jsx";
import { M2_PRO_KWP, M2_PRO_KWP_FLACHDACH } from "../../../lib/calculate.js";

export default function DachformCard({ item, selected, onSelect }) {
  const active = selected === item.label;
  // Flachdach hat factor 1.0 (die geringere Flächen-Effizienz steckt in M2_PRO_KWP_FLACHDACH).
  // Für die Anzeige den Effekt als äquivalente "Nutzbarkeit" relativ zum Schrägdach ausdrücken,
  // damit die Karte nicht irreführend "~100% nutzbar" zeigt.
  const anzeigeFaktor = item.label === "Flachdach" ? M2_PRO_KWP / M2_PRO_KWP_FLACHDACH : item.factor;
  return (
    <TiltButton
      onClick={() => onSelect(item.label)}
      style={{
        padding: "16px 8px 13px",
        borderRadius: theme.radius.lg,
        // Beide Zustände 2px — sonst springt die Karte beim Auswählen.
        border: `2px solid ${active ? theme.color.accent : theme.color.border}`,
        background: active ? theme.color.accentSubtle : theme.color.white,
        cursor: "pointer",
        textAlign: "center",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <RoofIcon item={item} active={active} size={64} />
      </div>
      <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, lineHeight: 1.3, color: active ? theme.color.accentHover : theme.color.textPrimary }}>
        {item.label}
      </div>
      <div style={{ fontSize: 11, color: active ? theme.color.accentHover : theme.color.textMuted, marginTop: 3 }}>
        ~{Math.round(anzeigeFaktor * 100)}% nutzbar
      </div>
    </TiltButton>
  );
}
