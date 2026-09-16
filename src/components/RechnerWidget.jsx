import { useMemo, useState } from "react";
import theme from "../theme.js";
import Slider from "./calculator/ui/Slider.jsx";
import Segmented from "./calculator/ui/Segmented.jsx";
import { HAUSHALT, calculate } from "../lib/calculate.js";

// Kompakter Mini-Rechner für den Artikeltext (Muster: zolars Solarrechner
// direkt im Artikel). KEINE PVGIS-Daten, keine Standortauswahl — bewusst nur
// eine erste Größenordnung mit Bundesdurchschnitt, damit der Einstieg im
// Artikel dünn bleibt und die echte Berechnung (`/rechner/photovoltaik/`)
// den Mehrwert behält. Alle Konstanten kommen aus calculate.js — der Widget-
// wird nie andere Zahlen zeigen als der große Rechner.
//
// Hydration in MDX mit `client:load`: das Widget ist der aktive Inhalt der
// Stelle, kein Rand-Dekor (gleiche Begründung wie auf den Rechnerseiten).
const NF = new Intl.NumberFormat("de-DE");

const euro = (v) => `${NF.format(Math.round(v))} €`;
const kWh = (v) => `${NF.format(Math.round(v))} kWh`;

// Generische Kennzahl-Kachel; gleiche Bildsprache wie KeyMetrics im Rechner.
// `grund` ist die Fläche, auf der die Kachel liegt: im Artikel eine weiße
// Kachel auf hellgrauem Grund, im Hero umgekehrt — sonst hätte die Kachel
// dieselbe Farbe wie die Karte und der Rahmen stünde ohne Grund da.
function Kennzahl({ label, wert, sub, akzent, grund }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.md,
        padding: "12px 14px",
        background: grund ?? theme.color.surface,
      }}
    >
      <div style={{ fontSize: 11, color: theme.color.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: akzent ? theme.color.accent : theme.color.textPrimary, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {wert}
      </div>
      {sub && <div style={{ fontSize: 11, color: theme.color.textSecondary, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// `variante`: "artikel" (Vorgabe) steht zwischen zwei Absätzen im Fließtext und
// hebt sich deshalb mit eigenem Abstand und Seitenhintergrund ab. "hero" hängt
// auf der Startseite über der Kante des Hero-Bandes — dort ist die Karte selbst
// die Fläche und trägt Weiß, sonst verschwindet sie im Grund. Muster von
// lichtblick.de, wo der Tarifrechner genauso auf der Bandkante liegt.
export default function RechnerWidget({ variante = "artikel" }) {
  const imHero = variante === "hero";
  const kachelGrund = imHero ? theme.color.bg : theme.color.surface;
  // Verbrauch wird über die Haushaltsgröße gesetzt (wie im großen Rechner,
  // dort frei überschreibbar) — hier reicht die Personenzahl.
  const [haushalt, setHaushalt] = useState("4 Personen");
  const [dach, setDach] = useState(40);
  const [speicher, setSpeicher] = useState(true);

  const ergebnis = useMemo(() => {
    const verbrauch = HAUSHALT.find((h) => h.label === haushalt)?.kwh ?? 4000;
    const speicherKwh = speicher ? Math.round((verbrauch / 1000) * 1.2 * 10) / 10 : 0;
    return calculate(
      dach,
      "Süd",
      "Mittel (25–35°)",
      verbrauch,
      speicherKwh,
      "nein",
      "nein",
      null,
      "Satteldach",
      null,
      [],
    );
  }, [haushalt, dach, speicher]);

  return (
    <section
      aria-labelledby="widget-titel"
      style={{
        margin: imHero ? 0 : "28px 0",
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        background: imHero ? theme.color.surface : theme.color.bg,
      }}
    >
      <div style={{ padding: "18px 20px 4px", borderBottom: `1px solid ${theme.color.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: theme.color.accent, marginBottom: 4 }}>
          Mini-Rechner
        </div>
        <div id="widget-titel" style={{ fontSize: 19, fontWeight: 600, color: theme.color.textPrimary }}>
          Erste Größenordnung für Ihr Dach
        </div>
      </div>

      <div style={{ padding: "18px 20px 6px" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Haushalt</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {HAUSHALT.map((h) => {
              const active = haushalt === h.label;
              return (
                <button
                  key={h.label}
                  onClick={() => setHaushalt(h.label)}
                  style={{
                    padding: "9px 4px",
                    borderRadius: 10,
                    border: active ? `2px solid ${theme.color.accent}` : `1.5px solid ${theme.color.border}`,
                    background: active ? theme.color.accentSubtle : kachelGrund,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? theme.color.accentHover : theme.color.textPrimary }}>{h.persons}</div>
                  <div style={{ fontSize: 10, color: theme.color.textMuted, marginTop: 1 }}>
                    {h.persons === 1 ? "Person" : h.persons === 5 ? "5+" : `${h.persons} Pers.`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Slider label="Dachfläche (Satteldach, gesamt)" value={dach} onChange={setDach} min={20} max={120} step={5} unit="m²" />

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Speicher</div>
          <Segmented
            options={[
              { value: false, label: "Ohne Speicher" },
              { value: true, label: "Mit Speicher" },
            ]}
            value={speicher}
            onChange={setSpeicher}
          />
          <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 6, lineHeight: 1.5 }}>
            Speichergröße folgt der HTW-Berlin-Faustregel (≈ 1,2 kWh je 1.000 kWh Jahresverbrauch).
          </div>
        </div>
      </div>

      <div style={{ padding: "2px 20px 18px" }}>
        <div style={{ fontSize: 12, color: theme.color.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
          Jahreswerte (Bundesdurchschnitt, Süd-30°)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(134px, 1fr))", gap: 8 }}>
          <Kennzahl grund={kachelGrund} label="Anlage" wert={`${NF.format(ergebnis.kwp)} kWp`} sub="nach nutzbarer Fläche" />
          <Kennzahl grund={kachelGrund} label="Ertrag" wert={kWh(ergebnis.jahresertrag)} sub="pro Jahr" />
          <Kennzahl grund={kachelGrund} label="Autarkie" wert={`${ergebnis.autarkie} %`} sub="des Verbrauchs" />
          <Kennzahl grund={kachelGrund} label="Investition" wert={euro(ergebnis.investition)} sub="brutto = netto" />
          <Kennzahl grund={kachelGrund} label="Ersparnis" wert={euro(ergebnis.jahresErsparnis)} sub="pro Jahr" akzent />
          <Kennzahl grund={kachelGrund} label="Amortisation" wert={ergebnis.amortisation ? `${NF.format(ergebnis.amortisation)} J.` : "–"} sub="nur Rechenmodell" />
        </div>
      </div>

      {/* Fußzeile: der Knopf und daneben, was hinter dem Knopf wartet. Die drei
          Angaben standen vorher in einer eigenen Karte weiter unten auf der
          Startseite — zusammen mit einem zweiten Link auf dieselbe Seite. Hier
          stehen sie da, wo sie die Entscheidung stützen, statt sie zu
          wiederholen. Im Artikel bleibt die Fußzeile schlank: dort trägt der
          umgebende Text die Einordnung. */}
      <div
        style={{
          padding: "2px 20px 18px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "14px 22px",
        }}
      >
        <a
          href="/rechner/photovoltaik/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 22px",
            borderRadius: theme.radius.pill,
            background: theme.color.accent,
            color: theme.color.white,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            transition: "background-color 0.15s",
          }}
        >
          Mit Standort-Daten genauer rechnen →
        </a>

        {imHero && (
          <dl style={{ display: "flex", flexWrap: "wrap", gap: "10px 26px", margin: 0 }}>
            {[
              ["Datenquelle", "PVGIS-Satellitendaten"],
              ["Schritte", "4"],
              ["Ergebnis", "kWp, Ertrag, Ersparnis, Amortisation"],
            ].map(([dt, dd]) => (
              <div key={dt}>
                <dt style={{ fontSize: 11, fontWeight: 600, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {dt}
                </dt>
                <dd style={{ margin: 0, fontSize: 13, fontWeight: 600, color: theme.color.textPrimary }}>{dd}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}