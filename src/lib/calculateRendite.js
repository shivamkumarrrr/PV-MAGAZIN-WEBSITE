// Rendite-Rechner: stellt die PV-Anlage als INVESTITION dar — jährlicher Cashflow,
// kumulierte Rendite, ROI und der Vergleich mit einer risikoarmen Geldanlage (z. B.
// Tagesgeld/Festgeld). Andere Erzählung als der Amortisations-Rechner: nicht "wann
// zahlt sich's zurück", sondern "was bringt das Kapital über die Laufzeit".
//
// Methodik folgt der bestehenden 25-Jahres-Projektion in calculate.js (DEGRADATION,
// WARTUNG, WECHSELRICHTER, STROMPREIS_STEIGERUNG) — hier aber als JAHRES-TABELLE
// statt kumuliertem Endwert, damit der Nutzer den Verlauf sieht.
import {
  STROMPREIS,
  EINSPEISE,
  KOSTEN_PRO_KWP,
  SPEICHER_KOSTEN_PRO_KWH,
  ERTRAG_PRO_KWP,
  AUSRICHTUNG,
  NEIGUNG,
  DEGRADATION_PRO_JAHR,
  WARTUNG_PROZENT_PRO_JAHR,
  WECHSELRICHTER_KOSTEN_PRO_KWP,
  WECHSELRICHTER_KOSTEN_MIN,
  WECHSELRICHTER_KOSTEN_MAX,
  STROMPREIS_STEIGERUNG_PRO_JAHR,
  computeGesamtVerbrauch,
  computeKwp,
  autarkieSchaetzung,
} from "./calculate.js";

export const RENDITE_LAUFZEIT = 20;
export const WECHSELRICHTER_ERSATZ_JAHR = 13;

// Risikoarme Vergleichsrendite (Tagesgeld/Festgeld), Stand 2026 — bewusst als
// Annahme/Variable gehalten, damit sie leicht aktualisierbar bleibt.
export const VERGLEICHSZINS_PRO_JAHR = 0.02; // 2 %/Jahr

function wechselrichterKosten(kwp) {
  return Math.min(WECHSELRICHTER_KOSTEN_MAX, Math.max(WECHSELRICHTER_KOSTEN_MIN, kwp * WECHSELRICHTER_KOSTEN_PRO_KWP));
}

// Jahres-Cashflow: (a) selbst verbrauchte kWh × (aktueller Strompreis im Jahr N –
// würde man sonst für Netzstrom zahlen), (b) eingespeiste kWh × Einspeisevergütung,
// abzüglich Wartung (ab Jahr 1) und Wechselrichter-Austausch im festgelegten Jahr.
// Die Strompreissteigerung wird >hier sichtbar< gemacht (anders als bei der prominent
// angezeigten Jahres-Ersparnis im Amortisations-Rechner) — als gekennzeichnete Annahme.
export function berechneJahresCashflow(jahresertrag, autarkieRate, gesamtVerbrauch, speicherKwh, kwp) {
  const jahre = [];
  for (let jahr = 1; jahr <= RENDITE_LAUFZEIT; jahr++) {
    const ertrag = jahresertrag * Math.pow(1 - DEGRADATION_PRO_JAHR, jahr - 1);
    const eigenverbrauch = Math.min(gesamtVerbrauch * autarkieRate, ertrag);
    const einspeisung = Math.max(0, ertrag - eigenverbrauch);
    const strompreisN = STROMPREIS * Math.pow(1 + STROMPREIS_STEIGERUNG_PRO_JAHR, jahr - 1);
    const ersparnisOption = eigenverbrauch * strompreisN; // vermiedener Netzbezug
    const ersparnisEinspeisung = einspeisung * EINSPEISE;
    let kosten = speicherKwh > 0 ? 0 : 0; // Betriebskosten separat unten
    const wartung = (kwp * KOSTEN_PRO_KWP + speicherKwh * SPEICHER_KOSTEN_PRO_KWH) * WARTUNG_PROZENT_PRO_JAHR;
    const wechselrichter = jahr === WECHSELRICHTER_ERSATZ_JAHR ? wechselrichterKosten(kwp) : 0;
    kosten = wartung + wechselrichter;
    jahre.push({
      jahr,
      ertragKwh: Math.round(ertrag),
      eigenverbrauchKwh: Math.round(eigenverbrauch),
      einspeisungKwh: Math.round(einspeisung),
      stromAusgabenVermieden: Math.round(ersparnisOption),
      einspeiseEinnahme: Math.round(ersparnisEinspeisung),
      wartung: Math.round(wartung),
      wechselrichter,
      cashflow: Math.round(ersparnisOption + ersparnisEinspeisung - kosten),
    });
  }
  return jahre;
}

