import { useState } from "react";
import theme from "../../theme.js";
import Slider from "../calculator/ui/Slider.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import ResultScreen from "./ResultScreen.jsx";
import { AUSRICHTUNG, NEIGUNG } from "../../lib/calculate.js";
import { calculateBalkonkraftwerk, MAX_MODULLEISTUNG_WP } from "../../lib/calculateBalkonkraftwerk.js";

const STEPS = ["Standort", "Modul"];

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [ausrichtung, setAusrichtung] = useState("Süd");
  const [neigung, setNeigung] = useState("Mittel (25–35°)");
  const [modulleistung, setModulleistung] = useState(880);
  const [investition, setInvestition] = useState(600);
  const [showResult, setShowResult] = useState(false);

  const result = calculateBalkonkraftwerk(modulleistung, ausrichtung, neigung, investition);

  const restart = () => {
    setShowResult(false);
    setStep(0);
  };

  if (showResult) {
    return (
      <ResultScreen
        result={result}
        modulleistung={modulleistung}
        onRestart={restart}
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: theme.maxWidth,
        margin: "0 auto",
        background: theme.color.white,
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.color.border}`,
        padding: "24px 22px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>
          Balkonkraftwerk-Rechner
        </h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>
          2 kurze Schritte — Ertrag und Amortisation für Ihr Steckersolargerät
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: i <= step ? theme.color.accent : theme.color.border,
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {STEPS.map((label, i) => (
            <div
              key={label}
              style={{
                fontSize: 10,
                color: i <= step ? theme.color.accentHover : theme.color.border,
                fontWeight: i === step ? 600 : 400,
                textAlign: "center",
                flex: 1,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: theme.color.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
          Schritt {step + 1} von {STEPS.length}
        </div>
        {step === 0 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Wo hängt das Modul?</div>
            <div style={{ fontSize: 13, color: theme.color.textMuted }}>Ausrichtung und Neigung von Balkon oder Fassade</div>
          </>
        )}
        {step === 1 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Ihr Steckersolargerät</div>
            <div style={{ fontSize: 13, color: theme.color.textMuted }}>Modulleistung und Anschaffungspreis</div>
          </>
        )}
      </div>

      <div style={{ minHeight: 200 }}>
        {step === 0 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Ausrichtung</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {AUSRICHTUNG.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => setAusrichtung(a.label)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: theme.radius.pill,
                      border: `1.5px solid ${ausrichtung === a.label ? theme.color.accent : theme.color.border}`,
                      background: ausrichtung === a.label ? theme.color.accentSubtle : theme.color.white,
                      color: ausrichtung === a.label ? theme.color.accentHover : theme.color.textSecondary,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Neigung</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {NEIGUNG.map((n) => (
                  <button
                    key={n.label}
                    onClick={() => setNeigung(n.label)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: theme.radius.pill,
                      border: `1.5px solid ${neigung === n.label ? theme.color.accent : theme.color.border}`,
                      background: neigung === n.label ? theme.color.accentSubtle : theme.color.white,
                      color: neigung === n.label ? theme.color.accentHover : theme.color.textSecondary,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>
            <ContinueButton onClick={() => setStep(1)} />
          </>
        )}
        {step === 1 && (
          <>
            <Slider
              label="Modulleistung"
              value={modulleistung}
              onChange={setModulleistung}
              min={400}
              max={MAX_MODULLEISTUNG_WP}
              step={20}
              unit="Wp"
            />
            <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "4px 0 20px" }}>
              Üblich sind zwei Module à ca. 440 Wp (880 Wp gesamt). Mehr
              Modulleistung als für {MAX_MODULLEISTUNG_WP} Wp erlaubt geht
              nicht — der Wechselrichter deckelt die Einspeisung ohnehin auf
              800 W.
            </p>
            <Slider
              label="Anschaffungspreis"
              value={investition}
              onChange={setInvestition}
              min={300}
              max={900}
              step={20}
              unit="€"
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setStep(0)}
                style={{ flex: 1, padding: 14, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, background: theme.color.white, color: theme.color.textSecondary, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              >
                ← Zurück
              </button>
              <div style={{ flex: 2 }}>
                <ContinueButton label="Ergebnis berechnen" onClick={() => setShowResult(true)} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
