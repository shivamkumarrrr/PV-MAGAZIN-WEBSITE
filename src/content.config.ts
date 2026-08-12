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
  }),
});

export const collections = { articles };
