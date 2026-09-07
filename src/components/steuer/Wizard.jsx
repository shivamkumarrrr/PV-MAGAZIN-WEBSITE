import { useState } from "react";
import theme from "../../theme.js";
import Slider from "../calculator/ui/Slider.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import { siteConfig } from "../../config.js";
import { calculateSteuer, SteuerfreiesKwp } from "../../lib/calculateSteuer.js";

function euro(v) {
  return v.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
}

export default function SteuerWizard() {
  const [kwp, setKwp] = useState(10);
  const [preis, setPreis] = useState(13000);
  const [showResult, setShowResult] = useState(false);

  const result = calculateSteuer(kwp, preis);

  const restart = () => setShowResult(false);

  if (showResult) {
    return (
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", fontFamily: theme.font.family }}>
        <div style={{ background: theme.color.textPrimary, borderRadius: theme.radius.lg, padding: "32px 28px", color: theme.color.white, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>Ihre Mehrwertsteuer-Ersparnis</div>
          <div style={{ fontFamily: theme.font.display, fontSize: 42, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: theme.color.accent }}>
            {euro(result.ersparnisMwst)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
            durch den Nullsteuersatz gegenüber der Rechtslage vor 2023
          </div>
          <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(255,255,255,0.1)", borderRadius: theme.radius.md, fontSize: 13, opacity: 0.95 }}>
            Sie zahlen {euro(result.effektivpreis)} statt {euro(result.bruttopreisAlt)} — Sie haben also {euro(result.ersparnisMwst)} eingespart
          </div>
        </div>

        <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Einkommensteuer</div>
          {result.steuerfrei ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.success, fontVariantNumeric: "tabular-nums" }}>Steuerfrei ✓</div>
              <div style={{ fontSize: 12.5, color: theme.color.textSecondary, marginTop: 4, lineHeight: 1.6 }}>
                Ihre Anlage (≤{SteuerfreiesKwp} kWp) ist nach §&nbsp;3 Nr.&nbsp;72 EStG von der
                Einkommensteuer befreit. Einspeisevergütung und der Wert des
                Eigenverbrauchs (ca. {result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr) bleiben
                komplett bei Ihnen — in der Regel ohne Steuererklärung für die Anlage.
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.danger, fontVariantNumeric: "tabular-nums" }}>Über der Freigrenze</div>
              <div style={{ fontSize: 12.5, color: theme.color.textSecondary, marginTop: 4, lineHeight: 1.6 }}>
                Ihre geplante Anlage ({kwp.toLocaleString("de-DE")} kWp) liegt über der
                Freigrenze von {SteuerfreiesKwp} kWp je Wohn-/Gewerbeeinheit. Für größere
                Anlagen gelten weiterhin steuerliche Regelungen — hier lohnt eine
                fachliche Abstimmung.
              </div>
            </>
          )}
        </div>

        <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "18px 18px", marginBottom: 16, fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.65 }}>
          <strong style={{ color: theme.color.textPrimary }}>So entsteht die Zahl:</strong> Seit dem 1. Januar 2023 gilt für Photovoltaikanlagen auf und an Wohngebäuden der Umsatzsteuer-„Nullsteuersatz" (§ 12 Abs. 3 UStG). Sie kaufen also brutto = netto und zahlen keine 19 % Umsatzsteuer. Für die eingegebene Anlagengröße ist zudem die Einkommensteuerbefreiung nach § 3 Nr. 72 EStG berücksichtigt. Diese Modellrechnung ersetzt keine steuerliche Beratung im Einzelfall.
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
        <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>PV-Steuerrechner</h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>Ihr steuerlicher Vorteil durch Nullsteuersatz & Einkommensteuerbefreiung</p>
      </div>

      <Slider label="Anlagengröße" value={kwp} onChange={setKwp} min={1} max={30} step={0.5} unit="kWp" />
      <Slider label="Kaufpreis (netto)" value={preis} onChange={setPreis} min={3000} max={60000} step={500} unit="€" />

      <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "4px 0 14px" }}>
        Beim Kauf mit Nullsteuersatz zahlen Sie brutto = netto. Geben Sie den
        aufgeführten Kaufpreis ein (ohne Umsatzsteuer) — der Rechner zeigt die
        Ersparnis gegenüber der alten Rechtslage mit 19 % Mehrwertsteuer.
      </p>

      <ContinueButton label="Steuervorteil berechnen" onClick={() => setShowResult(true)} />
    </div>
  );
}
