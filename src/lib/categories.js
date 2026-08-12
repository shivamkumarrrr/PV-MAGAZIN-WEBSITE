export const CATEGORIES = [
  { slug: "grundlagen", label: "Grundlagen" },
  { slug: "kosten-foerderung", label: "Kosten & Förderung" },
  { slug: "technik", label: "Technik" },
  { slug: "speicher", label: "Speicher" },
  { slug: "einspeiseverguetung", label: "Einspeisevergütung" },
  { slug: "balkonkraftwerk", label: "Balkonkraftwerk" },
  { slug: "oekobilanz", label: "Ökobilanz" },
  { slug: "checklisten", label: "Checklisten" },
];

export function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
