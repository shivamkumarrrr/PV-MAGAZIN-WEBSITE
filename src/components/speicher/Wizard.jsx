import { useState } from "react";
import theme from "../../theme.js";
import LeadForm from "../lead/LeadForm.jsx";
import Slider from "../calculator/ui/Slider.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import Faltblock from "../calculator/ui/Faltblock.jsx";
import BarCompare from "../calculator/ui/BarCompare.jsx";
import { calculateSpeicher, SPEICHER_LEBENSDAUER_JAHRE, SPEICHER_WIRKUNGSGRAD } from "../../lib/calculateSpeicher.js";
import { SPEICHER_KOSTEN_PRO_KWH, STROMPREIS } from "../../lib/calculate.js";

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

  // Klartext-Zusammenfassung + Feldwerte für das Lead-Formular.
  const leadZusammenfassung = `${kwp} kWp · ${speicherKwh} kWh Speicher · ${result.jahresMehrErsparnis.toLocaleString("de-DE")} €/Jahr Mehr-Ersparnis`;
  const leadDaten = {
    anlagengroesse: `${kwp} kWp`,
    speicherKwh: `${speicherKwh} kWh`,
    mehrEigenverbrauch: `${result.mehrEigenverbrauch.toLocaleString("de-DE")} kWh/Jahr`,
    jahresersparnis: `${result.jahresMehrErsparnis.toLocaleString("de-DE")} €`,
    investition: `${result.investition.toLocaleString("de-DE")} €`,
    amortisation: result.amortisation != null ? `${result.amortisation} Jahre` : "nicht bezifferbar",
  };

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
              +{result.autarkieGewinnProzentpunkte.toLocaleString("de-DE")} Prozentpunkte Autarkie
              {result.speicherKwh > 0 && ` · ${result.mehrEigenverbrauchProKwh.toLocaleString("de-DE")} kWh je kWh Speicher`}
            </div>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Jährliche Ersparnis</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
              {formatEur(result.jahresMehrErsparnis)}
            </div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>
              {result.mehrEigenverbrauch.toLocaleString("de-DE")} kWh × {result.spread.toLocaleString("de-DE", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} € Spread
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
            background: result.lohntSich ? theme.color.successSubtle : theme.color.dangerSubtle,
            borderRadius: theme.radius.lg,
            border: `1.5px solid ${result.lohntSich ? theme.color.success : theme.color.accent}`,
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
              : result.amortisation === null
              ? "Bei dieser Kombination aus Anlagengröße und Verbrauch bleibt kein nennenswerter Überschuss übrig, den "
                + "ein Speicher noch zwischenspeichern könnte — der Mehr-Eigenverbrauch geht gegen null. Eine "
                + "Amortisation lässt sich damit nicht sinnvoll angeben."
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

        {/* Der eigentliche Effekt eines Speichers ist der Autarkiegewinn, nicht
            die Amortisation — beide Balken kommen aus derselben Kennlinie
            (autarkieSchaetzung), die auch der Haupt-Rechner nutzt. Sky-Farbe
            bleibt Datenelementen vorbehalten. */}
        {result.speicherKwh > 0 && (
          <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 14 }}>
              Autarkiegrad: das ist der eigentliche Effekt
            </div>
            <BarCompare
              label1="Ohne Speicher"
              val1={Math.round(result.autarkieOhne * 100)}
              label2="Mit Speicher"
              val2={Math.round(result.autarkieMit * 100)}
              unit="%"
              color1={theme.color.textMuted}
              color2={theme.color.sky}
            />
            <p style={{ fontSize: 12, color: theme.color.textMuted, margin: 0, lineHeight: 1.6 }}>
              Anteil Ihres Jahresverbrauchs, den Sie selbst decken. Der Speicher hebt diesen Anteil — die
              Amortisation verkürzt er dadurch nicht, weil er zusätzlich Geld kostet.
            </p>
          </div>
        )}

        <Faltblock
          zeilen={[
            { label: "Speicherkosten", wert: `${SPEICHER_KOSTEN_PRO_KWH.toLocaleString("de-DE")} €/kWh nutzbare Kapazität` },
            { label: "Spread (Strompreis − Einspeisevergütung)", wert: `${(result.spread * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Ct/kWh` },
            { label: "Angesetzter Strompreis", wert: `${(STROMPREIS * 100).toFixed(0)} Ct/kWh` },
            { label: "Round-Trip-Wirkungsgrad (Geräte-Kennzahl)", wert: `${Math.round(SPEICHER_WIRKUNGSGRAD * 100)} %` },
            { label: "Angesetzte Lebensdauer", wert: `${SPEICHER_LEBENSDAUER_JAHRE} Jahre` },
          ]}
        >
          <p style={{ margin: "0 0 8px" }}>
            Der Mehr-Eigenverbrauch stammt aus derselben Autarkie-Kennlinie wie der Photovoltaik-Hauptrechner, nicht aus
            einer eigenen Faustregel — beide Rechner liefern für dieselbe Anlage deshalb denselben Wert. Die Kennlinie
            orientiert sich an den vom ADAC kommunizierten Autarkiegraden realer Anlagen (30–55 % ohne, bis zu 85 % mit
            sinnvoll dimensioniertem Speicher) und bildet damit auch die Sättigung ab: Ab einer gewissen Größe findet der
            Speicher schlicht keinen zusätzlichen Überschuss mehr zum Zwischenspeichern.
          </p>
          <p style={{ margin: 0 }}>
            Amortisation = Speicherinvestition ÷ (Mehr-Eigenverbrauch × Spread). Der Wirkungsgrad wird bewusst nicht
            zusätzlich abgezogen: In den gemessenen Autarkiegraden stecken die Systemverluste bereits, ein zweiter Abzug
            wäre eine Doppelzählung. Speicherpreis {SPEICHER_KOSTEN_PRO_KWH} €/kWh nach aktuellen Marktpreisübersichten
            (LiFePO₄), Lebensdauer nach Fraunhofer ISE.
          </p>
        </Faltblock>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <LeadForm
            rechner="speicher"
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
