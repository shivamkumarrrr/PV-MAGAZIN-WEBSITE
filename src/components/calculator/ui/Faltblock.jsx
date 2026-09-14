import theme from "../../../theme.js";
import { IconSearch } from "../../Icons.jsx";

// Aufklappbarer Methodik-Block ("So haben wir das berechnet").
//
// Bis hierher gab es diesen Block nur im Photovoltaik-Rechner
// (calculator/DetailSection.jsx) und im Gestehungskosten-Rechner — dort
// allerdings jeweils eigens ausgebaut. Die übrigen Rechner zeigten ihre
// Ergebniszahl ohne offengelegte Grundlage, obwohl in den calculate*.js
// jede Konstante Quelle und Stand trägt.
//
// Umsetzung als <details>: kein JavaScript nötig, der Text steht trotzdem
// im HTML. Zugeklappt als Standard, damit die Ergebniszahl die
// Aufmerksamkeit behält (Progressive Disclosure) — wer die Herleitung
// sehen will, klappt auf.
//
// Props:
//   titel     — optional, überschreibt die Standard-Zusammenfassung
//   zeilen    — optional [{ label, wert }] für tabellarische Zwischenwerte
//   children  — Fließtext zur Methodik inkl. Quellen
export default function Faltblock({ titel = "So haben wir das berechnet", zeilen = [], children }) {
  return (
    <details
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        marginBottom: 16,
        background: theme.color.white,
      }}
    >
      <summary
        style={{
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 600,
          color: theme.color.textPrimary,
          cursor: "pointer",
          background: theme.color.bg,
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        <IconSearch size={15} /> {titel}
      </summary>
      <div style={{ padding: "12px 16px 16px" }}>
        {zeilen.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, marginBottom: children ? 12 : 0 }}>
            {zeilen.map((z) => (
              <div key={z.label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: theme.color.textMuted }}>{z.label}</span>
                <span style={{ color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{z.wert}</span>
              </div>
            ))}
          </div>
        )}
        {children && (
          <div style={{ fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.7 }}>{children}</div>
        )}
      </div>
    </details>
  );
}
