// Stromgestehungskosten (LCOE) für eine PV-Anlage — vereinfachte,
// undiskontierte Rechnung: Gesamtkosten über die Lebensdauer geteilt durch
// Gesamtertrag über die Lebensdauer (inkl. Degradation). Bewusst einfacher
// als das vollständige Fraunhofer-ISE-Modell (das mit Kapitalkosten-
// Diskontierung rechnet) — für eine Größenordnungs-Einordnung ausreichend,
// Methodik-Hinweis dazu im Begleitartikel "Was kostet eine Kilowattstunde
// Solarstrom wirklich?".
//
// Investitions-/Betriebskosten-Konstanten werden bewusst aus calculate.js
// wiederverwendet (KOSTEN_PRO_KWP, ERTRAG_PRO_KWP, DEGRADATION_PRO_JAHR,
// WARTUNG_PROZENT_PRO_JAHR, wechselrichterKosten, STROMPREIS,
// SPEICHER_KOSTEN_PRO_KWH) statt dupliziert — eine Quelle der Wahrheit für
// diese Werte, siehe dortige Quelle+Stand-Kommentare.
import {
  KOSTEN_PRO_KWP,
  ERTRAG_PRO_KWP,
  DEGRADATION_PRO_JAHR,
  WARTUNG_PROZENT_PRO_JAHR,
  wechselrichterKosten,
  STROMPREIS,
  SPEICHER_KOSTEN_PRO_KWH,
} from "./calculate.js";

// Technische Lebensdauer für die LCOE-Rechnung. Quelle: Fraunhofer ISE,
// "Stromgestehungskosten Erneuerbare Energien", Juli 2024 (PV-Anlagen: 30
// Jahre technische/finanzielle Lebensdauer; Batteriespeicher: 15 Jahre,
// danach Ersatz zu tendenziell geringeren Kosten). Bei Bedarf neu prüfen,
// falls Fraunhofer die Annahme in einer neueren Studie ändert.
export const PV_LEBENSDAUER_JAHRE = 30;
export const SPEICHER_LEBENSDAUER_JAHRE = 15;

// Fraunhofer ISE, "Stromgestehungskosten Erneuerbare Energien", Juli 2024:
// PV-Dachanlagen (<30 kWp) ohne Speicher 4,1–14,4 ct/kWh, mit
// Batteriespeicher 6,0–22,5 ct/kWh — als Referenzband für die
// Ergebnis-Einordnung im UI, nicht Teil der eigenen Berechnung.
export const LCOE_REFERENZ_PV = { min: 0.041, max: 0.144 };
export const LCOE_REFERENZ_PV_SPEICHER = { min: 0.06, max: 0.225 };

export function calculateGestehung(kwp, jahresertrag, speicherKwh = 0) {
  const investitionPv = kwp * KOSTEN_PRO_KWP;
  const investitionSpeicher = speicherKwh * SPEICHER_KOSTEN_PRO_KWH;
  const investition = investitionPv + investitionSpeicher;

  let kumulierterErtrag = 0;
  let kumulierteWartung = 0;
  for (let jahr = 1; jahr <= PV_LEBENSDAUER_JAHRE; jahr++) {
    kumulierterErtrag += jahresertrag * Math.pow(1 - DEGRADATION_PRO_JAHR, jahr - 1);
    kumulierteWartung += investition * WARTUNG_PROZENT_PRO_JAHR;
  }

  const wechselrichterKostenWert = wechselrichterKosten(kwp);

  // Ein Batterie-Ersatz innerhalb der 30-jährigen PV-Lebensdauer, da
  // Speicher laut Fraunhofer ISE nur 15 Jahre technische Lebensdauer haben
  // (zum gleichen Kostenansatz — ein Preisverfall bis zum Ersatzzeitpunkt
  // wird hier bewusst nicht unterstellt, um die Rechnung nicht künstlich
  // zu optimistisch zu machen).
  const speicherErsatz = speicherKwh > 0 && SPEICHER_LEBENSDAUER_JAHRE < PV_LEBENSDAUER_JAHRE
    ? investitionSpeicher
    : 0;

  const gesamtkosten = investition + kumulierteWartung + wechselrichterKostenWert + speicherErsatz;
  const lcoe = kumulierterErtrag > 0 ? gesamtkosten / kumulierterErtrag : 0;
  const ersparnisProKwh = Math.max(0, STROMPREIS - lcoe);
  const ersparnisProzent = STROMPREIS > 0 ? Math.round((ersparnisProKwh / STROMPREIS) * 100) : 0;

  return {
    investition,
    investitionPv,
    investitionSpeicher,
    speicherErsatz,
    kumulierteWartung,
    wechselrichterKostenWert,
    gesamtkosten,
    kumulierterErtrag: Math.round(kumulierterErtrag),
    lcoe,
    lcoeCent: Math.round(lcoe * 1000) / 10,
    strompreisCent: Math.round(STROMPREIS * 1000) / 10,
    ersparnisProKwh,
    ersparnisProzent,
  };
}

// Default-Jahresertrag-Schätzung für den ersten Schritt, bevor der Nutzer
// einen genaueren Wert (z.B. aus dem PV-Rechner-Ergebnis mit echten
// PVGIS-Daten) einträgt.
export function schaetzeJahresertrag(kwp) {
  return Math.round(kwp * ERTRAG_PRO_KWP);
}
