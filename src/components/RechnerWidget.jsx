import { useMemo, useState } from "react";
import theme from "../theme.js";
import Slider from "./calculator/ui/Slider.jsx";
import Segmented from "./calculator/ui/Segmented.jsx";
import Faltblock from "./calculator/ui/Faltblock.jsx";
import { HAUSHALT, calculate, STROMPREIS, EINSPEISE } from "../lib/calculate.js";
import { useAnimatedNumber } from "../lib/useAnimatedNumber.js";

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
// Cent-Schreibweise wie auf /methodik/ — zwei Nachkommastellen, weil die
// EEG-Sätze auf die zweite Stelle festgelegt sind (7,70 ct, nicht 7,7 ct).
const ct = (eur) =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(eur * 100);

// Pulsierender Punkt + "Live"-Beschriftung — signalisiert ehrlich, was hier
// tatsächlich passiert: Das Ergebnis ist kein Snapshot, es rechnet bei jeder
// Eingabe neu (useMemo oben). Dieselbe Bildsprache wie "Live-Vorschau" in
// LivePanel.jsx (großer Rechner) — hier nur kompakt neben der Überschrift,
// weil eine zweite Beschriftungszeile den Kartenkopf gesprengt hätte.
// aria-hidden auf dem Punkt: er ist Dekoration zu einer Aussage, die der
// sichtbare Text ("Live") ohnehin trägt.
function LivePunkt() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <style>{`
        @keyframes live-puls {
          0% { transform: scale(0.6); opacity: 0.5; }
          70%, 100% { transform: scale(2.1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-punkt-ring { animation: none; opacity: 0; }
        }
      `}</style>
      <span style={{ position: "relative", width: 7, height: 7, flexShrink: 0 }} aria-hidden="true">
        <span
          className="live-punkt-ring"
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            background: theme.color.success,
            animation: "live-puls 2s ease-out infinite",
          }}
        />
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: theme.color.success }} />
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: theme.color.textSecondary }}>Live</span>
    </span>
  );
}

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
  // Nichts ist vorausgewählt — dieselbe Vorgabe wie im großen Rechner
  // (September 2026). Vorher standen "4 Personen" und "Mit Speicher" orange
  // markiert da und die Karte zeigte sofort eine fertige Amortisation für
  // Angaben, die niemand gemacht hatte.
  //
  // Ausnahme wie dort: Der Schieberegler für die Dachfläche startet bei 40 m²,
  // weil ein Regler ohne Wert keine Position hat. Er zählt nicht als
  // getroffene Entscheidung.
  const [haushalt, setHaushalt] = useState(null);
  const [dach, setDach] = useState(40);
  const [speicher, setSpeicher] = useState(null);

  const bereit = haushalt !== null && speicher !== null;

  const ergebnis = useMemo(() => {
    const verbrauch = HAUSHALT.find((h) => h.label === haushalt)?.kwh ?? 0;
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

  // Weiche Zahlen statt hartem Sprung bei jeder Eingabe — dieselbe Technik
  // wie LivePanel.jsx im großen Rechner (useAnimatedNumber), damit "Live"
  // oben nicht nur behauptet, sondern auch zu sehen ist. Ohne
  // Amortisation (Anlage trägt sich nicht) bleibt der Wert 0 und wird gar
  // nicht gerendert, siehe unten.
  const animAmortisation = useAnimatedNumber(ergebnis.amortisation ?? 0);
  const animErsparnis = useAnimatedNumber(ergebnis.jahresErsparnis);
  const animKwp = useAnimatedNumber(ergebnis.kwp);
  const animErtrag = useAnimatedNumber(ergebnis.jahresertrag);

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
      {/* Kein Kleinversalien-Label über der Überschrift: Das Muster ist ein
          bekannter Generierungs-Tell, und "MINI-RECHNER" sagt nichts, was die
          Karte nicht selbst zeigt. Die Überschrift ist ein echtes <h2>, damit
          die Karte in der Überschriftennavigation eines Screenreaders
          auftaucht — vorher war sie dort unsichtbar. */}
      <div
        style={{
          padding: "18px 20px 14px",
          borderBottom: `1px solid ${theme.color.border}`,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h2 id="widget-titel" style={{ margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: "-0.015em", color: theme.color.textPrimary }}>
          Erste Größenordnung für Ihr Dach
        </h2>
        <LivePunkt />
      </div>

      <div style={{ padding: "18px 20px 6px" }}>
        <div style={{ marginBottom: 14 }}>
          <div id="haushalt-label" style={{ fontSize: 14, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 8 }}>Haushalt</div>
          {/* Fünf Knöpfe, die sich gegenseitig ausschließen, sind eine
              Auswahlgruppe — ohne role/aria-checked meldet ein Screenreader
              nur fünf namenlose Schaltflächen ohne erkennbaren Zustand. */}
          <div role="radiogroup" aria-labelledby="haushalt-label" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {HAUSHALT.map((h) => {
              const active = haushalt === h.label;
              return (
                <button
                  key={h.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`${h.persons === 5 ? "5 oder mehr" : h.persons} ${h.persons === 1 ? "Person" : "Personen"}`}
                  onClick={() => setHaushalt(h.label)}
                  style={{
                    padding: "9px 4px",
                    borderRadius: 10,
                    // Beide Zustände 2px — sonst wächst der Knopf beim
                    // Auswählen um einen halben Pixel und die Reihe ruckt.
                    border: `2px solid ${active ? theme.color.accent : theme.color.border}`,
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

      {/* Eine Antwort, nicht sechs. Vorher standen hier sechs gleich große
          Kacheln nebeneinander — die eigentliche Pointe (die Amortisation)
          war die sechste davon, unakzentuiert, und mit "nur Rechenmodell"
          entschuldigt. Sechs gleichwertige Zahlen sind eine Tabelle, keine
          Auskunft. Jetzt trägt ein Satz das Ergebnis, zwei Werte stützen
          ihn, der Rest liegt eine Klappe tiefer.

          aria-live="polite": Die Zahlen ändern sich beim Schieben, ohne dass
          der Fokus sie berührt — ohne Live-Region bliebe das für einen
          Screenreader lautlos. */}
      <div style={{ padding: "16px 20px 18px" }} aria-live="polite">
        {!bereit && (
          <p
            style={{
              margin: 0,
              fontFamily: theme.font.display,
              fontSize: imHero ? 22 : 20,
              lineHeight: 1.35,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: theme.color.textSecondary,
              textWrap: "balance",
            }}
          >
            Haushaltsgröße und Speicher wählen — dann steht hier Ihre erste
            Größenordnung.
          </p>
        )}

        {bereit && (
        <>
        <p
          style={{
            margin: "0 0 14px",
            fontFamily: theme.font.display,
            fontSize: imHero ? 26 : 23,
            lineHeight: 1.25,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: theme.color.textPrimary,
            textWrap: "balance",
          }}
        >
          {ergebnis.amortisation ? (
            <>
              Nach rund{" "}
              <span style={{ color: theme.color.accentText, fontVariantNumeric: "tabular-nums" }}>
                {NF.format(Math.round(animAmortisation))} Jahren
              </span>{" "}
              hat sich die Anlage bezahlt.
            </>
          ) : (
            <>Bei dieser Kombination trägt sich die Anlage rechnerisch nicht.</>
          )}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
          <Kennzahl grund={kachelGrund} label="Ersparnis" wert={euro(animErsparnis)} sub="pro Jahr" />
          <Kennzahl grund={kachelGrund} label="Anlagengröße" wert={`${NF.format(Math.round(animKwp * 10) / 10)} kWp`} sub={`${kWh(animErtrag)} Ertrag im Jahr`} />
        </div>

        <Faltblock
          titel="Woraus sich das ergibt"
          zeilen={[
            { label: "Investition (brutto, Nullsteuersatz)", wert: euro(ergebnis.investition) },
            { label: "Autarkiegrad", wert: `${ergebnis.autarkie} %` },
            { label: "Jahresertrag", wert: kWh(ergebnis.jahresertrag) },
          ]}
        >
          Gerechnet mit dem Bundesdurchschnitt für Einstrahlung und einer
          Süd-Ausrichtung bei 30° Neigung — ohne Ihren Standort. Die
          Amortisation ist ein Modellwert: Sie unterstellt gleichbleibende
          Strompreise und keine Reparaturen. Für Ihre Postleitzahl holt der
          vollständige Rechner die tatsächliche Einstrahlung aus den
          PVGIS-Satellitendaten der EU-Kommission.
        </Faltblock>
        </>
        )}
      </div>

      {/* Fußzeile: der Knopf und daneben in einem Satz, was er besser macht.
          Vorher standen hier drei Label-Wert-Paare ("DATENQUELLE / SCHRITTE /
          ERGEBNIS") — ein Trust-Badge-Streifen in allem außer dem Namen
          (CLAUDE.md Design-Regel 6), und "SCHRITTE: 4" beruhigt niemanden.
          Im Artikel bleibt die Fußzeile schlank: dort trägt der umgebende
          Text die Einordnung. */}
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
            // Tintenschwarz auf Orange (5,39:1). Weiß läge bei 3,25:1.
            color: theme.color.textPrimary,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            transition: "background-color 0.15s",
          }}
        >
          Mit Standort-Daten genauer rechnen →
        </a>

        {imHero && (
          <span style={{ fontSize: 13, lineHeight: 1.5, color: theme.color.textSecondary, maxWidth: "34ch" }}>
            Dann mit der Einstrahlung für Ihre Postleitzahl statt mit dem
            Bundesdurchschnitt.
          </span>
        )}
      </div>

      {/* Der Beleg steht neben der Zahl, nicht in einem eigenen Abschnitt
          weiter unten: Wer gerade ein Ergebnis gelesen hat, fragt sich in
          genau diesem Moment, woher es kommt. Die vollständige Tabelle samt
          Grenzen des Modells liegt auf /methodik/ — vorher stand sie als
          dunkle Vollflächen-Platte an zweiter Stelle der Startseite, vor
          allem, wofür Besucher eigentlich gekommen waren. */}
      <p
        style={{
          margin: 0,
          padding: "0 20px 18px",
          fontSize: 12.5,
          lineHeight: 1.55,
          color: theme.color.textMuted,
        }}
      >
        Gerechnet mit {ct(STROMPREIS)} ct je selbst verbrauchter Kilowattstunde
        (BDEW) und {ct(EINSPEISE)} ct Einspeisevergütung (Bundesnetzagentur,
        § 49 EEG).{" "}
        <a href="/methodik/" style={{ color: theme.color.accentText }}>
          Alle Konstanten mit Quelle und Stand
        </a>
      </p>
    </section>
  );
}