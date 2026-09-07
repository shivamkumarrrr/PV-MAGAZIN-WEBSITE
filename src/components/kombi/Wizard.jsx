import { useState } from "react";
import theme from "../../theme.js";
import Slider from "../calculator/ui/Slider.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import { AUSRICHTUNG, NEIGUNG, computeKwp } from "../../lib/calculate.js";
import { compareScenarios, WP_JAHRESVERBRAUCH, EAUTO_JAHRESVERBRAUCH } from "../../lib/calculateKombi.js";

function formatEur(v) {
  if (v == null || isNaN(v)) return "–";
  return v.toLocaleString("de-DE") + " €";
}

function Row({ label, cells, bold }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(5, 1fr)", gap: 6, alignItems: "center", padding: "8px 4px", borderBottom: `1px solid ${theme.color.border}` }}>
      <div style={{ fontSize: 12.5, fontWeight: bold ? 700 : 500, color: theme.color.textPrimary }}>{label}</div>
      {cells.map((c, i) => (
        <div key={i} style={{ fontSize: 12.5, fontWeight: bold ? 700 : 500, color: c && typeof c === "string" && c.startsWith("-") ? theme.color.danger : theme.color.textPrimary, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
          {c}
        </div>
      ))}
    </div>
  );
}

export default function KombiWizard() {
  const [dach, setDach] = useState(45);
  const [dachform, setDachform] = useState("Satteldach");
  const [ausrichtung, setAusrichtung] = useState("Süd");
  const [neigung, setNeigung] = useState("Mittel (25–35°)");
  const [verbrauch, setVerbrauch] = useState(4000);
  const [speicherKwh, setSpeicherKwh] = useState(5);
  const [eauto, setEauto] = useState("nein");
  const [waermepumpe, setWaermepumpe] = useState("nein");
  const [showResult, setShowResult] = useState(false);

  const { kwp } = computeKwp(dach, dachform);
  const result = compareScenarios(kwp, dachform, ausrichtung, neigung, verbrauch, speicherKwh, eauto, waermepumpe);

  const restart = () => setShowResult(false);

  const buttonRow = () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {toggles.map((t) => (
        <button
          key={t.key}
          onClick={() => t.set(t.on === "nein" ? "ja" : t.on === "ja" ? "geplant" : "nein")}
          style={{ padding: "8px 12px", borderRadius: theme.radius.pill, border: `1.5px solid ${t.on === "nein" ? theme.color.border : theme.color.accent}`, background: t.on === "nein" ? theme.color.white : theme.color.accentSubtle, color: t.on === "nein" ? theme.color.textSecondary : theme.color.accentHover, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const toggles = [
    { key: "wp", label: waermepumpe === "nein" ? "Wärmepumpe: Nein" : waermepumpe === "geplant" ? "Wärmepumpe: geplant" : "Wärmepumpe: Ja", on: waermepumpe, set: (v) => setWaermepumpe(v) },
    { key: "eauto", label: eauto === "nein" ? "E-Auto: Nein" : eauto === "geplant" ? "E-Auto: geplant" : "E-Auto: Ja", on: eauto, set: (v) => setEauto(v) },
  ];

  if (showResult) {
    const s = result.szenarien;
    const aktiv = s[s.length - 1]; // "PV + alles"
    return (
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", fontFamily: theme.font.family }}>
        <div style={{ background: theme.color.textPrimary, borderRadius: theme.radius.lg, padding: "32px 28px", color: theme.color.white, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>Ihr Sparpotenzial</div>
          <div style={{ fontFamily: theme.font.display, fontSize: 38, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {formatEur(result.basis.netzbezugKosten - aktiv.kostenMitSolar)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
            pro Jahr im besten Szenario („{aktiv.label}") · von {formatEur(result.basis.netzbezugKosten)} Netzstromkosten heute
          </div>
          <div style={{ marginTop: 14, padding: "10px 16px", background: "rgba(255,84,0,0.18)", borderRadius: theme.radius.md, fontSize: 13, color: theme.color.accent }}>
            Autarkie im besten Szenario: <strong>{aktiv.autarkie}%</strong> · Amortisation ca. <strong>{aktiv.amortisation != null ? aktiv.amortisation.toLocaleString("de-DE") + " Jahre" : "n. a."}</strong>
          </div>
        </div>

        {result.szenarien.length >= 2 && (
          <div style={{ overflowX: "auto", background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "14px 12px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 4px 10px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.color.textPrimary }}>Szenario-Vergleich</div>
              <div style={{ fontSize: 11, color: theme.color.textMuted }}>Ihre Anlage: {aktiv.kwp.toLocaleString("de-DE")} kWp</div>
            </div>
            <Row label="Szenario" cells={result.szenarien.map((x) => x.label)} bold />
            <Row label="Autarkie" cells={result.szenarien.map((x) => x.autarkie + "%")} />
            <Row label="Eigenverbrauch/Jahr" cells={result.szenarien.map((x) => x.eigenverbrauch.toLocaleString("de-DE") + " kWh")} />
            <Row label="Netzbezug-Kosten" cells={result.szenarien.map((x) => formatEur(x.kostenMitSolar))} />
            <Row label="Investition" cells={result.szenarien.map((x) => formatEur(x.investition))} />
            <Row label="Amortisation" cells={result.szenarien.map((x) => (x.amortisation != null ? x.amortisation.toLocaleString("de-DE") + " J." : "–"))} />
          </div>
        )}

        <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "16px", marginBottom: 20, fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.65 }}>
          Wärmepumpe (+{WP_JAHRESVERBRAUCH.toLocaleString("de-DE")} kWh/Jahr) und E-Auto (+{EAUTO_JAHRESVERBRAUCH.toLocaleString("de-DE")} kWh/Jahr) erhöhen den Stromverbrauch — dadurch steigen Eigenverbrauch und Autarkie, aber auch die Absatzmenge für die Anlage. Je mehr Strom Sie selbst verbrauchen, desto schneller amortisiert sich die PV. Modellrechnung, keine Rechtsverbindlichkeit.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
          <a href="/rechner/" style={{ display: "block", textAlign: "center", padding: 14, borderRadius: theme.radius.lg, background: theme.color.accent, color: theme.color.white, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Alle Rechner im Überblick →
          </a>
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
        <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>PV + Wärmepumpe + E-Auto</h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>Wie sich Ihre Verbraucher auf die PV-Wirtschaftlichkeit auswirken</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: theme.color.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Ihre Situation</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Dachform</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["Satteldach", "Flachdach"].map((f) => (
            <button key={f} onClick={() => setDachform(f)} style={{ padding: "8px 14px", borderRadius: theme.radius.pill, border: `1.5px solid ${dachform === f ? theme.color.accent : theme.color.border}`, background: dachform === f ? theme.color.accentSubtle : theme.color.white, color: dachform === f ? theme.color.accentHover : theme.color.textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <Slider label="Dachfläche" value={dach} onChange={setDach} min={20} max={120} step={1} unit="m²" />
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Ausrichtung</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {AUSRICHTUNG.map((a) => (
            <button key={a.label} onClick={() => setAusrichtung(a.label)} style={{ padding: "8px 14px", borderRadius: theme.radius.pill, border: `1.5px solid ${ausrichtung === a.label ? theme.color.accent : theme.color.border}`, background: ausrichtung === a.label ? theme.color.accentSubtle : theme.color.white, color: ausrichtung === a.label ? theme.color.accentHover : theme.color.textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 13, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Neigung</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NEIGUNG.map((n) => (
            <button key={n.label} onClick={() => setNeigung(n.label)} style={{ padding: "8px 14px", borderRadius: theme.radius.pill, border: `1.5px solid ${neigung === n.label ? theme.color.accent : theme.color.border}`, background: neigung === n.label ? theme.color.accentSubtle : theme.color.white, color: neigung === n.label ? theme.color.accentHover : theme.color.textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>
      <Slider label="Haushaltsstromverbrauch" value={verbrauch} onChange={setVerbrauch} min={2000} max={10000} step={100} unit="kWh" />

      <div style={{ marginBottom: 8, borderTop: `1px solid ${theme.color.border}`, paddingTop: 16 }}>
        <div style={{ fontSize: 13, color: theme.color.textSecondary, fontWeight: 600, marginBottom: 8 }}>Welche Verbraucher haben Sie? (klicken zum Umschalten)</div>
        {buttonRow()}
      </div>
      <Slider label="Batteriespeicher (im besten Szenario)" value={speicherKwh} onChange={setSpeicherKwh} min={0} max={20} step={0.5} unit="kWh" />

      <div style={{ marginTop: 16 }}>
        <ContinueButton label="Szenarien berechnen" onClick={() => setShowResult(true)} />
      </div>
    </div>
  );
}
