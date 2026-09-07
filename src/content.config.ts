import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum([
      "grundlagen",
      "kosten-foerderung",
      "technik",
      "speicher",
      "einspeiseverguetung",
      "balkonkraftwerk",
      "oekobilanz",
      "checklisten",
    ]),
    datePublished: z.coerce.date(),
    dateModified: z.coerce.date(),
    relatedRechner: z.string().default("photovoltaik"),

    // Optionales OG-Bild pro Artikel (Pfad relativ zur Site, z. B.
    // "/og/speicher.jpg"). Ohne Angabe greift das Standardbild aus
    // BaseLayout.astro — vorher hatte KEINE Seite ein og:image, jeder
    // Social-Share erschien ohne Vorschau.
    ogImage: z.string().optional(),

    // FAQ-Block am Artikelende. Wird sowohl sichtbar gerendert als auch als
    // FAQPage-JSON-LD ausgegeben (Rich Results). Bewusst Teil des Schemas
    // statt freier MDX-Auszeichnung, damit strukturierte Daten und sichtbarer
    // Text nie auseinanderlaufen können — Google verlangt genau das.
    // Antworten müssen wie der Fließtext quellenbelegt sein (CLAUDE.md).
    faq: z
      .array(z.object({ frage: z.string(), antwort: z.string() }))
      .optional(),
  }),
});

export const collections = { articles };
