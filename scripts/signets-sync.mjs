// Holt die Rechner-Signets aus Figma zurück in den Code.
//
// Hintergrund: Die Zeichen liegen doppelt vor — als Pfade in
// src/components/IconsRechner.jsx (das, was die Website ausliefert) und als
// Components in der Figma-Datei "Photovoltaik Aktuell — Rechner-Signets"
// (das, woran im Design gearbeitet wird). Figma Code Connect würde beide
// Seiten koppeln, verlangt aber einen Dev- oder Full-Seat auf einem
// Organization-/Enterprise-Plan; der Account hier liegt auf Starter. Dieses
// Skript ersetzt die fehlende Kopplung in der Richtung, die zählt: Figma
// führt, der Code zieht nach.
//
// Zwei Quellen:
//
//   node scripts/signets-sync.mjs --from-figma
//     Lädt die Components direkt aus der Figma-Datei. Braucht einen
//     Personal Access Token in FIGMA_TOKEN (figma.com → Settings → Security
//     → Personal access tokens, Scope "File content: read"). Die Datei-ID
//     steckt unten in FIGMA_FILE_KEY, überschreibbar per FIGMA_FILE_KEY-Env.
//
//   node scripts/signets-sync.mjs --from <verzeichnis>
//     Liest lokal exportierte SVG-Dateien (Figma → Export → SVG). Dateiname
//     bestimmt das Ziel: signet-eauto.svg, eauto.svg oder signet/eauto.svg.
//     Nur die gefundenen Zeichen werden ersetzt, der Rest bleibt stehen.
//
// --check schreibt nichts, sondern meldet nur, ob Figma und Code
// auseinanderlaufen (Exit-Code 1) — brauchbar für CI.
//
// Was das Skript beim Übernehmen entfernt: Figma exportiert an jedem Pfad
// stroke, stroke-width, stroke-linecap und stroke-linejoin erneut. Im Code
// stehen diese vier Werte EINMAL am <Svg>-Wrapper, und die Farbe ist
// currentColor, damit die Zeichen die Textfarbe ihrer Umgebung erben (die
// Karten auf /rechner/ färben sie beim Überfahren um). Die Attribute werden
// deshalb verworfen; übrig bleiben die reinen d-Pfade.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, basename } from "node:path";

const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY ?? "IMQ7LVEoRqfStuXZnGyuCF";
const ZIEL = new URL("../src/components/IconsRechner.jsx", import.meta.url);

// Slug → Komponentenname und Beschreibung. Neue Rechner hier ergänzen, sonst
// weiß das Skript nicht, wie die Komponente heißen soll.
const SIGNETS = [
  ["photovoltaik", "IconRechnerPhotovoltaik", "Modulfläche mit Sonne"],
  ["kombi", "IconRechnerKombi", "Verteilung auf mehrere Verbraucher"],
  ["rendite", "IconRechnerRendite", "Ertragskurve über die Laufzeit"],
  ["speicher", "IconRechnerSpeicher", "Batteriezelle mit Ladung"],
  ["balkonkraftwerk", "IconRechnerBalkonkraftwerk", "Modul am Kabel mit Stecker"],
  ["co2", "IconRechnerCo2", "vermiedene Emissionen"],
  ["gestehungskosten", "IconRechnerGestehungskosten", "Preisschild je Kilowattstunde"],
  ["reinigung", "IconRechnerReinigung", "Modulfläche mit Wasser"],
  ["eauto", "IconRechnerEauto", "Fahrzeug mit Ladeblitz"],
  ["steuer", "IconRechnerSteuer", "Bescheid mit Eurozeichen"],
  ["mieterstrom", "IconRechnerMieterstrom", "Mehrfamilienhaus mit Dachanlage"],
];

function fehler(nachricht) {
  console.error("Abbruch: " + nachricht);
  process.exit(1);
}

