import { useState } from "react";
import theme from "../../theme.js";
import LeadForm from "../lead/LeadForm.jsx";
import Slider from "../calculator/ui/Slider.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import { AUSRICHTUNG, NEIGUNG } from "../../lib/calculate.js";
import { calculateRenditeStandalone, RENDITE_LAUFZEIT } from "../../lib/calculateRendite.js";

const STEPS = ["Anlage", "Verbraucher"];

function formatEur(v) {
  return v.toLocaleString("de-DE") + " €";
}

export default function RenditeWizard() {
  const [step, setStep] = useState(0);
  const [dach, setDach] = useState(45);
  const [dachform, setDachform] = useState("Satteldach");
  const [ausrichtung, setAusrichtung] = useState("Süd");
  const [neigung, setNeigung] = useState("Mittel (25–35°)");
  const [verbrauch, setVerbrauch] = useState(4000);
  const [eauto, setEauto] = useState("nein");
  const [waermepumpe, setWaermepumpe] = useState("nein");
  const [speicherKwh, setSpeicherKwh] = useState(0);
  const [showResult, setShowResult] = useState(false);

  function eautoProfil() {
    return eauto === "ja" ? "Hauptwagen" : null;
  }
  const result = calculateRenditeStandalone(dach, dachform, ausrichtung, neigung, verbrauch, speicherKwh, eauto, eautoProfil(), waermepumpe);

  const leadZusammenfassung = `${result.kwp} kWp · ${result.roiProzent}% ROI über ${result.laufzeit} Jahre`;
  const leadDaten = {
    anlagengroesse: `${result.kwp} kWp`,
    dachflaeche: `${dach} m²`,
    dachform,
    ausrichtung,
    neigung,
    speicher: speicherKwh > 0 ? `Ja, ${speicherKwh} kWh` : "Nein",
    investition: `${result.investition.toLocaleString("de-DE")} €`,
    rendite: `${result.ueberschuss.toLocaleString("de-DE")} € Überschuss`,
    roi: `${result.roiProzent} %`,
    laufzeit: `${result.laufzeit} Jahre`,
    amortisation: result.amortisationsJahr != null ? `${result.amortisationsJahr} Jahre` : "nicht innerhalb der Laufzeit",
  };

  const restart = () => {
    setShowResult(false);
    setStep(0);
  };

  if (showResult) {
    const maxAbs = Math.max(...result.kumuliert.map((r) => Math.abs(r.kumuliert)), Math.abs(-result.investition));
    const alleJahre = [{ jahr: 0, kumuliert: -result.investition }, ...result.kumuliert];

    return (
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", fontFamily: theme.font.family }}>
        <div style={{ background: theme.color.textPrimary, borderRadius: theme.radius.lg, padding: "32px 28px", color: theme.color.white, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>Ihre Rendite</div>
          <div style={{ fontFamily: theme.font.display, fontSize: 38, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {result.ueberschuss >= 0 ? "+" : ""}{formatEur(result.ueberschuss)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
            Gewinn über {RENDITE_LAUFZEIT} Jahre · {result.kwp.toLocaleString("de-DE")} kWp · Investition {formatEur(result.investition)}
          </div>
          <div style={{ marginTop: 14, padding: "10px 16px", background: "rgba(255,84,0,0.18)", borderRadius: theme.radius.md, fontSize: 13, color: theme.color.accent }}>
            Rendite auf Ihre Investition: <strong>{result.roiProzent}%</strong> über {RENDITE_LAUFZEIT} Jahre
            {result.amortisationsJahr != null && <> · amortisiert nach ca. <strong>{result.amortisationsJahr.toLocaleString("de-DE")}</strong> Jahren</>}
          </div>
        </div>

        <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>Kumulierte Rendite über die Jahre</div>
          <div style={{ fontSize: 11, color: theme.color.textMuted, marginBottom: 14 }}>Startet bei −Investition (Jahr 0); die Linie kreuzt 0 im Break-even.</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 140 }}>
            {alleJahre.map((r) => {
              const h = (Math.abs(r.kumuliert) / maxAbs) * 100;
              const pos = r.kumuliert >= 0;
              return (
                <div key={r.jahr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <div style={{ width: "60%", height: `${Math.max(2, h)}%`, background: pos ? theme.color.success : theme.color.danger, borderRadius: 2, opacity: 0.9, marginTop: "auto" }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: theme.color.textMuted, marginTop: 4 }}>
            <span>Jahr 0</span><span>Jahr {RENDITE_LAUFZEIT}</span>
          </div>
        </div>

        <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 12 }}>Lohnt sich die PV als Geldanlage?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div style={{ flex: "1 1 160px" }}>
              <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>PV-Gewinn ({RENDITE_LAUFZEIT} J.)</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.success, fontVariantNumeric: "tabular-nums" }}>{result.ueberschuss >= 0 ? "+" : ""}{formatEur(result.ueberschuss)}</div>
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Festgeld-Vergleich ({Math.round(result.vergleichszins * 100)} %)</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{formatEur(result.alternativGewinn)}</div>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.65, margin: "12px 0 0" }}>
            {result.differenzZurAnlage >= 0
              ? `Die PV bringt ${formatEur(result.differenzZurAnlage)} mehr ein als dieselbe Summe zu ${Math.round(result.vergleichszins * 100)} % auf ein Festgeldkonto — und Sie sind unabhängig von steigenden Strompreisen.`
              : `Rein als Geldanlage schneidet die PV mit ${formatEur(Math.abs(result.differenzZurAnlage))} schlechter ab als dieselbe Summe zu ${Math.round(result.vergleichszins * 100)} % auf ein Festgeldkonto. Der Gegenwert liegt dann vor allem in der Unabhängigkeit vom Strompreis und in Ihrer Autarkie.`}
          </p>
        </div>

        <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "16px", marginBottom: 20, fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.6 }}>
          Modellrechnung mit {(result.autarkieRate * 100).toFixed(0)} % angenommener Autarkie und einer Strompreissteigerung von 2 %/Jahr (nur hier sichtbar, nicht im Jahres-Ersparnis-Wert). Die Rendite hängt stark von diesen Annahmen ab — keine Rechtsverbindlichkeit, ein Angebot ersetzt die Modellrechnung nicht.
        </div>

        <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "16px", marginBottom: 20, fontSize: 12, color: theme.color.textSecondary, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: theme.color.textPrimary, marginBottom: 8 }}>Jährlicher Cashflow (Auswahl)</div>
          {result.jahre.filter((j) => j.jahr <= 5 || j.jahr === 10 || j.jahr === RENDITE_LAUFZEIT).map((j) => (
            <div key={j.jahr} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
              <span>Jahr {j.jahr}</span>
              <span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{j.cashflow >= 0 ? "+" : ""}{formatEur(j.cashflow)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
        <LeadForm
          rechner="rendite"
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
        <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>Rendite-Rechner</h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>Ihre PV-Anlage als Geldanlage — Cashflow und Rendite über 20 Jahre</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= step ? theme.color.accent : theme.color.border, transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: theme.color.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
          Schritt {step + 1} von {STEPS.length}
        </div>
        {step === 0 && <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Ihre Anlage</div>}
        {step === 1 && <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.textPrimary }}>Verbraucher & Speicher</div>}
      </div>

      <div style={{ minHeight: 200 }}>
        {step === 0 && (
          <>
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
            <Slider label="Stromverbrauch" value={verbrauch} onChange={setVerbrauch} min={2000} max={10000} step={100} unit="kWh" />
            <ContinueButton onClick={() => setStep(1)} />
          </>
        )}
        {step === 1 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>E-Auto? (erhöht Verbrauch & Eigenverbrauch)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { v: "nein", l: "Nein" },
                  { v: "ja", l: "Ja, vorhanden" },
                ].map((o) => (
                  <button key={o.v} onClick={() => setEauto(o.v)} style={{ padding: "8px 14px", borderRadius: theme.radius.pill, border: `1.5px solid ${eauto === o.v ? theme.color.accent : theme.color.border}`, background: eauto === o.v ? theme.color.accentSubtle : theme.color.white, color: eauto === o.v ? theme.color.accentHover : theme.color.textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Wärmepumpe? (erhöht Verbrauch & Eigenverbrauch)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { v: "nein", l: "Nein" },
                  { v: "ja", l: "Ja, vorhanden" },
                ].map((o) => (
                  <button key={o.v} onClick={() => setWaermepumpe(o.v)} style={{ padding: "8px 14px", borderRadius: theme.radius.pill, border: `1.5px solid ${waermepumpe === o.v ? theme.color.accent : theme.color.border}`, background: waermepumpe === o.v ? theme.color.accentSubtle : theme.color.white, color: waermepumpe === o.v ? theme.color.accentHover : theme.color.textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <Slider label="Batteriespeicher" value={speicherKwh} onChange={setSpeicherKwh} min={0} max={20} step={0.5} unit="kWh" />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, padding: 14, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, background: theme.color.white, color: theme.color.textSecondary, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                ← Zurück
              </button>
              <div style={{ flex: 2 }}>
                <ContinueButton label="Rendite berechnen" onClick={() => setShowResult(true)} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
