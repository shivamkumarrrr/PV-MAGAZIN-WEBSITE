import { useState } from "react";
import theme from "../../theme.js";
import Slider from "../calculator/ui/Slider.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import { siteConfig } from "../../config.js";
import { calculateEAuto, empfehlungPVGroesse } from "../../lib/calculateEAuto.js";

function euro(v) {
  return v.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
}
function euro2(v) {
  return v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export default function EAutoWizard() {
  const [km, setKm] = useState(15000);
  const [verbrauch, setVerbrauch] = useState(18);
  const [ladeverlust, setLadeverlust] = useState(10);
  const [solarAnteil, setSolarAnteil] = useState(0.45);
  const [hsVerbrauch, setHsVerbrauch] = useState(4500);
  const [showResult, setShowResult] = useState(false);

  const result = calculateEAuto({
    km,
    verbrauchPro100: verbrauch,
    ladeverlustPct: ladeverlust,
    solarAnteil,
  });
  const empfehlung = empfehlungPVGroesse(km, hsVerbrauch);

  const restart = () => setShowResult(false);

  if (showResult) {
    return (
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", fontFamily: theme.font.family }}>
        <div style={{ background: theme.color.textPrimary, borderRadius: theme.radius.lg, padding: "32px 28px", color: theme.color.white, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>Ihre Ersparnis pro Jahr</div>
          <div style={{ fontFamily: theme.font.display, fontSize: 42, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: theme.color.accent }}>
            {euro(result.ersparnisProJahr)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
            durch PV-Laden gegenüber reinem Netzladen
          </div>
          <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(255,255,255,0.1)", borderRadius: theme.radius.md, fontSize: 13, opacity: 0.95 }}>
            {result.solarKwh.toLocaleString("de-DE")} kWh kommen pro Jahr aus der PV · Ladekosten nur Netz: {euro(result.kostenNurNetz)} → mit PV: {euro(result.kostenGemischt)}
          </div>
        </div>

        <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: "1 1 130px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Jahresbedarf</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{result.gesamtKwh.toLocaleString("de-DE")} kWh</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>{result.km.toLocaleString("de-DE")} km/Jahr</div>
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Solarstrom</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.success, fontVariantNumeric: "tabular-nums" }}>{result.solarKwh.toLocaleString("de-DE")} kWh</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>{Math.round(result.solarAnteil * 100)} % des Ladens</div>
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Netzstrom</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{result.netzKwh.toLocaleString("de-DE")} kWh</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>{Math.round((1 - result.solarAnteil) * 100)} % des Ladens</div>
          </div>
        </div>

        <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Kosten pro 100 km</div>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: theme.color.success, fontVariantNumeric: "tabular-nums" }}>{euro2(result.kostenPro100Gem)}</div>
              <div style={{ fontSize: 11, color: theme.color.textMuted }}>mit PV (Solar bewertet zu {((result.einspeisewert) * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " ct"})</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{euro2(result.kostenPro100Netz)}</div>
              <div style={{ fontSize: 11, color: theme.color.textMuted }}>nur Netz ({(result.netzpreis * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " ct/kWh"})</div>
            </div>
          </div>
        </div>

        <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "18px 18px", marginBottom: 16, fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.65 }}>
          <strong style={{ color: theme.color.textPrimary }}>Empfohlene PV-Größe:</strong> Für Haushalt (ca. {hsVerbrauch.toLocaleString("de-DE")} kWh) plus E-Auto ({result.gesamtKwh.toLocaleString("de-DE")} kWh) sind grob <strong>{empfehlung.kwp.toLocaleString("de-DE")} kWp</strong> sinnvoll — abhängig von Dachfläche, Ausrichtung und ob Sie tagsüber zu Hause laden. Solarstrom ist beim Laden nicht „kostenlos", sondern mit dem entgangenen Einspeisewert bewertet. Keine Rechtsverbindlichkeit.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
          <a href="/rechner/" style={{ display: "block", textAlign: "center", padding: 14, borderRadius: theme.radius.lg, background: theme.color.accent, color: theme.color.white, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Alle Rechner im Überblick →
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
        <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>E-Auto-Laderechner</h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>Was kostet Ihr E-Auto mit eigener PV — und welche Anlagengröße passt?</p>
      </div>

      <Slider label="Jahresfahrleistung" value={km} onChange={setKm} min={3000} max={40000} step={500} unit="km" />
      <Slider label="Verbrauch" value={verbrauch} onChange={setVerbrauch} min={12} max={30} step={0.5} unit="kWh/100km" />
      <Slider label="Ladeverlust" value={ladeverlust} onChange={setLadeverlust} min={0} max={20} step={1} unit="%" />
      <Slider label="Solarstromanteil am Laden" value={Math.round(solarAnteil * 100)} onChange={(v) => setSolarAnteil(v / 100)} min={0} max={100} step={5} unit="%" />
      <Slider label="Haushaltsverbrauch (für PV-Empfehlung)" value={hsVerbrauch} onChange={setHsVerbrauch} min={1500} max={12000} step={100} unit="kWh" />

      <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "4px 0 14px" }}>
        Ohne PV-Überschussladen liegt der Solarstromanteil oft nur bei 20–35 %.
        Mit smarter Wallbox und PV-Überschusssteuerung sind 40–60 % realistisch
        (bei Speicher und Homeoffice auch mehr).
      </p>

      <ContinueButton label="Ersparnis berechnen" onClick={() => setShowResult(true)} />
    </div>
  );
}
