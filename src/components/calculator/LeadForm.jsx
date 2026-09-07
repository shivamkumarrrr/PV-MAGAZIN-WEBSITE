import LeadForm from "../lead/LeadForm.jsx";

// Adapter: mappt die Felder des Photovoltaik-Rechners auf das gemeinsame
// Lead-Formular (components/lead/LeadForm.jsx). Die Formular-Logik selbst
// (Einwilligung, Calendly-Zwei-Klick, Versand) lebt jetzt dort, damit alle
// elf Rechner dieselbe Erfassung nutzen statt nur dieser eine.
function beschreibeEauto(eauto, eautoProfil) {
  if (eauto === "ja") return `Ja (${eautoProfil})`;
  if (eauto === "geplant") return "Geplant";
  return "Nein";
}
function beschreibeWaermepumpe(waermepumpe) {
  if (waermepumpe === "ja") return "Ja";
  if (waermepumpe === "geplant") return "Geplant";
  return "Nein";
}
function beschreibeTageszeiten(tageszeit) {
  return tageszeit && tageszeit.length ? tageszeit.join(", ") : "Nicht angegeben";
}

export default function PvLeadForm({
  result,
  displayLocation,
  dach,
  dachform,
  ausrichtung,
  neigung,
  speicherKwh,
  eauto,
  eautoProfil,
  waermepumpe,
  tageszeit,
  plz,
  onRestart,
}) {
  const zusammenfassung = [
    `${result.kwp} kWp`,
    `${result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr`,
    `${result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr Ersparnis`,
    displayLocation || null,
  ].filter(Boolean).join(" · ");

  return (
    <LeadForm
      rechner="photovoltaik"
      zusammenfassung={zusammenfassung}
      onRestart={onRestart}
      daten={{
        plz: displayLocation || plz,
        anlagengroesse: `${result.kwp} kWp`,
        jahresertrag: `${result.jahresertrag.toLocaleString("de-DE")} kWh`,
        jahresersparnis: `${result.jahresErsparnis.toLocaleString("de-DE")} €`,
        amortisation: result.amortisation != null ? `${result.amortisation} Jahre` : "nicht bezifferbar",
        dachflaeche: `${dach} m²`,
        dachform,
        ausrichtung,
        neigung,
        speicher: speicherKwh > 0 ? `Ja, ${speicherKwh} kWh` : "Nein",
        eauto: beschreibeEauto(eauto, eautoProfil),
        waermepumpe: beschreibeWaermepumpe(waermepumpe),
        tageszeiten: beschreibeTageszeiten(tageszeit),
        datenquelle: result.dataSource || "Schätzung",
      }}
    />
  );
}
