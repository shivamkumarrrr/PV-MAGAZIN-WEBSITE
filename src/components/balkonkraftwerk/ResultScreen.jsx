import theme from "../../theme.js";
import LeadForm from "../lead/LeadForm.jsx";
import BalkonIcon from "./BalkonIcon.jsx";
import { WECHSELRICHTER_GRENZE_W, EIGENVERBRAUCH_ANTEIL } from "../../lib/calculateBalkonkraftwerk.js";

export default function ResultScreen({ result, modulleistung, onRestart }) {
  const leadZusammenfassung = `${modulleistung} Wp · ${result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr · ${result.jahresersparnis.toLocaleString("de-DE")} €/Jahr`;
  const leadDaten = {
    modulleistung: `${modulleistung} Wp`,
    jahresertrag: `${result.jahresertrag.toLocaleString("de-DE")} kWh`,
    jahresersparnis: `${result.jahresersparnis.toLocaleString("de-DE")} €`,
    investition: `${result.investition.toLocaleString("de-DE")} €`,
    amortisation: result.amortisation != null ? `${result.amortisation} Jahre` : "nicht bezifferbar",
  };

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
        <div style={{ position: "absolute", top: -10, right: -6, opacity: 0.9 }}>
          <BalkonIcon size={100} />
        </div>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>
          Ihr Ergebnis
        </div>
        <div style={{ fontFamily: theme.font.display, fontSize: 42, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {result.jahresersparnis.toLocaleString("de-DE")} €
        </div>
        <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
          geschätzte Ersparnis pro Jahr · {modulleistung.toLocaleString("de-DE")} Wp
        </div>
        {result.amortisation != null && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 16px",
              background: "rgba(255,84,0,0.18)",
              borderRadius: theme.radius.md,
              fontSize: 13,
              color: theme.color.accent,
            }}
          >
            Amortisiert nach ca. <strong>{result.amortisation.toLocaleString("de-DE")} Jahren</strong> (Anschaffungspreis {result.investition.toLocaleString("de-DE")} €)
          </div>
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
          <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Jahresertrag</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
            {result.jahresertrag.toLocaleString("de-DE")} kWh
          </div>
          {result.gedeckelt && (
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>
              gedeckelt durch die {WECHSELRICHTER_GRENZE_W}-W-Einspeisegrenze
            </div>
          )}
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Eigenverbrauch</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
            {result.eigenverbrauch.toLocaleString("de-DE")} kWh
          </div>
          <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>
            angenommen {Math.round(EIGENVERBRAUCH_ANTEIL * 100)} % des Ertrags
          </div>
        </div>
      </div>

      <div
        style={{
          background: theme.color.white,
          borderRadius: theme.radius.lg,
          border: `1.5px solid ${theme.color.border}`,
          padding: "18px 18px",
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 12.5, color: theme.color.textMuted, margin: 0, lineHeight: 1.6 }}>
          Modellrechnung auf Basis der bundesweiten Ertragsfaktoren aus dem
          PV-Rechner, gedeckelt auf einen realistischen Jahresertrag für
          800-W-Steckersolargeräte. Der angenommene Eigenverbrauchsanteil
          ({Math.round(EIGENVERBRAUCH_ANTEIL * 100)} %) ist eine plausible
          Schätzung, keine belastbare externe Quelle — bei sehr abendlastigem
          Verbrauch kann der reale Anteil niedriger liegen. Unverbindliche
          Modellrechnung, keine Rechtsverbindlichkeit.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
      <LeadForm
        rechner="balkonkraftwerk"
        zusammenfassung={leadZusammenfassung}
        daten={leadDaten}
        onRestart={onRestart}
      />
      <a href="/rechner/" style={{ display: "block", textAlign: "center", padding: 12, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, color: theme.color.textSecondary, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
        Alle Rechner im Überblick →
      </a>
      </div>
    </div>
  );
}
