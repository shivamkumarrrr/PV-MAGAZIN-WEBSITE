// Geschätzte Lesezeit in Minuten aus dem MDX-Rohtext.
//
// 220 Wörter pro Minute ist der Wert, mit dem `[slug].astro` die Angabe über
// dem Artikel berechnet — die Ratgeber-Karten müssen dieselbe Zahl zeigen,
// sonst verspricht die Übersicht 4 Minuten und der Artikel sagt 6. Deshalb
// hier EINE Funktion statt zweier Formeln.
//
// Bewusst grob: gezählt wird der ungerenderte Rohtext inklusive
// MDX-Komponenten-Tags. Genauer wäre eine Zählung nach dem Rendern, aber die
// Angabe ist eine Orientierung, kein Messwert — und eine scheingenaue
// Lesezeit wäre schlechter als eine ehrlich gerundete.
export const WOERTER_PRO_MINUTE = 220;

export function lesedauerMinuten(body) {
  const woerter = body?.trim().split(/\s+/).length ?? 0;
  return Math.max(1, Math.round(woerter / WOERTER_PRO_MINUTE));
}
