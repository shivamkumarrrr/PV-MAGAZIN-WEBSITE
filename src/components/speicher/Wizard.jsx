import { useState } from "react";
import theme from "../../theme.js";
import Slider from "../calculator/ui/Slider.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import { siteConfig } from "../../config.js";
import { calculateSpeicher, SPEICHER_LEBENSDAUER_JAHRE } from "../../lib/calculateSpeicher.js";

const STEPS = ["Ihre Anlage", "Speicher"];

function formatEur(v) {
  return v.toLocaleString("de-DE") + " €";
}

export default function SpeicherWizard() {
  const [step, setStep] = useState(0);
  const [kwp, setKwp] = useState(10);
  const [jahresverbrauch, setJahresverbrauch] = useState(4500);
  const [speicherKwh, setSpeicherKwh] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const result = calculateSpeicher(speicherKwh, kwp, jahresverbrauch);

  const restart = () => {
    setShowResult(false);
    setStep(0);
  };

  if (showResult) {
    return (
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", fontFamily: theme.font.family }}>
        <div
          style={{
            background: theme.color.textPrimary,
            borderRadius: theme.radius.lg,
            padding: "32px 28px",
            color: theme.color.white,
            marginBottom: 20,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>
            Ihr Ergebnis
          </div>
          {result.speicherKwh <= 0 ? (
            <div style={{ fontFamily: theme.font.display, fontSize: 30, fontWeight: 600 }}>
              Kein Speicher gewählt
            </div>
          ) : (
            <>
              <div style={{ fontFamily: theme.font.display, fontSize: 42, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {result.lohntSich
                  ? `nach ~${result.amortisation.toLocaleString("de-DE")} Jahren`
                  : `über ${SPEICHER_LEBENSDAUER_JAHRE} Jahre`}
              </div>
              <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
                {result.speicherKwh.toLocaleString("de-DE")} kWh Speicher amortisiert sich {result.lohntSich ? "innerhalb" : "nicht sicher innerhalb"} seiner Lebensdauer
              </div>
            </>
          )}
        </div>

        <div
          style={{
            background: theme.color.white,
            borderRadius: theme.radius.lg,
            border: `1.5px solid ${theme.color.border}`,
            padding: "20px 18px",
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Mehr-Eigenverbrauch</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
              {result.mehrEigenverbrauch.toLocaleString("de-DE")} kWh/Jahr
            </div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>
              Faustregel {result.nutzbarKwh.toLocaleString("de-DE")} kWh nutzbar × 200 kWh
            </div>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Jährliche Ersparnis</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
              {formatEur(result.jahresMehrErsparnis)}
            </div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>
              {result.mehrEigenverbrauch.toLocaleString("de-DE")} kWh × {result.spread.toFixed(3)} € Spread
            </div>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Investition</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
              {formatEur(result.investition)}
            </div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>
              empfohlen bei Ihrer Anlage: ~{result.empfohlen} kWh
            </div>
          </div>
        </div>

        <div
          style={{
            background: result.lohntSich ? "#eaf8ef" : "#fdeeea",
            borderRadius: theme.radius.lg,
            border: `1.5px solid ${result.lohntSich ? "#2f9e63" : theme.color.accent}`,
            padding: "18px 18px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 6 }}>
            {result.lohntSich
              ? "Der Speicher rechnet sich innerhalb seiner Lebensdauer."
              : "Ehrliche Einordnung: Der Speicher zahlt sich rein rechnerisch kaum aus."}
          </div>
          <p style={{ fontSize: 12.5, color: theme.color.textSecondary, margin: 0, lineHeight: 1.65 }}>
            {result.speicherKwh <= 0
              ? "Sie haben keinen Speicher gewählt — ohne Speicher gibt es keinen Mehr-Eigenverbrauch zu bewerten."
              : result.lohntSich
              ? `Mit einer Amortisation von ca. ${result.amortisation.toLocaleString("de-DE")} Jahren liegt dieser Speicher im Bereich der üblichen Lebensdauer (${SPEICHER_LEBENSDAUER_JAHRE} Jahre). `
                + "Wichtig: Der größte Nutzen eines Speichers ist nicht die reine Wirtschaftlichkeit, sondern höhere "
                + "Autarkie, Unabhängigkeit vom Strompreis und die Möglichkeit, Strom für den Abend zu puffern."
              : `Mit ca. ${result.amortisation.toLocaleString("de-DE")} Jahren liegt die Amortisation über der Lebensdauer (${SPEICHER_LEBENSDAUER_JAHRE} Jahre). `
                + "Trotzdem kann ein Speicher sinnvoll sein — wenn Ihnen Autarkie, Unabhängigkeit vom Strompreis oder "
                + "Notstrom wichtig sind. Für die reine Rendite ist bei aktuellen Preisen aber oft günstiger, den Strom "
                + "direkt zu verbrauchen oder einzuspeisen."}
          </p>
          <p style={{ fontSize: 11.5, color: theme.color.textMuted, margin: "8px 0 0", lineHeight: 1.5 }}>
            Diese Bewertung trennt bewusst die reine Wirtschaftlichkeit vom praktischen Nutzen. Modellrechnung, keine
            Rechtsverbindlichkeit — ein Angebot ersetzt sie nicht.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {!result.lohntSich && result.speicherKwh > 0 && (
            <a
              href="/rechner/"
              style={{
                display: "block",
                textAlign: "center",
                padding: 14,
                borderRadius: theme.radius.lg,
                background: theme.color.accent,
                color: theme.color.white,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Weitere Rechner entdecken →
            </a>
          )}
          {siteConfig.contact.calendlyUrl && (
            <a
              href={siteConfig.contact.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                padding: 14,
                borderRadius: theme.radius.lg,
                border: `1.5px solid ${theme.color.border}`,
                color: theme.color.textSecondary,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Kostenlose Beratung buchen
            </a>
          )}
          <button
            onClick={restart}
            style={{ padding: 12, borderRadius: theme.radius.lg, border: "none", background: "transparent", color: theme.color.textMuted, fontSize: 13, cursor: "pointer" }}
          >
            Neu berechnen
          </button>
        </div>
      </div>
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
          Speicher-Rechner
        </h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>
          Lohnt sich der Batteriespeicher zu Ihrer PV-Anlage?
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{ flex: 1, height: 5, borderRadius: 3, background: i <= step ? theme.color.accent : theme.color.border, transition: "background 0.3s" }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ fontSize: 10, color: i <= step ? theme.color.accentHover : theme.color.border, fontWeight: i === step ? 600 : 400, textAlign: "center", flex: 1 }}>
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
            <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Ihre Photovoltaik-Anlage</div>
            <div style={{ fontSize: 13, color: theme.color.textMuted }}>Leistung und Stromverbrauch des Haushalts</div>
          </>
        )}
        {step === 1 && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Ihr Speicher</div>
            <div style={{ fontSize: 13, color: theme.color.textMuted }}>Wie groß soll der Batteriespeicher sein?</div>
          </>
        )}
      </div>

      <div style={{ minHeight: 200 }}>
        {step === 0 && (
          <>
            <Slider label="PV-Anlagengröße" value={kwp} onChange={setKwp} min={4} max={20} step={0.5} unit="kWp" />
            <Slider label="Jahresstromverbrauch" value={jahresverbrauch} onChange={setJahresverbrauch} min={2000} max={10000} step={100} unit="kWh" />
            <ContinueButton onClick={() => setStep(1)} />
          </>
        )}
        {step === 1 && (
          <>
            <Slider
              label="Speicherkapazität (nutzbar)"
              value={speicherKwh}
              onChange={setSpeicherKwh}
              min={0}
              max={20}
              step={0.5}
              unit="kWh"
            />
            <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "4px 0 20px" }}>
              Faustregel: etwa 1 kWh Speicher pro 1 kWp Anlage. Für Ihre
              {kwp.toLocaleString("de-DE")} kWp wären das ca.{" "}
              <strong>{result.empfohlen} kWh</strong>.
            </p>
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
