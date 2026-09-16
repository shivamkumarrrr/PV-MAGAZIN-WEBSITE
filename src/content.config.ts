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
    // `gruppe` ist optional und ordnet die Fragen thematisch (Muster von
    // lichtblick.de, das seine FAQ in benannte Blöcke wie "Kosten und
    // Beispielrechnungen" teilt, statt eine lange Liste zu stapeln). Sobald
    // ein Eintrag eine Gruppe trägt, rendert ArticleFaq Zwischenüberschriften;
    // das FAQPage-JSON-LD bleibt eine flache Liste, weil schema.org keine
    // Gruppen kennt. Obergrenze bleibt 8–9 Fragen je Artikel.
    faq: z
      .array(z.object({ frage: z.string(), antwort: z.string(), gruppe: z.string().optional() }))
      .optional(),

    // "Zusammenfassung"-Box am Artikelende (Muster: zolar/LichtBlick).
    // Kurze, quellenbelegte Kernsätze; optional, damit ältere Artikel nicht
    // nachträglich gepflegt werden müssen. Wird als gestylte Liste gerendert.
    zusammenfassung: z.array(z.string()).optional(),

    // Optionales Hero-Foto pro Artikel (pfad relativ zu /public, z.B.
    // "/images/heroes/kosten.jpg"). Wenn gesetzt, zeigt ArticleHero das Foto
    // statt des SVG-Motivs — das SVG bleibt der Fallback für Artikel ohne
    // eigenes Bild. Quelle der Bilder muss bei der jährlichen Pflege
    // geprüft werden (Lizenz, Aktualität).
    heroImage: z.string().optional(),

    // Alt-Text zum Hero-Foto (barrierefrei). Optional — ohne Angabe greift
    // ein generischer Alt-Text in ArticleHero.angle.
    heroImageAlt: z.string().optional(),
  }),
});

export const collections = { articles };
