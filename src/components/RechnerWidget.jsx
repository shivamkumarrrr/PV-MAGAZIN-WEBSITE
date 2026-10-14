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

// Eine Beschriftung für alle drei Eingaben. Haushalt und Speicher standen in
// 14px/500 Grau, der Schieberegler dazwischen in 15px/600 Schwarz — drei Felder
// derselben Karte, zwei Gewichtungen. Der Regler ist geteilter Baustein
// (Slider.jsx), also zieht das Widget auf dessen Maß.
const feldLabel = {
  fontSize: 15,
  fontWeight: 600,
  color: theme.color.textPrimary,
  marginBottom: 8,
};

// Nur für die Live-Region: Screenreader bekommen den Endwert als ein Satz
// statt 30 Zwischenwerten pro Sekunde aus der Zählanimation.
const nurVorlesen = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

// Hover wie `.cta-final-button` in RechnerCta.astro: dunkleres Orange, weiße
// Schrift (4,6:1). Inline-Styles kennen kein :hover — der Knopf trug vorher
// `transition: background-color`, aber nichts, was sich ändern konnte.
// Der Pfeil rückt beim Hover nach rechts; entfällt bei "Bewegung reduzieren".
const LAYOUT_CSS = `
  @container (min-width: 820px) {
    .rw-koerper {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    }
    .rw-ergebnis {
      border-top: 0 !important;
      border-left: 1px solid ${theme.color.border};
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
`;

