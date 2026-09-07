import theme from "../../theme.js";
import BarCompare from "../calculator/ui/BarCompare.jsx";
import { LCOE_REFERENZ_PV, LCOE_REFERENZ_PV_SPEICHER, PV_LEBENSDAUER_JAHRE, SPEICHER_LEBENSDAUER_JAHRE } from "../../lib/calculateGestehung.js";
import { siteConfig } from "../../config.js";

export default function ResultScreen({ result, kwp, speicherAktiv, speicherKwh, onRestart }) {
  const referenz = speicherAktiv ? LCOE_REFERENZ_PV_SPEICHER : LCOE_REFERENZ_PV;
  const referenzMinCent = Math.round(referenz.min * 1000) / 10;
  const referenzMaxCent = Math.round(referenz.max * 1000) / 10;

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
        }}
      >
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>
          Ihre Stromgestehungskosten
        </div>
        <div style={{ fontFamily: theme.font.display, fontSize: 42, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {result.lcoeCent.toLocaleString("de-DE")} ct
        </div>
        <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
          pro kWh · {kwp} kWp{speicherAktiv ? ` · ${speicherKwh} kWh Speicher` : ""}
        </div>
        {result.ersparnisProKwh > 0 && (
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
            {result.ersparnisProzent}% günstiger als der aktuelle Netzstrompreis
            ({result.strompreisCent.toLocaleString("de-DE")} ct/kWh, BDEW-Durchschnitt)
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
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textSecondary, marginBottom: 14 }}>
          Ihre Kilowattstunde im Vergleich
        </div>
        <BarCompare
          label1="Ihr Solarstrom"
          val1={result.lcoeCent}
          label2="Netzstrom"
          val2={result.strompreisCent}
          unit="ct/kWh"
          color1={theme.color.accent}
          color2={theme.color.sky}
        />
        <div style={{ fontSize: 12, color: theme.color.textMuted, marginTop: 4 }}>
          Fraunhofer-ISE-Referenzband für vergleichbare Anlagen{speicherAktiv ? " mit Speicher" : ""}:{" "}
          {referenzMinCent.toLocaleString("de-DE")}–{referenzMaxCent.toLocaleString("de-DE")} ct/kWh
        </div>
      </div>

      <div
        style={{
          background: theme.color.white,
          borderRadius: theme.radius.lg,
          border: `1.5px solid ${theme.color.border}`,
          padding: "20px 18px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textSecondary, marginBottom: 10 }}>
          So haben wir das berechnet
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: theme.color.textPrimary }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: theme.color.textMuted }}>Investition (Anlage{speicherAktiv ? " + Speicher" : ""})</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(result.investition).toLocaleString("de-DE")} €</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: theme.color.textMuted }}>Wartung über {PV_LEBENSDAUER_JAHRE} Jahre</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(result.kumulierteWartung).toLocaleString("de-DE")} €</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: theme.color.textMuted }}>Wechselrichter-Austausch</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(result.wechselrichterKostenWert).toLocaleString("de-DE")} €</span>
          </div>
          {speicherAktiv && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: theme.color.textMuted }}>Speicher-Ersatz (Jahr {SPEICHER_LEBENSDAUER_JAHRE})</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(result.speicherErsatz).toLocaleString("de-DE")} €</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${theme.color.border}`, paddingTop: 8, fontWeight: 600 }}>
            <span>Gesamtkosten über {PV_LEBENSDAUER_JAHRE} Jahre</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(result.gesamtkosten).toLocaleString("de-DE")} €</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: theme.color.textMuted }}>Gesamtertrag über {PV_LEBENSDAUER_JAHRE} Jahre (mit Degradation)</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{result.kumulierterErtrag.toLocaleString("de-DE")} kWh</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: theme.color.textMuted, marginTop: 12, marginBottom: 0 }}>
          Vereinfachte, undiskontierte Rechnung (Gesamtkosten ÷ Gesamtertrag)
          — methodisch einfacher als das vollständige Fraunhofer-ISE-Modell
          mit Kapitalkosten-Diskontierung, für eine Größenordnungs-Einordnung
          aber ausreichend. Unverbindliche Modellrechnung, keine
          Rechtsverbindlichkeit.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 16,
        }}
      >
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
          onClick={onRestart}
          style={{
            padding: 12,
            borderRadius: theme.radius.lg,
            border: "none",
            background: "transparent",
            color: theme.color.textMuted,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Neu berechnen
        </button>
      </div>
    </div>
  );
}