// Aus einem SVG nur die Geometrie ziehen. Alles, was der <Svg>-Wrapper im
// Code ohnehin setzt (Strich, Farbe, Enden), fliegt raus.
function geometrie(svg, quelle) {
  const pfade = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*\/?>/g)].map((m) => m[1].trim());
  if (pfade.length === 0) fehler(`${quelle} enthält keinen <path> — in Figma vor dem Export "Outline Stroke" NICHT anwenden.`);
  const fremd = svg.match(/\bfill="(?!none")[^"]+"/);
  if (fremd) {
    console.warn(`  Hinweis: ${quelle} bringt ${fremd[0]} mit — Flächen gehören nicht in diese Zeichen, der Wert wird verworfen.`);
  }
  return pfade;
}

function komponente(name, slug, beschreibung, pfade) {
  const d = pfade.map((p) => `<path d="${p}" />`).join("");
  return `// ${slug} — ${beschreibung}\nexport function ${name}(props) {\n  return <Svg {...props}>${d}</Svg>;\n}\n`;
}

async function ausVerzeichnis(dir) {
  const dateien = await readdir(dir).catch(() => fehler(`Verzeichnis ${dir} nicht lesbar.`));
  const treffer = new Map();
  for (const datei of dateien) {
    if (!datei.toLowerCase().endsWith(".svg")) continue;
    const slug = basename(datei, ".svg").replace(/^signet[-_/]?/i, "").toLowerCase();
    if (!SIGNETS.some(([s]) => s === slug)) {
      console.warn(`  Übersprungen: ${datei} — kein Rechner-Slug (erwartet: ${SIGNETS.map(([s]) => s).join(", ")}).`);
      continue;
    }
    treffer.set(slug, geometrie(await readFile(join(dir, datei), "utf8"), datei));
  }
  if (treffer.size === 0) fehler(`Keine passende SVG-Datei in ${dir} gefunden.`);
  return treffer;
}

async function ausFigma() {
  const token = process.env.FIGMA_TOKEN;
  if (!token) fehler("FIGMA_TOKEN ist nicht gesetzt — ohne Token lässt sich die Datei nicht lesen.");
  const kopf = { "X-Figma-Token": token };

  const datei = await fetch(`https://api.figma.com/v1/files/${FIGMA_FILE_KEY}?depth=2`, { headers: kopf });
  if (!datei.ok) fehler(`Figma antwortet mit ${datei.status} ${datei.statusText} auf die Datei-Abfrage.`);
  const baum = await datei.json();

  // Components heißen in der Datei "signet/<slug>".
  const ids = new Map();
  const suche = (knoten) => {
    if (knoten.type === "COMPONENT" && knoten.name.startsWith("signet/")) {
      ids.set(knoten.name.slice("signet/".length), knoten.id);
    }
    for (const kind of knoten.children ?? []) suche(kind);
  };
  suche(baum.document);
  if (ids.size === 0) fehler("In der Figma-Datei liegt kein Component namens signet/… — wurde es umbenannt?");

  const bilder = await fetch(
    `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${[...ids.values()].join(",")}&format=svg`,
    { headers: kopf },
  );
  if (!bilder.ok) fehler(`Figma antwortet mit ${bilder.status} ${bilder.statusText} auf die SVG-Abfrage.`);
  const { images } = await bilder.json();

  const treffer = new Map();
  for (const [slug, id] of ids) {
    const url = images[id];
    if (!url) {
      console.warn(`  Kein Export für signet/${slug} — übersprungen.`);
      continue;
    }
    const svg = await (await fetch(url)).text();
    treffer.set(slug, geometrie(svg, `signet/${slug}`));
  }
  return treffer;
}

