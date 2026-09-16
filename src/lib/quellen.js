// Die Organisationen, aus denen die Konstanten in `calculate.js` und den
// abgeleiteten Rechnern stammen. EINE Quelle der Wahrheit: die Methodik-Seite
// (`src/pages/methodik/index.astro`) und der Kurzhinweis unter den Rechnern
// lesen beide von hier.
//
// Bewusst die THEMEN-Landingpage der jeweiligen Organisation verlinkt, nicht
// die tiefe Einzelseite der zitierten Ausgabe: Studienreihen wie die
// HTW-Stromspeicher-Inspektion oder die BDEW-Strompreisanalyse bekommen jedes
// Jahr eine neue URL, die Landingpage bleibt. Welche Ausgabe konkret gilt,
// steht am Wert selbst — im Kommentar über der Konstante in `calculate.js`
// und in der Spalte "Stand" auf der Methodik-Seite.
//
// Bei der jährlichen Datenpflege mitprüfen: Link erreichbar, Ausgabe aktuell.
export const QUELLEN = [
  {
    name: "PVGIS",
    traeger: "EU Joint Research Centre",
    url: "https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis_en",
    liefert:
      "Sonneneinstrahlung und Monatserträge für die exakten Koordinaten Ihrer Adresse",
  },
  {
    name: "BDEW",
    traeger: "Bundesverband der Energie- und Wasserwirtschaft",
    url: "https://www.bdew.de/energie/bdew-strompreisanalyse/",
    liefert: "Haushaltsstrompreis und saisonales Lastprofil",
  },
  {
    name: "Bundesnetzagentur",
    traeger: "EEG-Fördersätze, § 49 EEG",
    url: "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/EEG_Foerderung/start.html",
    liefert:
      "Einspeisevergütung samt Staffelung über 10 kWp und Mieterstromzuschlag",
  },
  {
    name: "Fraunhofer ISE",
    traeger: "Institut für Solare Energiesysteme",
    url: "https://www.ise.fraunhofer.de/de/veroeffentlichungen/studien/aktuelle-fakten-zur-photovoltaik-in-deutschland.html",
    liefert:
      "Systemkosten je kWp, Volllaststunden und Stromgestehungskosten",
  },
  {
    name: "HTW Berlin",
    traeger: "Forschungsgruppe Solarspeichersysteme",
    url: "https://solar.htw-berlin.de/",
    liefert:
      "Speicher-Dimensionierung und gemessene Systemwirkungsgrade",
  },
  {
    name: "ADAC",
    traeger: "Ratgeber Photovoltaik",
    url: "https://www.adac.de/rund-ums-haus/energie/solar/",
    liefert:
      "Autarkiegrade, Haushaltsverbrauch und Wechselrichter-Austauschkosten",
  },
  {
    name: "Umweltbundesamt",
    traeger: "Emissionsbilanz Strommix",
    url: "https://www.umweltbundesamt.de/themen/klima-energie/energieversorgung/strom-waermeversorgung-in-zahlen",
    liefert: "CO₂-Faktor je Kilowattstunde Netzstrom",
  },
];
