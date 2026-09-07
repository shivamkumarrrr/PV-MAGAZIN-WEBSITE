import theme from "../../theme.js";
import SunArc from "../SunArc.jsx";
import { formatSpan } from "../../lib/calculate.js";

export default function ResultHeader({ result, displayLocation, savingsRef, savingsCount }) {
  return (
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
      <div style={{ position: "absolute", bottom: -10, right: -10, opacity: 0.5 }}>
        <SunArc variant="compact" />
      </div>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>
        Ihr Ergebnis
      </div>
      <div ref={savingsRef} style={{ fontFamily: theme.font.display, fontSize: 42, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
        {formatSpan(savingsCount)} €
      </div>
      <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
        geschätzte Ersparnis pro Jahr ±12%{displayLocation ? ` · ${displayLocation}` : ""}
      </div>
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
        {/* 25-Jahres-Wert: deutlich mehr kumulierte Unsicherheit als der Jahres-Ersparnis-Wert
            (Degradation + Wartung + Strompreis-Annahme + Wechselrichter-Timing kombiniert über
            25 Jahre) — bewusst breitere Spanne als die ±12% des 1-Jahres-Werts. */}
        In 25 Jahren sparen Sie ca. <strong>{formatSpan(result.ersparnis25, 22)} €</strong> (nach Investition, Wartung und Wechselrichter-Austausch)
      </div>
    </div>
  );
}
