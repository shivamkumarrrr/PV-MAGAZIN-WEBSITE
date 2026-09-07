import { useState } from "react";
import theme from "../../theme.js";
import LeadForm from "../lead/LeadForm.jsx";
import Slider from "../calculator/ui/Slider.jsx";
import OptionGroup from "../calculator/ui/OptionGroup.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import {
  calculateReinigung,
  UMGEBUNG,
  DACHNEIGUNG,
  schaetzeErtrag,
} from "../../lib/calculateReinigung.js";

const ZUGAENGLICHKEIT_LABEL = {
  "steildach": "Steildach (schwer z.B. mit Absturzsicherung)",
  "gutZugaenglich": "Gut zugänglich (Flach-/Hallendach)",
};

function euro(v) {
  return v.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
}

export default function ReinigungWizard() {
  const [kwp, setKwp] = useState(10);
  const [umgebung, setUmgebung] = useState(UMGEBUNG[0].label);
  const [dachneigung, setDachneigung] = useState(DACHNEIGUNG[2].label);
  const [jahre, setJahre] = useState(3);
  const [eigen, setEigen] = useState(0.4);
  const [zugaenglichkeit, setZugaenglichkeit] = useState("steildach");
  const [showResult, setShowResult] = useState(false);

  const result = calculateReinigung({
    kwp, umgebung, dachneigung,
    jahreSeitLetzter: jahre,
    eigenverbrauchAnteil: eigen,
    zugaenglichkeit,
  });

  const leadZusammenfassung = `${kwp} kWp · ${result.verlustEuroJahr.toLocaleString("de-DE")} €/Jahr Verschmutzungsverlust · Reinigung ${result.reinigungKosten.toLocaleString("de-DE")} €`;
  const leadDaten = {
    anlagengroesse: `${kwp} kWp`,
    ertragsverlust: `${result.verlustKwh.toLocaleString("de-DE")} kWh/Jahr (${result.verlustEuroJahr.toLocaleString("de-DE")} €)`,
    reinigungKosten: `${result.reinigungKosten.toLocaleString("de-DE")} €`,
  };

  const restart = () => setShowResult(false);

  if (showResult) {
    const lohnt = result.lohntSich;
    return (
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", fontFamily: theme.font.family }}>
        <div style={{ background: theme.color.textPrimary, borderRadius: theme.radius.lg, padding: "32px 28px", color: theme.color.white, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>
            {lohnt ? "Reinigung lohnt sich" : "Reinigung lohnt sich (noch) nicht"}
          </div>
          <div
            style={{
              fontFamily: theme.font.display, fontSize: 30, fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: lohnt ? theme.color.accent : "#fff",
            }}
          >
            {lohnt ? `+${euro(result.nettoNutzen)}` : `${euro(Math.abs(result.nettoNutzen))} mehr Kosten`}
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
            {lohnt ? "netto pro Jahr durch die Reinigung" : "kostet die Reinigung jährlich mehr, als Sie einspart"}
          </div>
          <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(255,255,255,0.1)", borderRadius: theme.radius.md, fontSize: 13, opacity: 0.95 }}>
            Verschmutzung kostet Sie <strong>{euro(result.verlustEuroJahr)}/Jahr</strong> — eine Reinigung für {euro(result.reinigungKosten)} {result.amortisationsJahre !== Infinity ? `amortisiert sich in ca. ${result.amortisationsJahre.toLocaleString("de-DE", { maximumFractionDigits: 1 })} Jahren` : "rechnet sich hier nicht"}
          </div>
        </div>

        <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Ertragsverlust</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.danger, fontVariantNumeric: "tabular-nums" }}>
              {(result.verlust * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %
            </div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>{result.verlustKwh.toLocaleString("de-DE")} kWh/Jahr</div>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Jahresverlust</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.danger, fontVariantNumeric: "tabular-nums" }}>{euro(result.verlustEuroJahr)}</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>entgangener Wert pro Jahr</div>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Reinigung</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{euro(result.reinigungKosten)}</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>{result.flaecheM2} m² Modulfläche</div>
          </div>
        </div>

        <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "18px 18px", marginBottom: 16, fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.65 }}>
          <strong style={{ color: theme.color.textPrimary }}>So entsteht die Zahl:</strong> Der Verschmutzungsverlust hängt von Umgebung, Dachneigung und Zeit seit der letzten Reinigung ab (hier {result.verlustKwh} kWh/Jahr, {euro(result.verlustEuroJahr)}). Eine verlorene selbst verbrauchte kWh ist den Bezugspreis wert, eine eingespeiste nur die Vergütung — bewertet mit dem Mischwert von {(result.mischwert * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " ct/kWh"}. Die Reinigungskosten (inkl. Anfahrt) sind eine realistische Branchen-Schätzung. Keine Rechtsverbindlichkeit, keine individuelle Vor-Ort-Beratung.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
        <LeadForm
          rechner="reinigung"
          zusammenfassung={leadZusammenfassung}
          daten={leadDaten}
          onRestart={restart}
        />
        <a href="/rechner/" style={{ display: "block", textAlign: "center", padding: 12, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, color: theme.color.textSecondary, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
          Alle Rechner im Überblick →
        </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", background: theme.color.white, borderRadius: theme.radius.lg, border: `1px solid ${theme.color.border}`, padding: "24px 22px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>PV-Reinigungsrechner</h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>Lohnt sich die Reinigung Ihrer Anlage?</p>
      </div>

      <Slider label="Anlagengröße" value={kwp} onChange={setKwp} min={1} max={30} step={0.5} unit="kWp" />

      <div style={{ fontSize: 11, color: theme.color.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Umgebung</div>
      <OptionGroup options={UMGEBUNG.map((u) => u.label)} selected={umgebung} onSelect={setUmgebung} minCol={120} />
      <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "6px 0 18px" }}>
        {UMGEBUNG.find((u) => u.label === umgebung)?.sub}
      </p>

      <div style={{ fontSize: 11, color: theme.color.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Dachneigung</div>
      <OptionGroup options={DACHNEIGUNG.map((d) => d.label)} selected={dachneigung} onSelect={setDachneigung} minCol={120} />
      <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "6px 0 18px" }}>
        {DACHNEIGUNG.find((d) => d.label === dachneigung)?.sub}
      </p>

      <Slider label="Jahre seit letzter Reinigung" value={jahre} onChange={setJahre} min={0} max={10} step={1} unit="J. / mehr" />
      <Slider label="Eigenverbrauchsanteil" value={Math.round(eigen * 100)} onChange={(v) => setEigen(v / 100)} min={0} max={100} step={5} unit="%" />

      <div style={{ fontSize: 11, color: theme.color.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Zugänglichkeit</div>
      <OptionGroup
        options={Object.entries(ZUGAENGLICHKEIT_LABEL).map(([k, v]) => v)}
        selected={ZUGAENGLICHKEIT_LABEL[zugaenglichkeit]}
        onSelect={(label) => setZugaenglichkeit(Object.keys(ZUGAENGLICHKEIT_LABEL).find((k) => ZUGAENGLICHKEIT_LABEL[k] === label))}
        minCol={120}
      /> 

      <ContinueButton label="Reinigung bewerten" onClick={() => setShowResult(true)} />
    </div>
  );
}
