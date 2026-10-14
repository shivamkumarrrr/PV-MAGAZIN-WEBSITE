// Datenreihen für Streudiagramme im Ratgeber — gerechnet, nicht abgeschrieben.
//
// Jede Reihe entsteht aus denselben Funktionen und Konstanten wie die Rechner
// (calculate.js). Ändert sich dort ein Wert (Strompreis, Vergütung,
// Autarkie-Kennlinie), ändern sich die Diagramme beim nächsten Build mit —
// dieselbe Regel wie auf der Methodik-Seite. Die Diagramme sind deshalb
// Modellrechnungen und im Artikel auch so beschriftet, keine Messwerte.
import {
  autarkieSchaetzung,
  einspeiseStaffel,
  AUSRICHTUNG,
  NEIGUNG,
  HAUSHALT,
  WAERMEPUMPE_KWH,
  EINSPEISE,
  EINSPEISE_10_40,
  EINSPEISE_40_100,
  ERTRAG_PRO_KWP,
  MONATS_ERTRAG_ANTEILE_FALLBACK,
  MONATS_VERBRAUCH_ANTEILE,
  STROMPREIS,
  SPEICHER_KWH_PRO_1000_VERBRAUCH,
} from "./calculate.js";
import { LCOE_REFERENZ_PV, LCOE_REFERENZ_PV_SPEICHER } from "./calculateGestehung.js";
import { ZUSCHLAG_STUFEN } from "./calculateMieterstrom.js";

