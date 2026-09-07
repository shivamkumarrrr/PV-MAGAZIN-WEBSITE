// Speicher-Wirtschaftlichkeitsrechnung: "Lohnt sich der Batteriespeicher als
// Erweiterung einer PV-Anlage?" — eigenständiges, bewusst einfacheres Modell
// als calculate.js, das genau EINE Frage beantwortet: Was bringt der Speicher
// ZUSÄTZLICH zur PV-Anlage (in € und Jahren), und kostet er das.
//
// Kernmethode (mehrere unabhängige Quellen, Stand 2026 — rechne24.de,
// rechnerplus.de, solaranlage-ratgeber.de, Fraunhofer-ISE/C.A.R.M.E.N.-
// Marktübersicht):
//   Amortisation = Speicherinvestition / (Mehr-Eigenverbrauch × Spread)
//   Spread = Strompreis − Einspeisevergütung  (der Mehrwert pro zusätzlich
//            selbst verbrauchter kWh gegenüber der reinen Einspeisung)
//   Mehr-Eigenverbrauch ≈ Faustregel 200 kWh × nutzbare Speicher-kWh/Jahr
//
// Wichtig (bewusste Botschaft, deckt sich mit 2026er-Marktlage): Speicher
// amortisieren sich mit den aktuellen Preisen/Strompreisen rechnerisch oft
// erst nach 14–20 Jahren — häufig knapp an der Speicher-Lebensdauer. Der
// enorme praktische Zusatznutzen (höhere Autarkie, Unabhängigkeit, Notstrom)
// bleibt dabei bewusst getrennt von der rein wirtschaftlichen Kennzahl.
import { STROMPREIS, EINSPEISE, SPEICHER_KOSTEN_PRO_KWH } from "./calculate.js";

// Faustregel: zusätzlicher jährlicher Eigenverbrauch pro nutzbarer kWh
// Speicherkapazität. Quelle: rechne24.de PV-Speicher-Amortisation 2026;
// Praxisberichte nennen 200–250 kWh/kWh (bei kleineren Anlagen/Mieter-Speichern
// eher 250). 200 konservativ gewählt. Stand 2026.
export const MEHR_EIGENVERBRAUCH_PRO_KWH = 200;

// Round-Trip-Wirkungsgrad moderner LiFePO₄-Speicher (DC) laut Fraunhofer ISE /
// solaranlage-ratgeber.de 2026: 90–95% Zell-, ~85–90% System-Wirkungsgrad.
// 0.9 = bewusst mittlerer System-Wert, um die Rechnung nicht zu optimistisch
// zu machen. Fließt als Verlust auf den Mehr-Eigenverbrauch ein.
export const SPEICHER_WIRKUNGSGRAD = 0.9;

// Typische technische Lebensdauer eines LiFePO₄-Speichers. Quelle: Fraunhofer
// ISE "Stromgestehungskosten" (Speicher: 15 Jahre), Hersteller-Garantien
// typisch 10–15 Jahre. Wird für die Einordnung "amortisiert sich innerhalb
// der Lebensdauer?" gebraucht.
export const SPEICHER_LEBENSDAUER_JAHRE = 15;

// Empfohlene Speichergröße als Faustregel 1:1 zur PV-Leistung (kWh ≈ kWp).
// Quelle: solaranlage-ratgeber.de 2026 (auch "1 kWh / 1.000 kWh Jahres-"
// "verbrauch" gebräuchlich). Für den Default-Vorschlag im Rechner.
export function empfohleneSpeicherKwh(kwp, jahresverbrauch) {
  const ausKwp = Math.round(kwp);
  const ausVerbrauch = Math.round(jahresverbrauch / 1000);
  return Math.round(Math.max(ausKwp, ausVerbrauch));
}

export function calculateSpeicher(speicherKwh, kwp, jahresverbrauch) {
  const nutzbar = speicherKwh * SPEICHER_WIRKUNGSGRAD;
  const mehrEigenverbrauch = Math.round(nutzbar * MEHR_EIGENVERBRAUCH_PRO_KWH);
  const spread = STROMPREIS - EINSPEISE;
  const jahresMehrErsparnis = Math.round(mehrEigenverbrauch * spread);

  const investition = Math.round(speicherKwh * SPEICHER_KOSTEN_PRO_KWH);
  const amortisation = jahresMehrErsparnis > 0
    ? Math.round((investition / jahresMehrErsparnis) * 10) / 10
    : null;

  // Einordnung: amortisiert sich der Speicher innerhalb seiner Lebensdauer?
  const lohntSich = amortisation !== null && amortisation <= SPEICHER_LEBENSDAUER_JAHRE;

  return {
    speicherKwh,
    nutzbarKwh: Math.round(nutzbar * 10) / 10,
    mehrEigenverbrauch,
    spread,
    jahresMehrErsparnis,
    investition,
    amortisation,
    lohntSich,
    empfohlen: empfohleneSpeicherKwh(kwp, jahresverbrauch),
    wirkungsgrad: SPEICHER_WIRKUNGSGRAD,
    lebensdauer: SPEICHER_LEBENSDAUER_JAHRE,
  };
}