// Bestehenden Stand aus der Zieldatei lesen. Wichtig ist der ROHE Inhalt des
// <Svg>-Wrappers, nicht nur die d-Attribute: Von Hand gezeichnete Zeichen
// dürfen <circle> und <rect> enthalten, und wer nur die d-Werte einsammelt,
// löscht beim Zurückschreiben genau diese Elemente. Genau das ist beim
// ersten Lauf passiert — Sonne, Batteriegehäuse, Räder und Stecker waren
// weg. Die d-Liste dient nur noch dem Vergleich.
function bestand(quelltext) {
  const map = new Map();
  for (const [slug, name] of SIGNETS.map(([s, n]) => [s, n])) {
    const treffer = quelltext.match(new RegExp(`export function ${name}\\(props\\) \\{[^]*?return <Svg \\{\\.\\.\\.props\\}>([^]*?)</Svg>;`));
    if (!treffer) continue;
    const roh = treffer[1].trim();
    map.set(slug, { roh, ds: [...roh.matchAll(/d="([^"]+)"/g)].map((m) => m[1]) });
  }
  return map;
}

const args = process.argv.slice(2);
const nurPruefen = args.includes("--check");
const vonFigma = args.includes("--from-figma");
const dirIndex = args.indexOf("--from");
const dir = dirIndex > -1 ? args[dirIndex + 1] : null;

if (!vonFigma && !dir) {
  fehler("Bitte --from-figma oder --from <verzeichnis> angeben. Siehe Kopfkommentar dieser Datei.");
}

const neu = vonFigma ? await ausFigma() : await ausVerzeichnis(dir);
const alt = bestand(await readFile(ZIEL, "utf8"));

const geaendert = [];
for (const [slug, pfade] of neu) {
  const vorher = alt.get(slug);
  if (!vorher || vorher.ds.join("|") !== pfade.join("|")) geaendert.push(slug);
}

if (geaendert.length === 0) {
  console.log(`${neu.size} Zeichen geprüft, Figma und Code sind identisch.`);
  process.exit(0);
}

if (nurPruefen) {
  console.error(`Figma und Code laufen auseinander bei: ${geaendert.join(", ")}`);
  console.error("Zum Übernehmen dasselbe Kommando ohne --check laufen lassen.");
  process.exit(1);
}

const kopf = `// ACHTUNG: Diese Datei wird von scripts/signets-sync.mjs erzeugt.
// Nicht von Hand bearbeiten — die Quelle der Zeichen ist die Figma-Datei
// "Photovoltaik Aktuell — Rechner-Signets"
// (https://www.figma.com/design/${FIGMA_FILE_KEY}).
//
// Nach einer Änderung in Figma:
//   node scripts/signets-sync.mjs --from-figma      (braucht FIGMA_TOKEN)
//   node scripts/signets-sync.mjs --from ~/Downloads (lokal exportierte SVGs)
//
// Der <Svg>-Wrapper stammt aus Icons.jsx und setzt Raster 24, Strichstärke
// 1.6, runde Enden und currentColor — deshalb tragen die Pfade hier weder
// Farbe noch Strichangaben.
import { Svg } from "./Icons.jsx";

`;

const körper = SIGNETS.map(([slug, name, beschreibung]) => {
  // Neu geliefert: aus den d-Pfaden des Exports aufbauen. Nicht geliefert:
  // den bestehenden Inhalt unverändert übernehmen, samt <circle>/<rect>.
  const geliefert = neu.get(slug);
  if (geliefert) return komponente(name, slug, beschreibung, geliefert);
  const vorhanden = alt.get(slug);
  if (!vorhanden) fehler(`Für ${slug} liegt weder ein Export noch ein bestehendes Zeichen vor.`);
  return `// ${slug} — ${beschreibung}\nexport function ${name}(props) {\n  return <Svg {...props}>${vorhanden.roh}</Svg>;\n}\n`;
}).join("\n");

await writeFile(ZIEL, kopf + körper);
console.log(`Übernommen: ${geaendert.join(", ")}`);
console.log("Danach: npm run build und die Übersicht auf /rechner/ kurz ansehen.");
