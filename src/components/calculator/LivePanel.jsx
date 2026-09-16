import { useEffect, useState } from "react";
import theme from "../../theme.js";
import Energiefluss from "./ui/Energiefluss.jsx";
import { formatSpan } from "../../lib/calculate.js";
import { useAnimatedNumber } from "../../lib/useAnimatedNumber.js";

function AutarkieBalken({ pct, bereit = true }) {
  const animiert = useAnimatedNumber(pct);
  const gezeigt = Math.round(animiert);
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 7, marginBottom: 7 }}>
        <span style={{ fontSize: 13, color: theme.color.textSecondary }}>Autarkie</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: bereit ? theme.color.accentText : theme.color.textMuted, fontVariantNumeric: "tabular-nums" }}>{bereit ? `${gezeigt} %` : "–"}</span>
      </div>
      <div
        style={{ height: 8, borderRadius: theme.radius.pill, background: theme.color.bg, overflow: "hidden" }}
        role="img"
        aria-label={bereit ? `Autarkiegrad ${gezeigt} Prozent` : "Autarkiegrad noch nicht berechnet"}
      >
        <div style={{ width: `${Math.min(100, Math.max(0, animiert))}%`, height: "100%", borderRadius: theme.radius.pill, background: theme.color.accent }} />
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderTop: `1px solid ${theme.color.border}` }}>
      <span style={{ color: theme.color.textSecondary }}>{label}</span>
      <span style={{ fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

// Live-Vorschau neben dem Wizard: zeigt die aktuelle Berechnung, ohne dass der
// Besucher den Ergebnis-Screen aufrufen muss. Aktualisiert sich mit jeder Eingabe,
// weil Wizard `calculate()` bei jedem Render neu aufruft.
//
// Herzstück ist das Flussbild (`Energiefluss.jsx`): Haus in der Mitte, die vier
// Ströme als Bögen daran. Es hat den Autarkie-Ring UND das Monatschart ersetzt,
// die vorher beide hier standen — drei Grafiken in einer 400px-Spalte waren ein
// Verstoß gegen Design-Regel 11 (ein Signature-Element statt vieler
// Mini-Dekorationen). Der Monatsverlauf steht weiterhin auf der Ergebnisseite.
//
// `flashKey` wechselt, wenn eine NEUE Standort-Berechnung (z.B. neue PLZ) fertig
// geladen wurde — dann pulsiert der Ersparnis-Block kurz, als visuelles "Rechnen
// fertig". Alle Zahlen laufen zusätzlich per Count-up auf ihren neuen Wert.
// `bereit` = Dachform gewählt UND ein Verbrauch bekannt. Seit im Rechner
// nichts mehr vorausgewählt ist, darf die Vorschau nicht von der ersten
// Sekunde an eine fertige Ersparnis für ein Haus zeigen, das niemand
// beschrieben hat.
//
// Sie wird deswegen aber NICHT ausgeblendet (Nutzervorgabe): Das Panel steht
// immer, mit Haus, Flussbild und Balken. Vor der ersten Angabe stehen dort
// Gedankenstriche statt Zahlen und die Ströme sind zurückgenommen. Ein Panel,
// das erst auftaucht und dabei die halbe Seitenspalte aufschiebt, ist der
// unruhigere Weg — und die Vorschau soll von Anfang an zeigen, WAS sie gleich
// beantwortet.
export default function LivePanel({ result, speicherKwh, flashKey, bereit = true }) {
  const [flash, setFlash] = useState(0);
  useEffect(() => { if (flashKey) setFlash((f) => f + 1); }, [flashKey]);

  const animatedErsparnis = useAnimatedNumber(result.jahresErsparnis);

  return (
    <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1px solid ${theme.color.border}`, padding: 20 }}>
      <style>{`
        @keyframes valueFlash {
          0% { background: ${theme.color.accentSubtle}; transform: scale(1.02); }
          100% { background: transparent; transform: scale(1); }
        }
        @keyframes livePanelPuls {
          0% { transform: scale(0.6); opacity: 0.5; }
          70%, 100% { transform: scale(2.1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-panel-punkt-ring { animation: none; opacity: 0; }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: theme.color.textPrimary }}>
          {/* Derselbe Punkt wie im Mini-Rechner auf der Startseite
              (RechnerWidget.jsx) — dieselbe Aussage ("rechnet gerade live"),
              hier zusätzlich zum bereits vorhandenen Textlabel. */}
          <span style={{ position: "relative", width: 7, height: 7, flexShrink: 0 }} aria-hidden="true">
            <span
              className="live-panel-punkt-ring"
              style={{ position: "absolute", inset: -4, borderRadius: "50%", background: theme.color.success, animation: "livePanelPuls 2s ease-out infinite" }}
            />
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: theme.color.success }} />
          </span>
          Live-Vorschau
        </div>
        <div style={{ fontSize: 11, color: theme.color.textMuted }}>ändert sich mit jeder Eingabe</div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 13, color: theme.color.textSecondary }}>geschätzte Ersparnis</div>
        <div
          key={`flash-${flash}`}
          style={{
            fontSize: 27,
            fontWeight: 700,
            color: theme.color.accentHover,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            borderRadius: 8,
            padding: "2px 4px",
            margin: "0 -4px",
            animation: flash > 0 ? "valueFlash 0.8s ease" : "none",
          }}
        >
          {bereit ? `${formatSpan(Math.round(animatedErsparnis))} €` : "–"}
        </div>
        <div style={{ fontSize: 11, color: theme.color.textMuted }}>
          {bereit ? "pro Jahr" : "sobald Dachform und Verbrauch feststehen"}
        </div>
      </div>

      {/* Überschrift über dem Flussbild, damit die Zahlen darin eine Bezugsgröße
          haben — ohne sie stünde dort "9.831 kWh" ohne Zeitraum. */}
      <div style={{ fontSize: 11, color: theme.color.textMuted, textAlign: "center", marginTop: 14 }}>
        So verteilt sich der Strom im Jahr
      </div>
      <Energiefluss result={result} speicherKwh={speicherKwh} bereit={bereit} />

      <AutarkieBalken pct={bereit ? result.autarkie : 0} bereit={bereit} />

      <div style={{ marginTop: 14 }}>
        <StatRow label="Anlagengröße" value={bereit ? `${result.kwp} kWp · ${result.module} Module` : "–"} />
        <StatRow label="Speicher" value={speicherKwh > 0 ? `${speicherKwh} kWh` : "keiner"} />
      </div>
    </div>
  );
}
