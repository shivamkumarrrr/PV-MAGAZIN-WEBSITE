// `rechner` ist der passende Rechner für die Abschlussbox der Kategorieseite.
// Vorher führte jede Kategorie zum Photovoltaik-Rechner — auch "Balkonkraftwerk"
// (Mieter ohne eigenes Dach) und "Ökobilanz".
export const CATEGORIES = [
  { slug: "grundlagen", label: "Grundlagen", rechner: "photovoltaik" },
  { slug: "kosten-foerderung", label: "Kosten & Förderung", rechner: "photovoltaik" },
  { slug: "technik", label: "Technik", rechner: "photovoltaik" },
  { slug: "speicher", label: "Speicher", rechner: "speicher" },
  { slug: "einspeiseverguetung", label: "Einspeisevergütung", rechner: "photovoltaik" },
  { slug: "balkonkraftwerk", label: "Balkonkraftwerk", rechner: "balkonkraftwerk" },
  { slug: "oekobilanz", label: "Ökobilanz", rechner: "co2" },
  { slug: "checklisten", label: "Checklisten", rechner: "photovoltaik" },
];

export function categoryRechner(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.rechner ?? "photovoltaik";
}

export function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
