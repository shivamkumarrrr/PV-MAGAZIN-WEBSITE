# CLAUDE.md — pv-content-hub Projekt-Gedächtnis

Wird von Claude Code am Anfang jeder Session gelesen. Ziel: Arbeit
fortsetzen können ohne das Projekt erneut zu erklären. Für generische
Astro-Workflow-Hinweise (Dev-Server im Hintergrund starten, Doku-Links)
siehe `AGENTS.md` im selben Verzeichnis.

## Project Overview

PV-Content-Hub: Ratgeber-Artikel + PV-Rechner, eigenständiges Repo (nicht
Teil von `pvrechner`). Vorbild Struktur: solaranlage-ratgeber.de,
co2online.de/modernisieren-und-bauen/photovoltaik. Ziel: SEO-Traffic auf
Artikel-Content, mit durchgehender Verlinkung zum Rechner als
Conversion-Punkt — **die Seite dient Sales/Leadgen**, nicht nur Info.
Marke/Betreiber: PPC GmbH direkt, kein Fantasiename. Sprache: Deutsch
durchgehend. Stack: Astro (statisches HTML für Content-Seiten, React-Insel
für den interaktiven Rechner), Deployment-Ziel Vercel.

### Warum Astro statt reinem React-SPA

Diese Seite lebt von SEO-Traffic auf Artikel-Inhalte. Eine reine
Client-Side-React-SPA hätte ein Indexierungsrisiko. Astro rendert
Content-Seiten als statisches HTML, erlaubt aber gezielt einzelne
interaktive React-Komponenten ("Islands") dort, wo sie gebraucht werden
(der Rechner auf `/rechner/photovoltaik/`).

## Architektur

- `src/pages/` — Astro-Seiten (statisch, `output: "static"`).
- `src/pages/api/pvgis.ts` — einzige Server-Route (`prerender = false`),
  läuft on-demand über den Vercel-Adapter als Serverless Function. Rest
  der Seite bleibt statisch. **Nicht anfassen ohne Grund** — Proxy existiert,
  weil `re.jrc.ec.europa.eu` keinen CORS-Header sendet (siehe Kommentar in
  der Datei).
- `src/content/articles/*.mdx` — Artikel als Content Collection
  (`src/content.config.ts`, Astro Content Layer API mit `glob`-Loader).
  Schema: `title`, `description`, `category` (Enum, siehe
  `src/lib/categories.js`), `datePublished`, `dateModified`,
  `relatedRechner`.
- `src/components/calculator/**` — **1:1 aus dem `pvrechner`-Quellprojekt
  portiert** (Wizard, Steps, ResultScreen, UI-Komponenten). Rechner-Logik
  (`src/lib/calculate.js`) unverändert übernommen, inkl. aller
  Quellenangaben — **nicht ohne neue Recherche ändern**, siehe
  Daten-Regeln unten.
- `src/theme.js` (für die React-Insel) und `src/styles/global.css`
  (CSS-Custom-Properties für Astro-Seiten) müssen dieselben Token-Werte
  tragen — bei Änderung an einem Ort den anderen mitpflegen.
- `src/config.js` — schlanke Konfiguration nur für das, was
  `ResultScreen.jsx` tatsächlich liest (`lead.mode`/-keys,
  `contact.calendlyUrl`). Kein volles Mandanten-System wie im
  Quellprojekt — dieser Hub hat genau einen Mandanten (PPC GmbH).

## Design System

```
Background:    #F6F8F7  (kühles Off-White, NICHT cremig)
Cards:         #FFFFFF
Text/primary:  #141B22
Text/secondary:#5A6570
Accent:        #FF5200  (echtes PPC-Orange, aus dem offiziellen Logo-File)
Accent hover:  #D64700
Accent subtle: #FFE9DD
Brand-Navy:    #382E4A  (dunkle Headline-Akzente, KEIN Logo-Hintergrund-Chip)
Sky (2nd):     #2E6F95  (nur für Daten-Elemente, z. B. Ertragskurve)
Border:        #E1E5E4  (bewusst NICHT #e2e8f0 Tailwind-Slate)
Display-Font:  'Space Grotesk' (Headlines/Zahlen)
Body-Font:     system-ui-Stack
```

