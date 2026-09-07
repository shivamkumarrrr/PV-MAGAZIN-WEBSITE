// Mieterstrom-Rechner: erste Wirtschaftlichkeits-Einschätzung für PV auf
// Mehrfamilienhäusern, die direkt an Mieter liefert.
//
// Kernidee: Der Betreiber hat drei Einnahmequellen —
//   1. Direktverkauf an Mieter (Mieterstrompreis, max. 90 % des Grundversorgertarifs)
//   2. Mieterstromzuschlag (§ 21 Abs. 3 EEG) pro an Mieter gelieferter kWh
//   3. Einspeisevergütung für den Überschuss (nicht direkt verbrauchter Strom)
// Davon ab: Investition. Amortisation = Investition / jährliche Gesamteinnahmen.
//
// Quellen (Stand Sep 2026):
//  - Mieterstromzuschlag (BNetzA, Inbetriebnahme Feb–Jul 2026):
//    ≤10 kWp: 2,54 ct/kWh · 10–40 kWp: 2,36 ct/kWh · 40–100 kWp: 1,29 ct/kWh
//    (halbjährlich degressiv; bei Inbetriebnahme für 20 Jahre festgeschrieben).
//  - Voraussetzungen § 21 EEG: max. 100 kWp, auf/an/in Wohngebäude, ≥40 %
//    Wohnfläche, Lieferung ohne öffentliches Netz.
//  - Mieterstrompreis: max. 90 % des Grundversorgertarifs (§ 42a EnWG), in der
//    Praxis 25–30 ct/kWh. Faustregel: Mieter sparen 5–20 %.
//  - Größenordnung (Referenz 30 kWp, 8 WE, Leipzig, Volt Energie): Direktverbrauch
//    ~40 %, Gesamteinnahmen ~4.900 €/Jahr, Amortisation ~7–8 Jahre.
//  - Faustregeln: ab 6–8 WE wirtschaftlich sinnvoll (skaliert), typischer
//    Direktverbrauchsanteil 30–50 % ohne, 60–80 % mit Speicher.
import { einspeiseStaffel, ERTRAG_PRO_KWP } from "./calculate.js";

// Mieterstromzuschlag nach Anlagengröße (Stufen, Euro/kWh).
export const ZUSCHLAG_STUFEN = [
  { maxKwp: 10, zuschlag: 0.0254 },
  { maxKwp: 40, zuschlag: 0.0236 },
  { maxKwp: 100, zuschlag: 0.0129 },
];

export function zuschlagFuer(kwp) {
  const stufe = ZUSCHLAG_STUFEN.find((s) => kwp <= s.maxKwp) ?? ZUSCHLAG_STUFEN[ZUSCHLAG_STUFEN.length - 1];
  return stufe.zuschlag;
}

export function empfehlungDirektverbrauch(speicherKwh) {
  // Ohne Speicher typisch 30–50 %, mit Speicher 60–80 %. Konservativ.
  return speicherKwh > 0 ? 0.6 : 0.4;
}

export function calculateMieterstrom({
  kwp,
  we,
  teilnahmeQuote,
  direktVerbrauchQuote,
  mieterstromPreis,
  investition,
  // Laufende Kosten des Mieterstrom-Betriebs je teilnehmender Wohneinheit und
  // Jahr (Messstellenbetrieb, Abrechnung, Bilanzkreis, Lieferantenpflichten).
  // Bewusst KEIN vorbelegter Zahlenwert: eine belastbare, quellenbelegte
  // Spanne dafür liegt hier nicht vor, und ein geschätzter Betrag würde die
  // zentrale Kennzahl unbelegt verschieben (CLAUDE.md Daten-Regeln). Der
  // Nutzer trägt den Wert aus seinem Angebot ein; bei 0 weist das Ergebnis
  // die Amortisation ausdrücklich als "vor Betriebskosten" aus.
  betriebskostenProWeJahr = 0,
}) {
  const jahresertrag = Math.round(kwp * ERTRAG_PRO_KWP);
  const teilnehmendeWe = Math.round(we * teilnahmeQuote);

  // Die Direktverbrauchsquote beschreibt das Potenzial des GESAMTEN Hauses.
  // Tatsächlich abgenommen wird nur der Anteil der Haushalte, die am
  // Mieterstrommodell teilnehmen — der Rest ihres Bedarfs bleibt beim
  // bisherigen Versorger und der Strom wird eingespeist. Vorher floss
  // teilnahmeQuote gar nicht in die Rechnung ein: der Slider änderte weder
  // Einnahmen noch Amortisation.
  const abnahmeQuote = Math.max(0, Math.min(1, teilnahmeQuote));
  const mieterstromKwh = Math.round(jahresertrag * direktVerbrauchQuote * abnahmeQuote);
  const einspeisungKwh = jahresertrag - mieterstromKwh;

  const zuschlag = zuschlagFuer(kwp);
  const erloesMieterstrom = Math.round(mieterstromKwh * mieterstromPreis);
  const erloesZuschlag = Math.round(mieterstromKwh * zuschlag);
  const erloesEinspeisung = Math.round(einspeisungKwh * einspeiseStaffel(kwp));

  const gesamtEinnahmen = Math.round(erloesMieterstrom + erloesZuschlag + erloesEinspeisung);
  const betriebskosten = Math.round(teilnehmendeWe * Math.max(0, betriebskostenProWeJahr));
  const deckungsbeitrag = gesamtEinnahmen - betriebskosten;

  // Amortisation auf den Deckungsbeitrag, nicht auf den Bruttoerlös: Erlös
  // ist kein Gewinn. Bei betriebskostenProWeJahr = 0 sind beide identisch —
  // dann ist die Kennzahl ausdrücklich eine Rechnung VOR Betriebskosten
  // (siehe `vorBetriebskosten`).
  const amortisation = deckungsbeitrag > 0
    ? Math.round((investition / deckungsbeitrag) * 10) / 10
    : null;

  return {
    kwp,
    we,
    teilnehmendeWe,
    jahresertrag,
    mieterstromKwh,
    einspeisungKwh,
    zuschlag,
    erloesMieterstrom,
    erloesZuschlag,
    erloesEinspeisung,
    gesamtEinnahmen,
    betriebskosten,
    deckungsbeitrag,
    vorBetriebskosten: betriebskosten === 0,
    amortisation,
    wohnungenGenug: we >= 6,
  };
}