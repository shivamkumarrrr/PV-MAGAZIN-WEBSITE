// Zentrale Liste aller Rechner — eine Quelle der Wahrheit für die
// Rechner-Übersicht (src/pages/rechner/index.astro) UND für die
// "Passend dazu"-CTA am Artikelende (src/components/RechnerCta.astro).
//
// Vorher lag die Liste nur in der Übersichtsseite und RechnerCta schrieb
// "Photovoltaik-Rechner" fest in den Titel — auch dann, wenn der Link auf
// den Balkonkraftwerk-, Gestehungskosten-, E-Auto- oder Reinigungsrechner
// zeigte. Wer einen Artikel über Steckersolargeräte las, bekam am Ende eine
// Box mit dem falschen Werkzeugnamen.
//
// `kurz` ist der Name für die CTA-Box (kompakter als der Seitentitel),
// `beschreibung` die Karte auf der Übersichtsseite.
export const RECHNER = [
  {
    slug: "photovoltaik",
    title: "Photovoltaik-Rechner",
    kurz: "Photovoltaik-Rechner",
    beschreibung:
      "Anlagengröße, Jahresertrag, Ersparnis, Autarkiegrad und Amortisation — auf Basis echter PVGIS-Satellitendaten für Ihren Standort.",
  },
  {
    slug: "kombi",
    title: "PV + Wärmepumpe + E-Auto",
    kurz: "Kombi-Rechner",
    beschreibung:
      "Szenarien-Vergleich: Wie Ihre Verbraucher Eigenverbrauch, Autarkie und Amortisation der PV-Anlage verschieben.",
  },
  {
    slug: "rendite",
    title: "Rendite-Rechner",
    kurz: "Rendite-Rechner",
    beschreibung:
      "Ihre PV-Anlage als Geldanlage: Cashflow, Rendite und ROI über 20 Jahre — im Vergleich zu einer risikolosen Festgeld-Anlage.",
  },
  {
    slug: "speicher",
    title: "Speicherrechner",
    kurz: "Speicher-Rechner",
    beschreibung:
      "Ob sich ein Batteriespeicher zu Ihrer PV-Anlage lohnt — Mehr-Eigenverbrauch, jährliche Ersparnis und Amortisation, ehrlich eingeordnet.",
  },
  {
    slug: "balkonkraftwerk",
    title: "Balkonkraftwerk-Rechner",
    kurz: "Balkonkraftwerk-Rechner",
    beschreibung:
      "Ertrag und Amortisation für Stecker-Solargeräte, speziell für Mieter und kleine Budgets.",
  },
  {
    slug: "co2",
    title: "CO2-Einsparungsrechner",
    kurz: "CO₂-Rechner",
    beschreibung:
      "Wie viel CO2 spart Ihre Anlage gegenüber dem deutschen Strommix ein? Pro Jahr, über 25 Jahre und im Vergleich zu Bäumen & Autofahrten.",
  },
  {
    slug: "gestehungskosten",
    title: "Gestehungskostenrechner",
    kurz: "Gestehungskosten-Rechner",
    beschreibung:
      "Ihre eigenen Stromgestehungskosten in ct/kWh im Vergleich zum Netzstrompreis — nach Fraunhofer-ISE-Methodik.",
  },
  {
    slug: "reinigung",
    title: "Reinigungsrechner",
    kurz: "Reinigungs-Rechner",
    beschreibung:
      "Wie viel Ertrag kostet Sie Verschmutzung — und rechnet sich eine professionelle Reinigung Ihrer Anlage?",
  },
  {
    slug: "eauto",
    title: "E-Auto-Laderechner",
    kurz: "E-Auto-Laderechner",
    beschreibung:
      "Solarstromanteil, Ladekosten und passende PV-Größe für Ihr Elektroauto — nach Ihrem Fahrprofil.",
  },
  {
    slug: "steuer",
    title: "PV-Steuerrechner",
    kurz: "PV-Steuerrechner",
    beschreibung:
      "Was sparen Sie durch Nullsteuersatz und Einkommensteuerbefreiung Ihrer Anlage?",
  },
  {
    slug: "mieterstrom",
    title: "Mieterstromrechner",
    kurz: "Mieterstrom-Rechner",
    beschreibung:
      "PV auf dem Mehrfamilienhaus: Erlös an Mieter, Mieterstromzuschlag und Amortisation abschätzen.",
  },
];

// Die elf Rechner nach der Frage gruppiert, die jemand im Kopf hat — nicht
// nach Technik. Elf gleichwertige Einträge nebeneinander sind keine Auswahl,
// sondern eine Zumutung: Wer gerade eine erste Zahl gesehen hat, sucht
// "lohnt sich das?", nicht "Gestehungskosten-Rechner". Dieselbe Ordnung
// trägt das Nav-Panel im Header und die Übersichtsseite, damit jemand die
// Struktur nur einmal lernen muss.
export const RECHNER_GRUPPEN = [
  {
    titel: "Lohnt sich das?",
    hinweis: "Ertrag, Ersparnis und Amortisation durchrechnen.",
    slugs: ["photovoltaik", "rendite", "speicher", "balkonkraftwerk"],
  },
  {
    titel: "Was kostet der Betrieb?",
    hinweis: "Laufende Kosten, Technik und Umweltbilanz.",
    slugs: ["gestehungskosten", "reinigung", "co2"],
  },
  {
    titel: "Mehr aus dem Strom holen",
    hinweis: "Wenn Wärmepumpe, Auto oder Mieter dazukommen.",
    slugs: ["kombi", "eauto", "mieterstrom", "steuer"],
  },
];

// Gruppen mit aufgelösten Rechner-Objekten. Wirft beim Build, wenn ein Slug
// in der Gruppierung nicht (mehr) in RECHNER steht — sonst verschwindet ein
// Rechner beim Umbenennen still aus der Navigation.
export function rechnerGruppen() {
  return RECHNER_GRUPPEN.map((g) => ({
    ...g,
    eintraege: g.slugs.map((slug) => {
      const r = rechnerBySlug(slug);
      if (!r) throw new Error(`RECHNER_GRUPPEN nennt unbekannten Slug "${slug}"`);
      return r;
    }),
  }));
}

export function rechnerBySlug(slug) {
  return RECHNER.find((r) => r.slug === slug) ?? null;
}

// Name für die CTA-Box. Fällt auf den generischen Titel zurück, falls ein
// Artikel einen relatedRechner-Slug nennt, den es (noch) nicht gibt.
export function rechnerName(slug) {
  return rechnerBySlug(slug)?.kurz ?? "PV-Rechner";
}
