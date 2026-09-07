// PV-Reinigungsrechner: Lohnt sich das Reinigen der Anlage?
//
// Kernidee: Verschmutzung senkt den Ertrag. Der wirtschaftliche Verlust hängt
// von Umgebung, Dachneigung und Zeit seit der letzten Reinigung ab — denselben
// kWh-Verlust muss man mit dem Mischwert bewerten (Eigenverbrauch spart den
// Bezugspreis, Einspeisung bringt nur die Vergütung). Gegenüber stehen die
// Reinigungskosten (§/m² je Zugänglichkeit + Anfahrt).
//
// Quellen (Stand Sep 2026):
//  - Verschmutzungsverluste: Solaranlage-Ratgeber / Highcleaner / solarcalculatorhq:
//    Wohngebiet ca. 2,5 %, Wald/Feld ca. 4,5 %, Industrie/Straße ca. 5,5 %,
//    Landwirtschaft ca. 7,5 %. Kleibrink: Steildach in freier Lage 2–4 %, stark
//    belastete Flach-/Hallen-/Stalldächer 8–12 %.
//  - Selbstreinigung: ab ~15–25° Neigung reinigt Regen weitgehend selbst; flache
//    Dächer <10–15° praktisch ohne Selbstreinigungseffekt.
//  - Reinigungspreise: Kleibrink — gut zugänglich 1,20–2,50 €/m², Steildach mit
//    Absturzsicherung 2,50–4,50 €/m²; Anfahrt 50–150 €; Mindestauftrag 250–350 €.
//  - Mischwert: Eigenverbrauch = Bezugspreis (STROMPREIS), Einspeisung =
//    Einspeisevergütung (EINSPEISE) — identisch zum PV-Hauptrechner.
import { STROMPREIS, einspeiseStaffel, ERTRAG_PRO_KWP, M2_PRO_KWP } from "./calculate.js";

// Basale Ertragsverluste nach Umgebung (in %, als Dezimalbruch mit 1 = 100 %).
export const UMGEBUNG = [
  { label: "Wohngebiet", verlust: 0.025, sub: "wenig Staub, regelmäßiger Niederschlag" },
  { label: "Wald / Feld", verlust: 0.045, sub: "Blütenstaub, Harz, Laub, Vogelkot" },
  { label: "Industrie / Hauptstraße", verlust: 0.055, sub: "Abluft, Reifenabrieb, Bremsstaub" },
  { label: "Landwirtschaft / Stall", verlust: 0.075, sub: "Ammoniak, Ernte- und Futterstaub, Moos" },
];

// Dachneigungs-Klassen: Je flacher, desto schwächer der Selbstreinigungs-Effekt
// und desto höher der Anteil des Basis-Verlusts, der tatsächlich greift.
export const DACHNEIGUNG = [
  { label: "Steil (>25°)", faktor: 0.55, sub: "Regen spült gut ab — oft unnötig zu reinigen" },
  { label: "Mittel (15–25°)", faktor: 0.8, sub: "mittlerer Selbstreinigungseffekt" },
  { label: "Flach (<15°)", faktor: 1.15, sub: "Selbstreinigung praktisch weg — eher sinnvoll" },
];

// Zuschlag je „Jahr seit der letzten Reinigung": Verschmutzung baut sich auf.
// Basissatz mal Jahre-alpha (moderat), begrenzt auf eine sinnvolle Obergrenze,
// damit die Werte nicht ins realitätferne Abdriften geraten.
export const JAHRE_ALPHA = 0.35;
export const MAX_VERLUST = 0.15; // realistische Obergrenze ~15 % Ertragsverlust

// Reinigungskosten je m² (Mitte der Kleibrink-Spanne je Zugänglichkeit) und
// Anfahrtspauschale. Sinnvolle kWp→m² über M2_PRO_KWP aus calculate.js.
export const REINIGUNG_EUR_M2 = {
  "gutZugaenglich": 1.85,
  "steildach": 3.5,
  "anfahrt": 100,
  "mindestauftrag": 300,
};

// Früher stand hier ein eigenes `M2_PRO_KWP_REINIGUNG = 4.7` — derselbe Wert
// wie M2_PRO_KWP in calculate.js, nur dupliziert (entgegen dem Kommentar
// darüber, der schon auf calculate.js verwies). Bei einer neuen Modul-
// Generation wäre nur eine der beiden Stellen aktualisiert worden. Re-Export
// unter dem alten Namen, damit bestehende Importe weiterlaufen.
export { M2_PRO_KWP as M2_PRO_KWP_REINIGUNG } from "./calculate.js";

export function schaetzeErtrag(kwp) {
  return Math.round(kwp * ERTRAG_PRO_KWP);
}

export function eindeutigerMischwert(eigenverbrauchAnteil, kwp = 0) {
  const ev = Math.max(0, Math.min(1, eigenverbrauchAnteil));
  return ev * STROMPREIS + (1 - ev) * einspeiseStaffel(kwp);
}

export function calculateReinigung({
  kwp,
  umgebung,
  dachneigung,
  jahreSeitLetzter,
  eigenverbrauchAnteil,
  zugaenglichkeit,
}) {
  const basis = UMGEBUNG.find((u) => u.label === umgebung)?.verlust ?? 0.025;
  const neiF = DACHNEIGUNG.find((d) => d.label === dachneigung)?.faktor ?? 1;
  const jahreF = 1 + Math.max(0, jahreSeitLetzter) * JAHRE_ALPHA;

  const verlust = Math.min(MAX_VERLUST, basis * neiF * jahreF);

  const jahresertrag = Math.round(kwp * ERTRAG_PRO_KWP);
  const verlustKwh = Math.round(jahresertrag * verlust);

  const mischwert = eindeutigerMischwert(eigenverbrauchAnteil, kwp);
  const verlustEuroJahr = Math.round(verlustKwh * mischwert);

  const flaecheM2 = Math.round(kwp * M2_PRO_KWP);
  const preisProM2 = zugaenglichkeit === "gutZugaenglich"
    ? REINIGUNG_EUR_M2.gutZugaenglich
    : REINIGUNG_EUR_M2.steildach;
  const reinigungKosten = Math.max(
    REINIGUNG_EUR_M2.mindestauftrag,
    Math.round(flaecheM2 * preisProM2) + REINIGUNG_EUR_M2.anfahrt
  );

  const amortisationsJahre = reinigungKosten > 0 ? (reinigungKosten / verlustEuroJahr) : Infinity;
  const lohntSich = verlustEuroJahr > reinigungKosten;
  const nettoNutzen = verlustEuroJahr - reinigungKosten;

  return {
    kwp,
    jahresertrag,
    verlust,
    verlustKwh,
    verlustEuroJahr,
    flaecheM2,
    reinigungKosten,
    amortisationsJahre,
    lohntSich,
    nettoNutzen,
    mischwert,
  };
}
