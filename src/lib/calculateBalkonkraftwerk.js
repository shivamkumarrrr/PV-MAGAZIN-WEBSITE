// Ertrags-/Amortisationsrechnung für Steckersolargeräte (Balkonkraftwerke).
// Eigenständiges, bewusst einfacheres Modell als calculate.js — reine
// Modulleistung statt Dachfläche/-form, feste Wechselrichter-Deckelung
// statt Dachform-Flächenfaktor. Ausrichtungs-/Neigungsfaktoren werden aus
// calculate.js wiederverwendet (eine Quelle der Wahrheit, gleiche
// Methodik wie der Haupt-Rechner — siehe Artikel "Ausrichtung & Neigung").
import { AUSRICHTUNG, NEIGUNG, ERTRAG_PRO_KWP, STROMPREIS } from "./calculate.js";

// Bagatellgrenze Wechselrichter-Einspeiseleistung. Quelle: Bundesnetzagentur
// / Solarpaket I (EEG-Änderung, in Kraft seit 16.5.2024) — Anlagen bis zu
// dieser Einspeiseleistung gelten als unkompliziert anmeldefähig (nur noch
// Marktstammdatenregister, keine Netzbetreiber-Anmeldung). Bei Bedarf neu
// prüfen, falls eine künftige EEG-Novelle die Grenze ändert.
export const WECHSELRICHTER_GRENZE_W = 800;

// Maximale installierbare Modulleistung (Gleichstromseite) bei aktiver
// 800-W-Sonderregelung. Quelle: Bundesnetzagentur/Marktstammdatenregister —
// die Modulleistung darf die Wechselrichter-Grenze deutlich überschreiten,
// der Wechselrichter drosselt automatisch auf die erlaubte Einspeiseleistung.
export const MAX_MODULLEISTUNG_WP = 2000;

// Realistischer Jahresertrag-Deckel für ein 800-W-Balkonkraftwerk an einem
// deutschen Standort — deckt sich mit der im Artikel
// "balkonkraftwerk-einstieg-fuer-mieter" recherchierten Spanne (600–850
// kWh/Jahr). Wirkt wie eine vereinfachte Wechselrichter-Clipping-Grenze:
// zusätzliche Modulleistung über den Bedarf für diese Ausbeute hinaus
// bringt in der Praxis kaum noch mehr Jahresertrag, weil der
// Wechselrichter die Einspeisung ohnehin auf 800 W deckelt.
export const MAX_JAHRESERTRAG_KWH = 850;

// Eigene, nicht extern belegte Annahme (wie DACHFORM-Satteldach-Faktor in
// calculate.js): Ein Balkonkraftwerk ist klein gegenüber der
// Haushalts-Grundlast (Kühlschrank, Router, Standby-Geräte laufen
// durchgehend) — deshalb wird ein deutlich höherer Eigenverbrauchsanteil
// angenommen als bei einer großen Dachanlage. 85 % ist eine konservative
// Mitte dessen, was Praxisberichte für kleine Steckersolargeräte nennen;
// bei Bedarf durch eine belastbare Quelle ersetzen.
export const EIGENVERBRAUCH_ANTEIL = 0.85;

export function calculateBalkonkraftwerk(modulleistungWp, ausrichtung, neigung, investition) {
  const ausF = AUSRICHTUNG.find((a) => a.label === ausrichtung)?.factor ?? 1;
  const neiF = NEIGUNG.find((n) => n.label === neigung)?.factor ?? 1;

  const theoretischerErtrag = (modulleistungWp / 1000) * ERTRAG_PRO_KWP * ausF * neiF;
  const jahresertrag = Math.round(Math.min(theoretischerErtrag, MAX_JAHRESERTRAG_KWH));

  const eigenverbrauch = Math.round(jahresertrag * EIGENVERBRAUCH_ANTEIL);
  const jahresersparnis = Math.round(eigenverbrauch * STROMPREIS);
  const amortisation = jahresersparnis > 0 ? Math.round((investition / jahresersparnis) * 10) / 10 : null;

  return {
    jahresertrag,
    eigenverbrauch,
    jahresersparnis,
    amortisation,
    investition,
    gedeckelt: theoretischerErtrag > MAX_JAHRESERTRAG_KWH,
  };
}
