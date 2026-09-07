// CO2-Einsparungsrechner: Wie viel CO2 spart eine PV-Anlage gegenüber dem
// deutschen Strommix? Kernidee: jede selbst erzeugte (bzw. ins Netz eingespeiste)
// kWh ersetzt eine kWh, die sonst aus dem fossil geprägten Netzstrommix käme —
// die Erzeugung der PV selbst stößt praktisch kein CO2 aus.
//
// Wiederverwendet CO2_PER_KWH (kg/kWh, deutscher Strommix) und den Ertragsfaktor
// aus calculate.js, damit die Zahlen konsistent zum PV-Hauptrechner sind.
import { CO2_PER_KWH, CO2_KG_PRO_BAUM_JAHR, ERTRAG_PRO_KWP, DEGRADATION_PRO_JAHR } from "./calculate.js";

// Vergleichswerte (annahmebasiert, gekennzeichnet):
// Mit einem Mittelklasse-Benziner (ca. 6 l/100 km) entstehen ~150 g CO2/km.
export const AUTO_CO2_PRO_KM = 0.15; // kg CO2 pro km

// Ein Zug Fernverkehr stößt laut UBA etwa 30 g CO2/Personen-km aus.
export const ZUG_CO2_PRO_PERSONEN_KM = 0.03;

export function calculateCo2(kwp, jahresertrag) {
  const co2ProJahr = Math.round(jahresertrag * CO2_PER_KWH);

  // Kumuliert über die Lebensdauer unter Berücksichtigung der Moduldegradation.
  let kumuliert = 0;
  const jahre = [];
  for (let jahr = 1; jahr <= 25; jahr++) {
    const ertragN = jahresertrag * Math.pow(1 - DEGRADATION_PRO_JAHR, jahr - 1);
    const co2N = ertragN * CO2_PER_KWH;
    kumuliert += co2N;
    jahre.push({ jahr, co2: Math.round(co2N) });
  }

  const co2Gesamt25Jahre = Math.round(kumuliert);
  const baeumeProJahr = Math.round(co2ProJahr / CO2_KG_PRO_BAUM_JAHR);
  const autoKmProJahr = Math.round(co2ProJahr / AUTO_CO2_PRO_KM);
  const zugKmProJahr = Math.round(co2ProJahr / ZUG_CO2_PRO_PERSONEN_KM);

  return {
    kwp,
    jahresertrag,
    co2ProJahr,
    co2Gesamt25Jahre,
    baeumeProJahr,
    autoKmProJahr,
    zugKmProJahr,
    jahre,
  };
}

// Ertrag aus Anlagengröße schätzen (gleiche Logik wie im Hauptrechner:
// ~950 kWh pro kWp, bundesweiter Durchschnitt).
export function schaetzeCo2Ertrag(kwp) {
  return Math.round(kwp * ERTRAG_PRO_KWP);
}