const CTA_CSS = `
  /* Farben stehen hier, nicht inline: Inline-Werte schlügen das :hover.
     Weiß auf Solargrün (5,3:1). */
  .widget-cta { background: ${theme.color.accent}; color: ${theme.color.white}; transition: background-color 0.15s, color 0.15s; }
  .widget-cta:hover { background: ${theme.color.accentHover}; color: ${theme.color.white}; }
  .widget-cta-pfeil { display: inline-block; transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
  .widget-cta:hover .widget-cta-pfeil { transform: translateX(3px); }
  @media (prefers-reduced-motion: reduce) {
    .widget-cta-pfeil { transition: none; }
    .widget-cta:hover .widget-cta-pfeil { transform: none; }
  }
`;

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
      <div style={{ fontSize: 12, color: theme.color.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: akzent ? theme.color.accent : theme.color.textPrimary, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {wert}
      </div>
      {sub && <div style={{ fontSize: 12, color: theme.color.textSecondary, marginTop: 2 }}>{sub}</div>}
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
  // Kennzahl-Kacheln liegen in der Antwortzone, deren Grund umgekehrt ist.
  const kennzahlGrund = imHero ? theme.color.surface : theme.color.bg;
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

  // "Jahre" nur im Plural: Bei 1 Jahr stand "1 Jahren" da.
  const jahre = (n) => {
    const r = Math.round(n);
    return `${NF.format(r)} ${r === 1 ? "Jahr" : "Jahren"}`;
  };

  const fehlt =
    haushalt === null && speicher === null
      ? "Haushaltsgröße und Speicher wählen"
      : haushalt === null
        ? "Noch die Haushaltsgröße wählen"
        : "Noch den Speicher wählen";

  const zusammenfassung = ergebnis.amortisation
    ? `Nach rund ${jahre(ergebnis.amortisation)} hat sich die Anlage bezahlt. Ersparnis ${euro(ergebnis.jahresErsparnis)} pro Jahr, Anlagengröße ${NF.format(Math.round(ergebnis.kwp * 10) / 10)} kWp.`
    : `Bei dieser Kombination trägt sich die Anlage rechnerisch nicht. Anlagengröße ${NF.format(Math.round(ergebnis.kwp * 10) / 10)} kWp.`;

  return (
    <section
      aria-labelledby="widget-titel"
      style={{
        margin: imHero ? 0 : "28px 0",
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        background: imHero ? theme.color.surface : theme.color.bg,
        // Container-Query statt Media-Query: Dieselbe Karte steht auf der
        // Startseite (1140px) und in der 660px-Artikelspalte. Nur die Karte
        // selbst weiß, ob zwei Spalten hineinpassen.
        containerType: "inline-size",
      }}
    >
      <style>{LAYOUT_CSS}</style>
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

      <div className="rw-koerper">
      <div style={{ padding: "18px 20px 6px" }}>
        {/* 28px Abstand zwischen den Feldern — das Maß, das Slider.jsx selbst
            unter sich lässt. Vorher 14 / 28 / 16: drei Abstände für drei Felder. */}
        <div style={{ marginBottom: 28 }}>
          <div id="haushalt-label" style={feldLabel}>Personen im Haushalt</div>
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
                    minHeight: 48,
                    padding: "0 4px",
                    borderRadius: theme.radius.md,
                    // Beide Zustände 2px — sonst wächst der Knopf beim
                    // Auswählen um einen halben Pixel und die Reihe ruckt.
                    border: `2px solid ${active ? theme.color.accent : theme.color.border}`,
                    background: active ? theme.color.accentSubtle : kachelGrund,
                    cursor: "pointer",
                    transition: "background-color 0.15s, border-color 0.15s",
                  }}
                >
                  {/* Nur die Zahl; die Einheit steht in der Beschriftung. Vorher
                      stand "Personen" in 11px unter jeder Zahl — bei 360px
                      Breite sind die Knöpfe knapp 51px breit, das Wort ist
                      ~46px lang und lief über den Rand. */}
                  <span style={{ fontSize: 17, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                    {h.persons === 5 ? "5+" : h.persons}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Slider label="Dachfläche (Satteldach, gesamt)" value={dach} onChange={setDach} min={20} max={120} step={5} unit="m²" />

        <div style={{ marginBottom: 16 }}>
          <div id="speicher-label" style={feldLabel}>Speicher</div>
          <Segmented
            labelledBy="speicher-label"
            options={[
              { value: false, label: "Ohne Speicher" },
              { value: true, label: "Mit Speicher" },
            ]}
            value={speicher}
            onChange={setSpeicher}
          />
          <div style={{ fontSize: 12, color: theme.color.textMuted, marginTop: 8, lineHeight: 1.5 }}>
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

          Live-Region: Die Zahlen ändern sich beim Schieben, ohne dass der
          Fokus sie berührt — ohne Region bliebe das für einen Screenreader
          lautlos. Sie liegt aber NICHT auf den sichtbaren Zahlen: Die zählen
          500 ms lang hoch, und jeder Zwischenwert wäre eine Ansage. Stattdessen
          trägt ein verstecktes <p> den Endwert als einen Satz; die sichtbare
          Fassung ist für Screenreader ausgeblendet.

          Der Platzhalter nennt, was noch fehlt. Vorher stand immer derselbe
          Satz da, auch wenn der Haushalt längst gewählt war. */}
      {/* Antwortzone: eigene Fläche, damit Eingabe und Ergebnis als Frage und
          Antwort lesbar sind. Ab 820px Kartenbreite steht sie rechts neben
          den Eingaben — vorher liefen die fünf Haushaltsknöpfe 200px breit
          über die volle Startseitenbreite, und das Ergebnis stand weit unten. */}
      <div className="rw-ergebnis" style={{ background: imHero ? theme.color.bg : theme.color.surface, borderTop: `1px solid ${theme.color.border}` }}>
      <div style={{ padding: bereit ? "18px 20px 2px" : "18px 20px 18px" }}>
        <p role="status" aria-live="polite" style={nurVorlesen}>
          {bereit ? zusammenfassung : ""}
        </p>

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
            {fehlt} — dann steht hier Ihre erste Größenordnung.
          </p>
        )}

        {bereit && (
        <>
        <div aria-hidden="true">
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
                {jahre(animAmortisation)}
              </span>{" "}
              hat sich die Anlage bezahlt.
            </>
          ) : (
            <>Bei dieser Kombination trägt sich die Anlage rechnerisch nicht.</>
          )}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
          <Kennzahl grund={kennzahlGrund} label="Ersparnis" wert={euro(animErsparnis)} sub="pro Jahr" />
          <Kennzahl grund={kennzahlGrund} label="Anlagengröße" wert={`${NF.format(Math.round(animKwp * 10) / 10)} kWp`} sub={`${kWh(animErtrag)} Ertrag im Jahr`} />
        </div>
        </div>

        {/* Eigener Abstand nach oben: Die Kacheln und der Falt-Block lagen
            vorher ohne jede Lücke aufeinander (Faltblock trägt nur margin-bottom). */}
        <div style={{ marginTop: 12 }}>
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
        </div>
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
        <style>{CTA_CSS}</style>
        <a
          href="/rechner/photovoltaik/"
          className="widget-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            textWrap: "balance",
            gap: 8,
            padding: "12px 22px",
            borderRadius: theme.radius.pill,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Mit Standort-Daten genauer rechnen
          <span className="widget-cta-pfeil" aria-hidden="true">→</span>
        </a>

        {imHero && (
          <span style={{ fontSize: 13, lineHeight: 1.5, color: theme.color.textSecondary, maxWidth: "34ch" }}>
            Dann mit der Einstrahlung für Ihre Postleitzahl statt mit dem
            Bundesdurchschnitt.
          </span>
        )}
      </div>
      </div>
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
          padding: "14px 20px 16px",
          borderTop: `1px solid ${theme.color.border}`,
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