PPC-Logo: `src/assets/ppc-logo.png`, transparentes PNG, liest direkt auf
heller Fläche — kein dunkler Chip, kein Verlauf. In Navbar (`Header.astro`)
und Footer.

### Absolute Design-Regeln (nicht verhandelbar, bei jedem UI-Task prüfen)

Übernommen aus dem `pvrechner`-Quellprojekt (dort mehrfach validiert,
siehe dortiges CLAUDE.md):

1. Keine Emoji als Icons. Handgezeichnete Inline-SVGs (siehe `Icons.jsx`).
2. Kein wiederholter Gradient für alles. EIN Akzent für EINEN klaren Zweck.
3. Keine Tailwind-Default-Palette. Nur die Werte oben.
4. Kein Glassmorphism/backdrop-blur. Kein dunkler Logo-Chip/-Verlauf.
5. Keine cremig+terracotta+Serif-Kombination, keine dunkler-Hintergrund+
   Neon-Akzent-Kombination — beides dokumentierte "AI-Tells".
6. Keine wiederholten Icon-Text-Pillen als Trust-Badge-Muster.
7. Card-Monotonie vermeiden. Cards nutzen 1px-Border statt Schatten;
   Schatten nur für echte Overlay-Elemente. **Kein Side-Tab/Akzent-Border**
   an einer Card-Kante (ebenfalls ein bekannter AI-Tell — bereits einmal in
   `RechnerCta.astro` gefunden und entfernt, siehe Git-Historie).
