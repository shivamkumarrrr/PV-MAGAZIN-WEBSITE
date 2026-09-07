// Kombinations-Rechner: zeigt, wie sich Wärmepumpe, E-Auto und Speicher auf die
// Wirtschaftlichkeit einer PV-Anlage auswirken. Statt einer einzigen Zahl liefert
// er einen SZENARIEN-VERGLEICH (Sicherheitsnetz-Methode): "Ohne PV", "PV allein",
// "PV + Speicher", "PV + E-Auto", "PV + Wärmepumpe", "PV + alles" — jeweils mit
// Jahresertrag, Eigenverbrauch, Autarkie, Investition und Amortisation.
//
// Wiederverwendet die identischen Modelle aus calculate.js (computeGesamtVerbrauch,
// autarkieSchaetzung, computeKwp), damit die Ergebnisse konsistent zum
// PV-Rechner sind — keine Duplikation der Formeln.
import {
  STROMPREIS,
  einspeiseStaffel,
  KOSTEN_PRO_KWP,
  SPEICHER_KOSTEN_PRO_KWH,
  ERTRAG_PRO_KWP,
  AUSRICHTUNG,
  NEIGUNG,
  WAERMEPUMPE_KWH,
  E_AUTO_PROFILE,
  computeGesamtVerbrauch,
  computeKwp,
  autarkieSchaetzung,
} from "./calculate.js";

// Anzeigewerte für den Erklärtext im Wizard. Bewusst AUS calculate.js
// abgeleitet statt eigenständig gesetzt: vorher standen hier zwei feste
// 3.000er, während compareScenarios() tatsächlich mit WAERMEPUMPE_KWH (3.000)
// und dem E-Auto-Profil "Hauptwagen" (1.800 kWh) rechnete. Der Wizard behauptete
// also "+3.000 kWh/Jahr fürs E-Auto", während das Modell 1.800 kWh ansetzte.
export const WP_JAHRESVERBRAUCH = WAERMEPUMPE_KWH;
export const EAUTO_JAHRESVERBRAUCH =
  E_AUTO_PROFILE.find((p) => p.label === "Hauptwagen")?.kwh ?? E_AUTO_PROFILE[1].kwh;

// Bequemer Einstieg: berechnet das Kernmodell für EIN Szenario und vergleicht
// es gegen den Netzbezug ohne PV (Basis).
export function berechneSzenarioStandard(kwp, dachform, ausrichtung, neigung, verbrauch, speicherKwh, eautoV, waermepumpeV) {
  const ausF = AUSRICHTUNG.find((a) => a.label === ausrichtung)?.factor ?? 1;
  const neiF = NEIGUNG.find((n) => n.label === neigung)?.factor ?? 1;
  const jahresertrag = Math.round(kwp * ERTRAG_PRO_KWP * ausF * neiF);

  const eauto = eautoV === "ja" ? "ja" : "nein";
  const waermepumpe = waermepumpeV === "ja" ? "ja" : "nein";
  const gesamtVerbrauch = computeGesamtVerbrauch(verbrauch, eauto, waermepumpe, eauto === "ja" ? "Hauptwagen" : null);

  const autarkieRate = autarkieSchaetzung(kwp, gesamtVerbrauch, speicherKwh);
  const eigenverbrauch = Math.round(Math.min(gesamtVerbrauch * autarkieRate, jahresertrag));
  const einspeisung = jahresertrag - eigenverbrauch;
  const jahresErsparnis = Math.round(eigenverbrauch * STROMPREIS + einspeisung * einspeiseStaffel(kwp));

  const investition = Math.round(kwp * KOSTEN_PRO_KWP + speicherKwh * SPEICHER_KOSTEN_PRO_KWH);
  const amortisation = jahresErsparnis > 0 ? Math.round((investition / jahresErsparnis) * 10) / 10 : null;
  const autarkie = Math.round((eigenverbrauch / gesamtVerbrauch) * 100);
  const netzbezugKosten = Math.round(gesamtVerbrauch * STROMPREIS);
  const kostenMitSolar = Math.round(netzbezugKosten - jahresErsparnis);

  return {
    kwp,
    jahresertrag,
    eigenverbrauch,
    einspeisung,
    gesamtVerbrauch,
    jahresErsparnis,
    investition,
    amortisation,
    autarkie,
    netzbezugKosten,
    kostenMitSolar,
    eigenverbrauchsquote: jahresertrag > 0 ? Math.round((eigenverbrauch / jahresertrag) * 100) : 0,
  };
}

export function compareScenarios(kwp, dachform, ausrichtung, neigung, verbrauch, speicherKwh, eauto, waermepumpe) {
  // Basis = reiner Netzbezug mit dem tatsächlich vorhandenen Verbrauch des
  // Haushalts (inkl. der vom Nutzer aktivierten Wärmepumpe/E-Auto).
  const basisEauto = eauto === "ja" ? "ja" : "nein";
  const basisWp = waermepumpe === "ja" ? "ja" : "nein";
  const basisVerbrauch = computeGesamtVerbrauch(verbrauch, basisEauto, basisWp, basisEauto === "ja" ? "Hauptwagen" : null);
  const basis = {
    label: "Ohne PV (Netzbezug)",
    netzbezugKosten: Math.round(basisVerbrauch * STROMPREIS),
  };

  // Szenarien vergleichen, welche Kombination sich lohnt. Hier wird jede
  // Kombination demonstrativ "eingeschaltet" (auch wenn der Nutzer sie noch
  // nicht hat), um den Mehrwert jeder Erweiterung zu zeigen.
  const szenarien = [
    { label: "PV allein", eautoF: false, wpF: false, speicher: false },
    { label: "PV + Speicher", eautoF: false, wpF: false, speicher: true },
    { label: "PV + E-Auto", eautoF: true, wpF: false, speicher: false },
    { label: "PV + Wärmepumpe", eautoF: false, wpF: true, speicher: false },
    { label: "PV + alles", eautoF: true, wpF: true, speicher: true },
  ];

  const resultate = szenarien.map((s) => {
    const sp = s.speicher ? speicherKwh : 0;
    const r = berechneSzenarioStandard(
      kwp, dachform, ausrichtung, neigung, verbrauch,
      sp,
      s.eautoF ? "ja" : "nein",
      s.wpF ? "ja" : "nein"
    );
    return { ...s, ...r };
  });

  return { basis, szenarien: resultate };
}