export function calculateRendite(kwp, dach, speicherKwh, eauto, eautoProfil, waermepumpe, verbrauch, jahresertrag, autarkieRate) {  const investition = Math.round(kwp * KOSTEN_PRO_KWP + speicherKwh * SPEICHER_KOSTEN_PRO_KWH);
  const gesamtVerbrauch = computeGesamtVerbrauch(verbrauch, eauto, waermepumpe, eautoProfil);

  const jahre = berechneJahresCashflow(jahresertrag, autarkieRate, gesamtVerbrauch, speicherKwh, kwp);

  // Kumulierte Werte (der Cashflow fließt jahrweise, die Investition schlägt in Jahr 0 zu).
  let kum = 0;
  const kumuliert = jahre.map((j) => {
    kum += j.cashflow;
    return { jahr: j.jahr, kumuliert: kum };
  });

  const cashflowGesamt = jahre.reduce((s, j) => s + j.cashflow, 0);
  const ueberschuss = cashflowGesamt - investition;

  // Break-even-Jahr (Amortisation innerhalb der Laufzeit), anteilig.
  let amortisationsJahr = null;
  let vorher = -investition;
  for (const r of kumuliert) {
    if (vorher < 0 && r.kumuliert >= 0) {
      amortisationsJahr = r.jahr - 1 + (-vorher) / (r.kumuliert - vorher);
      break;
    }
    vorher = r.kumuliert;
  }

  const roiProzent = Math.round((ueberschuss / investition) * 100);

  // Alternativ-Anlage: gleiche Investition zu VERGLEICHSZINS über die Laufzeit (Zinseszins).
  const alternativ = Math.round(investition * Math.pow(1 + VERGLEICHSZINS_PRO_JAHR, RENDITE_LAUFZEIT));
  const differenzZurAnlage = ueberschuss - (alternativ - investition);

  return {
    investition,
    laufzeit: RENDITE_LAUFZEIT,
    jahre,
    kumuliert,
    cashflowGesamt: Math.round(cashflowGesamt),
    ueberschuss,
    amortisationsJahr: amortisationsJahr ? Math.round(amortisationsJahr * 10) / 10 : null,
    roiProzent,
    alternativ,
    alternativGewinn: alternativ - investition,
    differenzZurAnlage,
    vergleichszins: VERGLEICHSZINS_PRO_JAHR,
  };
}

// Bequemer Standalone-Einstieg fürs Rendite-Wizard (ohne PLZ/Karte): leitet
// kwp, Jahresertrag und Autarkierate aus den einfachen Eingaben ab — identische
// Formeln wie calculate.js, damit die Ergebnisse konsistent zum PV-Rechner sind.
export function calculateRenditeStandalone(dach, dachform, ausrichtung, neigung, verbrauch, speicherKwh, eauto, eautoProfil, waermepumpe) {
  const ausF = AUSRICHTUNG.find((a) => a.label === ausrichtung)?.factor ?? 1;
  const neiF = NEIGUNG.find((n) => n.label === neigung)?.factor ?? 1;
  const { kwp } = computeKwp(dach, dachform);
  const jahresertrag = Math.round(kwp * ERTRAG_PRO_KWP * ausF * neiF);
  const gesamtVerbrauch = computeGesamtVerbrauch(verbrauch, eauto, waermepumpe, eautoProfil);
  const autarkieRate = autarkieSchaetzung(kwp, gesamtVerbrauch, speicherKwh);

  const rendite = calculateRendite(kwp, dach, speicherKwh, eauto, eautoProfil, waermepumpe, verbrauch, jahresertrag, autarkieRate);
  return { ...rendite, kwp, jahresertrag, gesamtVerbrauch, autarkieRate };
}