8. Kein Radius über 12px, außer echte Pill-Formen und Kreise.
9. Keine nummerierten Kreise als reine Deko.
10. Keine Branchen-Floskeln ("Unverbindlich · Kostenlos · Regionaler
    Fachbetrieb"). Eigene, konkrete Formulierungen.
11. Ein Signature-Element statt vieler Mini-Dekorationen.

Bei jedem Vorschlag gegenprüfen: "Sieht das aus wie jede zweite
AI-generierte SaaS-Landingpage gerade?" Wenn ja, überarbeiten.

### Rechner-CTA-Platzierung: inline, nicht Sidebar

Bewusste Entscheidung (siehe ursprünglicher Projekt-Prompt): Rechner-CTAs
stehen INLINE im Artikeltext (`<RechnerCta variant="inline" />`, 1–2
Stellen pro Artikel an inhaltlich passender Stelle) plus eine
Abschluss-Box am Artikelende (`variant="final"`, wird automatisch von
`ArticleLayout.astro` gerendert). Keine durchgehende Sidebar — Großteil
des Traffics ist mobil, wo eine Sidebar ohnehin zu gestapeltem Layout
kollabiert.

## Daten-/Berechnungs-Regeln

- Alle Konstanten mit Geldbezug oder Prozentwert (in `calculate.js` und in
  Artikeltexten) brauchen Quelle + Stand. Nie einen Wert ohne Quelle
  ändern oder neu erfinden.
- `calculate.js` ist 1:1 aus dem `pvrechner`-Quellprojekt portiert —
  Stand der Konstanten dort siehe Kommentare in der Datei selbst
  (Strompreis, Einspeisevergütung, Systemkosten, CO2-Faktor etc., jeweils
  mit Quelle+Stand+Prüf-Rhythmus). Bei Bedarf dort neu recherchieren,
  nicht aus dem Kontext übernehmen.
- Autarkiegrad vs. Eigenverbrauchsquote nicht verwechseln (siehe Kommentar
  in `calculate.js` und Artikel "Wie funktioniert eine Photovoltaikanlage").
- Speicher darf niemals die Amortisation gegenüber derselben Anlage ohne
  Speicher verkürzen — wirtschaftlich unplausibel, bei jeder Änderung an
  den Speicher-Konstanten gegenprüfen.

## Verbot: erfundene Testimonials/Bewertungen/Kundennamen/Autoren

Gleiche Regel wie im `pvrechner`-Quellprojekt (§ 5 UWG-Risiko bei
fabrizierten Kundenstimmen). Gilt zusätzlich für Artikel-Autoren: Diese
Artikel-Batch läuft bewusst OHNE Autoren-Byline (Nutzerentscheidung) —
falls später Autoren ergänzt werden sollen, nur echte Namen/Rollen
verwenden, niemals erfundene.

## Verbot: erfundene Firmen-/Markenidentität

Marke ist entschieden: PPC GmbH direkt, kein Zwischenname. Bei Unklarheit
nachfragen oder eindeutigen Platzhalter (`[FIRMENNAME]`) verwenden.

## Content-Regeln für Artikel

- Eigene Gliederung pro Artikel, keine Struktur von ADAC/co2online/
  solaranlage-ratgeber.de/Envion nachbauen.
- Fakten/Zahlen mit Quellenangabe im Fließtext (nicht nur im Kommentar wie
  in `calculate.js` — hier ist der Leser das Publikum).
- PPCs eigene Rechner-Methodik als Content-Differenzierung nutzen, wo es
  passt (siehe `ausrichtung-und-neigung-realistischer-ertrag.mdx` als
  Beispiel: erklärt explizit, wie der eigene Rechner PVGIS nutzt).
- Jeder Artikel endet mit der automatischen "Passend dazu"-CTA-Box
  (`ArticleLayout.astro`) — nicht selbst duplizieren.

## Was noch offen ist (TODOs vor Livegang)

- `astro.config.mjs`: `site:` ist noch Platzhalter
  (`https://pv-content-hub.example`) — echte Domain eintragen, danach auch
  `public/robots.txt` (Sitemap-URL) prüfen.
- `src/config.js`: `lead.mode` ist `"demo"` (kein echtes Backend). Auf
  `"web3forms"` | `"formspree"` | `"webhook"` umstellen, sobald ein
  Endpunkt feststeht.
- `src/pages/impressum/` und `src/pages/datenschutz/`: nur Platzhalter mit
  TODO-Hinweis, keine rechtsgültigen Angaben — vor Livegang ausfüllen
  (Pflichtangaben § 5 TMG bzw. Art. 13/14 DSGVO).
- Phase 2 — offen (nur als "bald verfügbar"-Karten auf `/rechner/`
  gelistet): Speicherrechner, Balkonkraftwerk-Rechner,
  CO2-Einsparungsrechner. **Gestehungskostenrechner ist bereits live**
  (`/rechner/gestehungskosten/`, `src/lib/calculateGestehung.js`,
  `src/components/gestehung/**`) — vereinfachte, undiskontierte LCOE-
  Rechnung, Methodik-Hinweis im Begleitartikel
  `stromgestehungskosten-photovoltaik-erklaert.mdx`.
- Recherche-Ergebnisse (Web-Recherche gegen Primärquellen, August 2026):
  Speicherkosten-Band in `calculate.js` (300–470 €/kWh, Marktpreisquelle)
  weicht vom Fraunhofer-ISE-LCOE-Modellinput (400–1.000 €/kWh) ab —
  bewusste Nutzerentscheidung, NICHT geändert (siehe Diskussion in
  Session-Historie). Bei künftiger Änderung: Amortisation-mit-Speicher-
  Regel oben gegenprüfen.

## Session Checklist

- [ ] Design-Regeln oben gegengecheckt (kein Emoji, keine Tailwind-
      Defaults, keine bekannten AI-Tell-Kombinationen)
- [ ] Neue/geänderte Geldbeträge oder Prozentwerte haben Quelle+Stand
- [ ] Neue Artikel: eigene Gliederung, keine Autoren-Byline (aktuell),
      Quellenangaben im Text, endet mit der automatischen CTA-Box
- [ ] Deutsch durchgehend, mobile-first
- [ ] `npm run build` läuft fehlerfrei nach der Änderung
