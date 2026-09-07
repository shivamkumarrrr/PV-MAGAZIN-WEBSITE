import { useState } from "react";
import theme from "../../theme.js";
import Slider from "../calculator/ui/Slider.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import { siteConfig } from "../../config.js";
import { calculateCo2, schaetzeCo2Ertrag, AUTO_CO2_PRO_KM, ZUG_CO2_PRO_PERSONEN_KM } from "../../lib/calculateCo2.js";

function formatKg(v) {
  if (v >= 1000) return (v / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " t";
  return v.toLocaleString("de-DE") + " kg";
}

export default function Co2Wizard() {
  const [kwp, setKwp] = useState(10);
  const [ertrag, setErtrag] = useState(() => schaetzeCo2Ertrag(10));
  const [showResult, setShowResult] = useState(false);

  const onKwpChange = (v) => {
    setKwp(v);
    setErtrag(schaetzeCo2Ertrag(v));
  };

  const result = calculateCo2(kwp, ertrag);

  const restart = () => {
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", fontFamily: theme.font.family }}>
        <div style={{ background: theme.color.textPrimary, borderRadius: theme.radius.lg, padding: "32px 28px", color: theme.color.white, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>Ihre CO₂-Einsparung</div>
          <div style={{ fontFamily: theme.font.display, fontSize: 42, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {formatKg(result.co2ProJahr)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
            pro Jahr · {result.kwp.toLocaleString("de-DE")} kWp · {result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr
          </div>
          <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(255,84,0,0.18)", borderRadius: theme.radius.md, fontSize: 13, color: theme.color.accent }}>
            Über 25 Jahre (mit Moduldegradation) sparen Sie ca. <strong>{formatKg(result.co2Gesamt25Jahre)} CO₂</strong>
          </div>
        </div>

        <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Entspricht</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.success, fontVariantNumeric: "tabular-nums" }}>{result.baeumeProJahr.toLocaleString("de-DE")} Bäume</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>CO₂-Aufnahme von Bäumen pro Jahr</div>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Benzin-Auto</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{result.autoKmProJahr.toLocaleString("de-DE")} km</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>≈ {(result.autoKmProJahr / 1000).toLocaleString("de-DE", { maximumFractionDigits: 0 })} × Deutschland-Diagonale</div>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Fernzug</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{result.zugKmProJahr.toLocaleString("de-DE")} km</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>Personen-km pro Jahr</div>
          </div>
        </div>

        <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "18px 18px", marginBottom: 16, fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.65 }}>
          <strong style={{ color: theme.color.textPrimary }}>So entsteht die Zahl:</strong> Der deutsche Netzstrommix stößt durchschnittlich rund 0,34 kg CO₂ pro kWh aus. Jede kWh, die Ihre Anlage produziert, ersetzt diese eine kWh Netzstrom — die PV-Erzeugung selbst ist im Betrieb praktisch CO₂-frei. Die Modellrechnung nutzt den bundesweiten Durchschnittsertrag (~950 kWh pro kWp) und läuft konservativ über 25 Jahre mit Moduldegradation. Keine Rechtsverbindlichkeit.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
          <a href="/rechner/photovoltaik/" style={{ display: "block", textAlign: "center", padding: 14, borderRadius: theme.radius.lg, background: theme.color.accent, color: theme.color.white, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Zur vollen PV-Rechnung inkl. Ersparnis →
          </a>
          {siteConfig.contact.calendlyUrl && (
            <a href={siteConfig.contact.calendlyUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: 14, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, color: theme.color.textSecondary, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Kostenlose Beratung buchen
            </a>
          )}
          <button onClick={restart} style={{ padding: 12, borderRadius: theme.radius.lg, border: "none", background: "transparent", color: theme.color.textMuted, fontSize: 13, cursor: "pointer" }}>
            Neu berechnen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", background: theme.color.white, borderRadius: theme.radius.lg, border: `1px solid ${theme.color.border}`, padding: "24px 22px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>CO₂-Einsparungsrechner</h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>Wie viel CO₂ spart Ihre Anlage gegenüber dem deutschen Strommix?</p>
      </div>

      <div style={{ fontSize: 11, color: theme.color.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Ihre Anlage
      </div>

      <Slider label="Anlagengröße" value={kwp} onChange={onKwpChange} min={1} max={30} step={0.5} unit="kWp" />
      <Slider label="Jahresertrag" value={ertrag} onChange={setErtrag} min={300} max={30000} step={50} unit="kWh" />

      <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "4px 0 20px" }}>
        Eine {kwp.toLocaleString("de-DE")} kWp-Anlage erzeugt in Deutschland ungefähr{" "}
        <strong>{schaetzeCo2Ertrag(kwp).toLocaleString("de-DE")} kWh</strong> pro Jahr.
        Sie können den Ertrag oben anpassen, wenn Sie den echten Wert Ihrer Anlage kennen.
      </p>

      <ContinueButton label="CO₂-Einsparung berechnen" onClick={() => setShowResult(true)} />
    </div>
  );
}