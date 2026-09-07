// PV-Steuerrechner: Welchen steuerlichen Vorteil bringt die Rechtslage 2026?
//
// Drei Bausteine, die für eine typische Hausdachanlage (≤30 kWp auf Wohngebäude)
// automatisch greifen:
//  1. Nullsteuersatz (§12 Abs. 3 UStG): Kauf ohne Umsatzsteuer. Der Vorteil
//     gegenüber der alten Rechtslage ist die eingesparte 19 % Umsatzsteuer,
//     bruchrechnung = Brutto (alt) vs. Netto (neu).
//  2. Einkommensteuerbefreiung (§3 Nr. 72 EStG): Einspeisung + Eigenverbrauch
//     bleiben einkommensteuerfrei. Der wirtschaftliche Wert liegt darin, dass
//     keinerlei Steuererklärung/EÜR für die Anlage nötig ist.
//
// Quellen (Stand Sep 2026):
//  - §12 Abs. 3 UStG: Nullsteuersatz für PV auf Wohngebäuden (inkl. Speicher).
//  - §3 Nr. 72 EStG: Einkommensteuerfreiheit bis 30 kWp je Wohn-/Gewerbeeinheit
//    (seit 01.01.2025, gedeckelt 100 kWp je Steuerpflichtigem insgesamt).
import { STROMPREIS, EINSPEISE, ERTRAG_PRO_KWP } from "./calculate.js";

export const MwStSatz = 0.19;
export const SteuerfreiesKwp = 30;

export function berechneMwstErsparnis(effektivpreis) {
  // Alt: Anlage mit 19 % Umsatzsteuer → Brutto = Netto × 1,19.
  // Neu: Nullsteuersatz → bezahlt wird netto. Ersparnis = Brutto − Netto.
  const bruttopreisAlt = effektivpreis * (1 + MwStSatz);
  return {
    effektivpreis,
    bruttopreisAlt: Math.round(bruttopreisAlt),
    ersparnisMwst: Math.round(effektivpreis * MwStSatz),
  };
}

export function calculateSteuer(kwp, effektivpreis) {
  const mwst = berechneMwstErsparnis(effektivpreis);
  const steuerfrei = kwp <= SteuerfreiesKwp;

  // Veranschaulichung der Einkommensteuerfreiheit: der sonst zu versteuernde
  // jährliche Anlagen-Ertrag (Einspeisung + Wert des Eigenverbrauchs) bleibt
  // komplett bei der Person — keine EÜR, keine Abschreibung nötig.
  const jahresertrag = Math.round(kwp * ERTRAG_PRO_KWP);

  return {
    kwp,
    ...mwst,
    steuerfrei,
    jahresertrag,
  };
}
