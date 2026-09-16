// Auflösung der Hero-Fotos für `astro:assets`.
//
// Das Frontmatter der Artikel trägt den Pfad weiter als String
// (`heroImage: "/images/heroes/kosten.jpg"`) — so, wie er entstanden ist, als
// die Bilder noch unter `public/` lagen und ungeoptimiert ausgeliefert wurden.
// Seit die Ratgeber-Übersicht die Fotos groß statt als 108px-Vorschau zeigt,
// geht das nicht mehr: 17 unbearbeitete JPEGs sind gut 4 MB, und die Seite
// lebt von SEO-Traffic, also von Ladezeit.
//
// Die Dateien liegen deshalb in `src/assets/heroes/`, wo Astro sie in WebP
// umwandelt, mehrere Breiten erzeugt und einen Hash an den Dateinamen hängt.
// Statt Schema und alle 17 MDX-Dateien anzufassen, mappt dieser Helfer den
// alten Pfad auf das importierte Bild — über den Dateinamen, der sich nicht
// geändert hat.
//
// Ein neues Hero-Foto braucht deshalb nur zwei Schritte: Datei nach
// `src/assets/heroes/` legen und den gewohnten Pfad ins Frontmatter
// schreiben. Fundstelle und Fotograf gehören zusätzlich in die
// BILDNACHWEIS.md im selben Verzeichnis, sonst ist die Lizenzlage nicht
// belegbar.
const dateien = import.meta.glob("../assets/heroes/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
});

const nachDateiname = new Map(
  Object.entries(dateien).map(([pfad, bild]) => [pfad.split("/").pop(), bild])
);

/**
 * @param {string | undefined} pfad Pfad aus dem Frontmatter, z. B. "/images/heroes/kosten.jpg"
 * @returns das importierte Bild für <Image> — oder null, wenn es die Datei nicht gibt
 */
export function heroBild(pfad) {
  if (!pfad) return null;
  return nachDateiname.get(pfad.split("/").pop()) ?? null;
}
