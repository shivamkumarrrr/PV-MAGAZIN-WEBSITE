import { useState } from "react";
import theme from "../../theme.js";
import Slider from "../calculator/ui/Slider.jsx";
import Toggle from "../calculator/ui/Toggle.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import ResultScreen from "./ResultScreen.jsx";
import { calculateGestehung, schaetzeJahresertrag } from "../../lib/calculateGestehung.js";
import { KOSTEN_PRO_KWP, SPEICHER_KOSTEN_PRO_KWH } from "../../lib/calculate.js";

const STEPS = ["Anlage", "Ertrag", "Speicher"];

export default function Wizard() {
  const [step, setStep] = useState(0);
  const [kwp, setKwp] = useState(8.5);
  const [investition, setInvestition] = useState(null); // null = auto aus kwp abgeleitet
  const [jahresertrag, setJahresertrag] = useState(null); // null = auto aus kwp abgeleitet
  const [speicherAktiv, setSpeicherAktiv] = useState(false);
  const [speicherKwh, setSpeicherKwh] = useState(5);
  const [showResult, setShowResult] = useState(false);

  const effektiveInvestition = investition ?? Math.round(kwp * KOSTEN_PRO_KWP);
  const effektiverErtrag = jahresertrag ?? schaetzeJahresertrag(kwp);

  const result = calculateGestehung(kwp, effektiverErtrag, speicherAktiv ? speicherKwh : 0);

  const restart = () => {
    setShowResult(false);
    setStep(0);
  };

  if (showResult) {
    return (
      <ResultScreen
        result={result}
        kwp={kwp}
        speicherAktiv={speicherAktiv}
        speicherKwh={speicherKwh}
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
          Gestehungskostenrechner
        </h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>
          3 kurze Schritte — Ihre Stromgestehungskosten in ct/kWh
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
            <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Ihre Anlagengröße</div>
            <div style={{ fontSize: 13, color: theme.color.textMuted }}>Anlagenleistung und Investitionssumme</div>
          </>
        )}
        {step === 1 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Ihr Jahresertrag</div>
            <div style={{ fontSize: 13, color: theme.color.textMuted }}>Voreingestellt aus einem bundesweiten Durchschnittswert</div>
          </>
        )}
        {step === 2 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Speicher (optional)</div>
            <div style={{ fontSize: 13, color: theme.color.textMuted }}>Erhöht Investition und Lebensdauer-Kosten</div>
          </>
        )}
      </div>

      <div style={{ minHeight: 220 }}>
        {step === 0 && (
          <>
            <Slider
              label="Anlagenleistung"
              value={kwp}
              onChange={(v) => { setKwp(v); setInvestition(null); }}
              min={2}
              max={30}
              step={0.5}
              unit="kWp"
            />
            <Slider
              label="Investitionssumme"
              value={effektiveInvestition}
              onChange={setInvestition}
              min={Math.round(kwp * 900)}
              max={Math.round(kwp * 1600)}
              step={100}
              unit="€"
            />
            <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "4px 0 0" }}>
              Voreingestellt mit {KOSTEN_PRO_KWP.toLocaleString("de-DE")} €/kWp
              (Fraunhofer-ISE-Richtwert) — bei vorliegendem Angebot den echten
              Preis eintragen.
            </p>
            <ContinueButton onClick={() => setStep(1)} />
          </>
        )}
        {step === 1 && (
          <>
            <Slider
              label="Jahresertrag"
              value={effektiverErtrag}
              onChange={setJahresertrag}
              min={Math.round(kwp * 700)}
              max={Math.round(kwp * 1150)}
              step={25}
              unit="kWh"
            />
            <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "4px 0 0" }}>
              Voreingestellt mit 950 kWh/kWp (bundesweiter Durchschnitt). Für
              Ihren genauen Standort liefert der{" "}
              <a href="/rechner/photovoltaik/" style={{ color: theme.color.accentHover }}>
                PV-Rechner
              </a>{" "}
              einen echten PVGIS-Wert, den Sie hier übertragen können.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setStep(0)}
                style={{ flex: 1, padding: 14, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, background: theme.color.white, color: theme.color.textSecondary, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              >
                ← Zurück
              </button>
              <div style={{ flex: 2 }}>
                <ContinueButton onClick={() => setStep(2)} />
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <Toggle
              label="Batteriespeicher hinzufügen"
              sub={`ca. ${SPEICHER_KOSTEN_PRO_KWH.toLocaleString("de-DE")} €/kWh Kapazität`}
              checked={speicherAktiv}
              onChange={setSpeicherAktiv}
            />
            {speicherAktiv && (
              <Slider
                label="Speicherkapazität"
                value={speicherKwh}
                onChange={setSpeicherKwh}
                min={2}
                max={20}
                step={0.5}
                unit="kWh"
              />
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setStep(1)}
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