const de = (v, stellen = 2) => v.toLocaleString("de-DE", { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
const ct = (euro) => `${de(euro * 100)} Ct`;

// Erster Satz der Übergangszahlung nach dem Regierungsentwurf EEG 2027
// (Drucksache 21/7867, anzulegender Wert minus 1 ct). Entwurfswert, keine
// Rechnerkonstante — die Rechner rechnen weiter mit geltendem Recht. Steht
// gleichlautend in src/pages/photovoltaik-2027/index.astro.
export const UEBERGANGSZAHLUNG_ENTWURF = 0.052;

/**
 * Was ein Jahr Solarstrom wert ist — Ersparnis plus Einspeiseerlös — für
 * typische Haushalte mit derselben Anlage, einmal mit heutiger Vergütung und
 * einmal mit der geplanten Übergangszahlung. x = Eigenverbrauchsquote (Anteil
 * des erzeugten Stroms, der im Haus bleibt), y = Euro pro Jahr.
 *
 * Variiert werden Jahresverbrauch (2.500–8.000 kWh) und Speicher (ohne / nach
 * HTW-Faustregel). Ergebnis: Je höher der Eigenverbrauch, desto kleiner der
 * Abstand zwischen beiden Regeln.
 */
export function wertJeHaushalt({ kwp = 10 } = {}) {
  const ertrag = kwp * ERTRAG_PRO_KWP;
  const heute = einspeiseStaffel(kwp);
  const punkte = [];
  for (const mitSpeicher of [false, true]) {
    for (let verbrauch = 2500; verbrauch <= 8000; verbrauch += 500) {
      const speicher = mitSpeicher ? (verbrauch / 1000) * SPEICHER_KWH_PRO_1000_VERBRAUCH : 0;
      const autarkie = autarkieSchaetzung(kwp, verbrauch, speicher);
      const eigen = Math.min(verbrauch * autarkie, ertrag);
      const einspeisung = ertrag - eigen;
      const quote = eigen / ertrag;
      const titel = `${verbrauch.toLocaleString("de-DE")} kWh Verbrauch, ${mitSpeicher ? "mit" : "ohne"} Speicher`;
      punkte.push({
        quote,
        titel,
        heute: eigen * STROMPREIS + einspeisung * heute,
        entwurf: eigen * STROMPREIS + einspeisung * UEBERGANGSZAHLUNG_ENTWURF,
      });
    }
  }
  return {
    kwp,
    ertrag,
    heute: punkte.map((p) => ({ x: p.quote * 100, y: p.heute, titel: `${p.titel}: ${Math.round(p.heute).toLocaleString("de-DE")} € mit heutiger Vergütung` })),
    entwurf: punkte.map((p) => ({ x: p.quote * 100, y: p.entwurf, titel: `${p.titel}: ${Math.round(p.entwurf).toLocaleString("de-DE")} € mit Übergangszahlung (Entwurf)` })),
  };
}

/**
 * Autarkiegrad in Abhängigkeit von der Speichergröße für drei Haushalte mit
 * passend dimensionierter Anlage (1 kWp je 1.000 kWh Verbrauch). Zeigt die
 * Sättigung: Die ersten Kilowattstunden Speicher bringen viel, jede weitere
 * weniger.
 */
export function autarkieNachSpeicher() {
  const haushalte = [3000, 4500, 6000];
  return haushalte.map((verbrauch) => {
    const kwp = verbrauch / 1000;
    const punkte = [];
    for (let speicher = 0; speicher <= 14; speicher += 1) {
      const autarkie = autarkieSchaetzung(kwp, verbrauch, speicher);
      punkte.push({
        x: speicher,
        y: autarkie * 100,
        titel: `${verbrauch.toLocaleString("de-DE")} kWh, ${kwp.toLocaleString("de-DE")} kWp, ${speicher} kWh Speicher: ${Math.round(autarkie * 100)} % Autarkie`,
      });
    }
    return { verbrauch, kwp, punkte };
  });
}

/**
 * Ertragsfaktoren aus den Rechner-Tabellen, in Prozent des Südwerts — für die
 * Balken im Ausrichtungs-Artikel. Süd = 100 %.
 */
export function ertragNachAusrichtung() {
  return AUSRICHTUNG.map((a) => ({
    label: a.label,
    wert: Math.round(a.factor * 100),
    anzeige: `${Math.round(a.factor * 100)} %`,
    hervor: a.factor === 1,
  }));
}

export function ertragNachNeigung() {
  return NEIGUNG.map((n) => ({
    label: n.label,
    wert: Math.round(n.factor * 100),
    anzeige: `${Math.round(n.factor * 100)} %`,
    hervor: n.factor === 1,
  }));
}

/**
 * Autarkiegrad und Eigenverbrauchsquote über der Anlagengröße (ohne Speicher,
 * fester Jahresverbrauch). Zeigt, warum beide Kennzahlen nicht dasselbe sind:
 * Mit wachsender Anlage deckt sie mehr vom Verbrauch (Autarkie steigt), aber
 * ein kleinerer Teil des Ertrags bleibt im Haus (Quote sinkt).
 */
export function autarkieVsEigenverbrauch(verbrauch = HAUSHALT[3].kwh) {
  const autarkie = [];
  const quote = [];
  for (let kwp = 2; kwp <= 12; kwp += 1) {
    const ertrag = kwp * ERTRAG_PRO_KWP;
    const a = autarkieSchaetzung(kwp, verbrauch, 0);
    const eigen = Math.min(verbrauch * a, ertrag);
    const q = eigen / ertrag;
    autarkie.push({ x: kwp, y: a * 100, titel: `${kwp} kWp: ${Math.round(a * 100)} % Autarkiegrad` });
    quote.push({ x: kwp, y: q * 100, titel: `${kwp} kWp: ${Math.round(q * 100)} % Eigenverbrauchsquote` });
  }
  return { verbrauch, autarkie, quote };
}

/**
 * Solarertrag und Haushaltsstrom je Monat (kWh), aus dem Jahresgang des
 * Rechners (Ertrag) und dem BDEW-H0-Verlauf (Verbrauch). Haushaltsstrom OHNE
 * Wärmepumpe — das Profil kennt keinen Heizstrom.
 */
export function monatsVerlauf(kwp = 8, verbrauch = HAUSHALT[3].kwh) {
  const jahresertrag = kwp * ERTRAG_PRO_KWP;
  return {
    kwp,
    verbrauch,
    kategorien: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
    ertrag: MONATS_ERTRAG_ANTEILE_FALLBACK.map((a) => a * jahresertrag),
    haushalt: MONATS_VERBRAUCH_ANTEILE.map((a) => a * verbrauch),
  };
}

/** Jahresverbrauch eines 4-Personen-Haushalts ohne und mit Wärmepumpe (kWh). */
export function verbrauchMitWaermepumpe() {
  const ohne = HAUSHALT[3].kwh;
  return { ohne, mit: ohne + WAERMEPUMPE_KWH, zusatz: WAERMEPUMPE_KWH };
}

/**
 * Kumulierte Ersparnis eines 800-W-Balkonkraftwerks über zehn Jahre, bei
 * vollständiger Nutzung des erzeugten Stroms (Obergrenze der Artikelrechnung),
 * gegen eine Kaufpreis-Marke. Der Schnittpunkt ist die Amortisation.
 * Ohne Degradation und ohne Strompreisänderung.
 */
export function balkonkraftwerkRueckfluss({ kaufpreis = 600, ertraege = [600, 850], jahre = 10 } = {}) {
  const linie = (kwh) =>
    Array.from({ length: jahre + 1 }, (_, j) => ({
      x: j,
      y: kwh * STROMPREIS * j,
      titel: `Nach ${j} ${j === 1 ? "Jahr" : "Jahren"}: ${Math.round(kwh * STROMPREIS * j).toLocaleString("de-DE")} € gespart (${kwh} kWh/Jahr)`,
    }));
  return {
    kaufpreis,
    jahre,
    niedrig: linie(ertraege[0]),
    hoch: linie(ertraege[1]),
    marke: [
      { x: 0, y: kaufpreis },
      { x: jahre, y: kaufpreis },
    ],
    amortisation: ertraege.map((kwh) => kaufpreis / (kwh * STROMPREIS)),
  };
}

/**
 * Mindest-Preisverhältnis beim Laden des Speichers aus dem Netz: Damit ein
 * Zyklus sich nicht verliert, muss der Entladepreis das 1/η-Fache des
 * Ladepreises betragen (η = Systemwirkungsgrad des Lade-/Entladezyklus).
 */
export function preisverhaeltnisNachWirkungsgrad() {
  const punkte = [];
  for (let eta = 60; eta <= 100; eta += 5) {
    const faktor = 100 / eta;
    punkte.push({ x: eta, y: faktor, titel: `${eta} % Wirkungsgrad: Entladepreis mindestens ${de(faktor)}-fach` });
  }
  const beispiel = { x: 71, y: 100 / 71, titel: "71 % Wirkungsgrad: Entladepreis mindestens 1,41-fach" };
  return { punkte, beispiel };
}

/** Verlust des Lade-/Entladezyklus aus dem System Performance Index (SPI, in %). */
export function speicherVerlust(spi) {
  return Math.round((100 - spi) * 10) / 10;
}

/** Stromgestehungskosten (Fraunhofer ISE) neben dem Haushaltsstrompreis, Ct/kWh. */
export function gestehungskostenBand() {
  const ctWert = (v) => Math.round(v * 1000) / 10;
  const zahl = (v) => de(v * 100, 1);
  return [
    {
      label: "PV-Anlage ohne Speicher",
      von: ctWert(LCOE_REFERENZ_PV.min),
      wert: ctWert(LCOE_REFERENZ_PV.max),
      anzeige: `${zahl(LCOE_REFERENZ_PV.min)}–${zahl(LCOE_REFERENZ_PV.max)} Ct`,
    },
    {
      label: "PV-Anlage mit Batteriespeicher",
      von: ctWert(LCOE_REFERENZ_PV_SPEICHER.min),
      wert: ctWert(LCOE_REFERENZ_PV_SPEICHER.max),
      anzeige: `${zahl(LCOE_REFERENZ_PV_SPEICHER.min)}–${zahl(LCOE_REFERENZ_PV_SPEICHER.max)} Ct`,
    },
    { label: "Haushaltsstrom aus dem Netz (BDEW)", wert: STROMPREIS * 100, anzeige: ct(STROMPREIS), hervor: true },
  ];
}

/**
 * Was eine Kilowattstunde den Betreiber einer Mieterstromanlage (10–40 kWp)
 * bringt: Einspeisung gegen Lieferung an die Mieter (Mieterstrompreis 25–30 Ct
 * plus Zuschlag). Zuschlag und Vergütung kommen aus den Rechnerkonstanten.
 */
export function mieterstromErloes() {
  const zuschlag = ZUSCHLAG_STUFEN.find((s) => s.maxKwp === 40).zuschlag;
  const preisMin = 0.25;
  const preisMax = 0.3;
  const ctWert = (v) => Math.round(v * 10000) / 100;
  const zahl = (v) => de(v * 100);
  return [
    { label: "Eingespeist (Teileinspeisung, 10–40 kWp)", wert: ctWert(EINSPEISE_10_40), anzeige: ct(EINSPEISE_10_40) },
    {
      label: "An Mieter geliefert (Annahme 25–30 Ct plus Zuschlag)",
      von: ctWert(preisMin + zuschlag),
      wert: ctWert(preisMax + zuschlag),
      anzeige: `${zahl(preisMin + zuschlag)}–${zahl(preisMax + zuschlag)} Ct`,
      hervor: true,
    },
    { label: "Mieterstromzuschlag allein (10–40 kWp)", wert: ctWert(zuschlag), anzeige: ct(zuschlag) },
  ];
}

/** Teileinspeisung nach Anlagengröße (Bundesnetzagentur, Inbetriebnahme 8/2026–1/2027), Ct/kWh. */
export function verguetungNachGroesse() {
  const ctWert = (v) => Math.round(v * 10000) / 100;
  return [
    { label: "bis 10 kWp", wert: ctWert(EINSPEISE), anzeige: ct(EINSPEISE), hervor: true },
    { label: "10 bis 40 kWp", wert: ctWert(EINSPEISE_10_40), anzeige: ct(EINSPEISE_10_40) },
    { label: "40 bis 100 kWp", wert: ctWert(EINSPEISE_40_100), anzeige: ct(EINSPEISE_40_100) },
  ];
}

/**
 * Preis einer 10-kWp-Anlage bei gleichem Nettopreis: bis 2022 mit 19 % Umsatzsteuer,
 * seit 2023 ohne (Nullsteuersatz). 1.150 €/kWp ist die Mitte der Fraunhofer-ISE-Spanne
 * 1.000–1.300 €/kWp, dieselbe Basis wie die Investitionssumme im Kostenartikel.
 */
export function kaufpreisMitUndOhneMwSt(kwp = 10) {
  const netto = kwp * 1150;
  return { netto, brutto: netto * 1.19 };
}
