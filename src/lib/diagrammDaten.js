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
  ERTRAG_PRO_KWP,
  STROMPREIS,
  SPEICHER_KWH_PRO_1000_VERBRAUCH,
} from "./calculate.js";

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
