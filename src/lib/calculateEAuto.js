// E-Auto / Wallbox-Rechner: Wie viel kostet E-Mobilität mit eigener PV und
// wie groß sollte die Anlage sein?
//
// Kernidee: Der zusätzliche Strombedarf des E-Autos ergibt sich aus
// Fahrleistung × Verbrauch ÷ Lade-Wirkungsgrad. Ein Teil wird mit Solarstrom
// (PV-Überschussladen) gedeckt — bewertet mit dem entgangenen Einspeisewert,
// NICHT mit null (sonst unterschätzt man die echten Kosten). Der Rest kommt
// aus dem Netz zum Bezugspreis. Die Ersparnis ist die Differenz zum reinen
// Netzladen.
//
// Quellen (Stand Sep 2026):
//  - Verbrauch 18 kWh/100 km, Ladeverlust 10 %, Netzstrom ~36,5 ct/kWh,
//    Einspeisewert ~7,7 ct/kWh, Solarstromanteil 40–60 % mit smarter Wallbox
//    (Stromwolf, solarcalculatorhq, rechnerplus; ADAC-Verbrauchsspanne 13–30).
//  - Empfohlene PV-Größe: Haushalt + E-Auto häufig 9–13 kWp (Stromwolf).
import { STROMPREIS, EINSPEISE } from "./calculate.js";

// Verbrauchsprofil für die empfohlene PV-Größe nach Fahrleistung + Haushaltslast.
export function empfehlungPVGroesse(km, haushaltsverbrauch) {
  const autoKwh = autoJahresbedarf(km, 18, 10); // Standard: 18 kWh/100 km, 10 % Ladeverlust
  const gesamt = haushaltsverbrauch + autoKwh;
  // Empfohlene kWp ≈ Anlagenverhältnis 1,0–1,1 auf den Gesamtverbrauch (Stromwolf: 6–13 kWp).
  const kwp = Math.round((gesamt / 1000) * 1.05 * 10) / 10;
  return {
    kwp: Math.max(3, Math.min(20, kwp)),
    autoKwh,
    gesamtVerbrauch: gesamt,
  };
}

// Jährlicher Ladeenergiebedarf an der Wallbox (inkl. Ladeverlusten).
export function autoJahresbedarf(km, verbrauchPro100, ladeverlustPct) {
  const autarkieEnergie = (km / 100) * verbrauchPro100; // kWh in den Akku
  return autarkieEnergie / (1 - (ladeverlustPct || 10) / 100); // kWh aus der Wallbox
}

export function calculateEAuto({
  km,
  verbrauchPro100,
  ladeverlustPct,
  solarAnteil,
  netzpreis,
  einspeisewert,
}) {
  const netzpreisV = netzpreis ?? STROMPREIS;
  const einspeisewertV = einspeisewert ?? EINSPEISE;
  const sol = Math.max(0, Math.min(1, solarAnteil));

  const gesamtKwh = autoJahresbedarf(km, verbrauchPro100, ladeverlustPct);
  const solarKwh = Math.round(gesamtKwh * sol);
  const netzKwh = Math.round(gesamtKwh * (1 - sol));

  // Kosten: Solaranteil mit dem entgangenen Einspeisewert, Netzanteil mit Bezugspreis.
  const kostenSolar = solarKwh * einspeisewertV;
  const kostenNetz = netzKwh * netzpreisV;
  const kostenGemischt = Math.round(kostenSolar + kostenNetz);

  // Vergleich: alles aus dem Netz laden.
  const kostenNurNetz = Math.round(gesamtKwh * netzpreisV);

  const ersparnisProJahr = Math.max(0, kostenNurNetz - kostenGemischt);
  const kostenPro100Gem = (verbrauchPro100 / (1 - ladeverlustPct / 100)) * (sol * einspeisewertV + (1 - sol) * netzpreisV);
  const kostenPro100Netz = (verbrauchPro100 / (1 - ladeverlustPct / 100)) * netzpreisV;

  return {
    km,
    gesamtKwh: Math.round(gesamtKwh),
    solarAnteil: sol,
    solarKwh,
    netzKwh,
    kostenGemischt,
    kostenNurNetz,
    ersparnisProJahr,
    kostenPro100Gem,
    kostenPro100Netz,
    netzpreis: netzpreisV,
    einspeisewert: einspeisewertV,
  };
}
