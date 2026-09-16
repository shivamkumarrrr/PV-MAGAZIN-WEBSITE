# CLAUDE.md — pv-content-hub Projekt-Gedächtnis

Wird von Claude Code am Anfang jeder Session gelesen. Ziel: Arbeit
fortsetzen können ohne das Projekt erneut zu erklären. Für generische
Astro-Workflow-Hinweise (Dev-Server im Hintergrund starten, Doku-Links)
siehe `AGENTS.md` im selben Verzeichnis.

## Befehle

```bash
npm run dev          # Dev-Server, http://localhost:4321
npm run build        # Pflicht vor jedem Abschluss (siehe Session Checklist)
npm run preview      # Produktions-Build lokal ansehen
npx astro dev stop   # Dev-Server beenden (läuft im Hintergrund weiter)
```

**Falle: Der Dev-Server cached Content-Collection-Frontmatter.** Nach einer
Änderung an `.mdx`-Frontmatter (`relatedRechner`, `faq`, `ogImage`) liefert
`npm run dev` weiter die alten Werte, während `npm run build` korrekt ist.
Hat schon zweimal zu Fehlersuche an der falschen Stelle geführt. Bei
verdächtigen Abweichungen gegen den Build gegenprüfen, dann:

```bash
npx astro dev stop && rm -f .astro/data-store.json && npm run dev
```

## Project Overview

PV-Content-Hub: Ratgeber-Artikel + PV-Rechner, eigenständiges Repo (nicht
Teil von `pvrechner`). Vorbild Struktur: solaranlage-ratgeber.de,
co2online.de/modernisieren-und-bauen/photovoltaik. Ziel: SEO-Traffic auf
Artikel-Content, mit durchgehender Verlinkung zum Rechner als
Conversion-Punkt — **die Seite dient Sales/Leadgen**, nicht nur Info.
Sichtbare Marke: **Photovoltaik Aktuell** (Logo `src/assets/pv-aktuell-logo-*.png`,
seit 26.8.2026 aus Claude Design übernommen — vorher trat die Seite direkt
als "PPC GmbH" auf). **PPC GmbH bleibt der rechtliche Betreiber** und steht
weiterhin im Impressum sowie als Kleingedrucktes im Footer ("Ein Produkt
der PPC GmbH") — kein Fantasiename ohne echten Rechtsträger dahinter, nur
ein zusätzlicher Produktname obendrauf. Sprache: Deutsch durchgehend.
Stack: Astro (statisches HTML für Content-Seiten, React-Insel für den
interaktiven Rechner), Deployment-Ziel Vercel.

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
  `relatedRechner` sowie optional `ogImage` und `faq`.
- `src/components/calculator/**` — ursprünglich aus dem
  `pvrechner`-Quellprojekt portiert (Wizard, Steps, ResultScreen,
  UI-Komponenten), inzwischen aber eigenständig weiterentwickelt.
  `pvrechner` (github.com/shivamkumarrrr/pvrechner) bleibt die
  **Genauigkeits-Referenz für den Photovoltaik-Rechner** — vom Nutzer
  gemeinsam mit Patrick bestätigt. Bei Zweifeln an einer Formel dort
  vergleichen. Nicht übernehmen: `theme.js`, das trägt die Markenfarben
  eines anderen Mandanten.
- `src/theme.js` (für die React-Insel) und `src/styles/global.css`
  (CSS-Custom-Properties für Astro-Seiten) müssen dieselben Token-Werte
  tragen — bei Änderung an einem Ort den anderen mitpflegen.
- `src/config.js` — schlanke Konfiguration nur für das, was
  `LeadForm.jsx` tatsächlich liest (`lead.mode`/-keys,
  `contact.calendlyUrl`). Kein volles Mandanten-System wie im
  Quellprojekt — dieser Hub hat genau einen Mandanten (PPC GmbH).
- `src/lib/rechner.js` — **einzige Quelle der Rechner-Liste.** Sowohl die
  Übersichtsseite `/rechner/` als auch der Titel der "Passend dazu"-Box
  (`RechnerCta.astro`) lesen von hier. Neuen Rechner nur hier eintragen,
  nicht in der Seite duplizieren.
- `src/components/lead/LeadForm.jsx` — **gemeinsames Lead-Formular für alle
  11 Rechner** (Einwilligung, Calendly-Zwei-Klick, Versand). Jeder Rechner
  reicht `rechner`, `zusammenfassung` und ein flaches `daten`-Objekt herein;
  die erlaubten Feldnamen stehen in `src/pages/api/lead.ts`
  (`ERLAUBTE_FELDER`). `src/components/calculator/LeadForm.jsx` ist nur noch
  ein dünner Adapter für die PV-Rechner-Felder.
- `src/components/IconsRechner.jsx` — **erzeugte Datei, nicht von Hand
  ändern.** Enthält die elf Rechner-Signets der Übersichtskarten. Quelle ist
  die Figma-Datei "Photovoltaik Aktuell — Rechner-Signets"
  (figma.com/design/IMQ7LVEoRqfStuXZnGyuCF), übernommen mit
  `npm run signets:sync` (braucht `FIGMA_TOKEN`) oder
  `node scripts/signets-sync.mjs --from <verzeichnis>` für lokal exportierte
  SVGs. `npm run signets:check` meldet nur, ob beide Seiten auseinanderlaufen.
  Figma Code Connect wäre der offizielle Weg, verlangt aber einen Dev-/Full-Seat
  auf Organization oder Enterprise — der Account liegt auf Starter.
  Der `<Svg>`-Wrapper und die 28 übrigen Zeichen bleiben in `Icons.jsx`.
- `src/components/calculator/ui/Faltblock.jsx` — gemeinsames, zugeklapptes
  `<details>` "So haben wir das berechnet" für Rechner-Ergebnisse. Ohne
  JavaScript aufklappbar, Text steht trotzdem im HTML. Photovoltaik- und
  Gestehungskosten-Rechner haben je einen eigenen, gewachsenen Block; alle
  anderen nutzen diesen Baustein, wo Zwischenwerte sonst unsichtbar bleiben.
- `src/components/calculator/ui/Energiefluss.jsx` — Flussbild der Jahresbilanz
  (Haus in der Mitte, vier Ströme als Bögen: Erzeugung, Netzbezug, Einspeisung,
  Speicher; Hausverbrauch unter dem Haus). Das **Signature-Element der
  Live-Vorschau** — es hat dort den Autarkie-Ring UND das Monatschart ersetzt,
  weil drei Grafiken in einer 400px-Spalte gegen Design-Regel 11 verstießen.
  Alles steckt in EINEM SVG mit fester viewBox, auch die Beschriftung; dadurch
  skaliert der Text mit und läuft bei 288px Kartenbreite nicht aus seiner Box.
  Farben sind dieselben wie in `MonthlyChart`/`Energiebilanz` (orange = selbst
  erzeugt/genutzt, sky = eingespeist, grau = Netz, navy = Speicher) — eine
  zweite Legende soll niemand lernen müssen. Kein CO2-Arm: kg in einem
  kWh-Flussbild wäre eine andere Größenart, das bleibt der Ergebnisseite.
  Bewusst NICHT auf der Ergebnisseite einsetzen — dort erklärt
  `Energiebilanz.jsx` dieselben Zahlen als Balkenpaar, weil nur dort Autarkie
  und Eigenverbrauchsquote nebeneinander liegen können. Der Kopfkommentar in
  `Energiebilanz.jsx`, der das Haus-Motiv ablehnt, gilt weiterhin — aber nur
  für die Ergebnisseite, nicht für die Live-Vorschau.
- `src/components/Breadcrumb.astro` — Brotkrumen für Rechner-, Kategorie-,
  Artikel- und Methodik-Seiten. Ersetzt dreizehn Einzelfassungen mit
  abweichendem Abstand (10px vs. 16px) und einem Hover, den nur der Artikel
  hatte. Semantisches `<ol>`, Trenner als CSS-`::before` (wird nicht
  vorgelesen), `aria-current="page"` am letzten Glied. Das BreadcrumbList-
  JSON-LD entsteht aus derselben Liste wie die sichtbare Navigation — die
  elf Rechnerseiten hatten vorher gar keins. Nutzung:
  `<Breadcrumb glieder={[{ name: "Rechner", href: "/rechner/" }, { name: "CO₂" }]} />`;
  das Glied ohne `href` ist die aktuelle Seite, "Start" kommt automatisch davor.
- `src/components/ArtikelKarte.astro` — die Ratgeber-Karte, gemeinsam genutzt
  von `/ratgeber/` und den Kategorieseiten (vorher stand das Markup in beiden
  Dateien doppelt). Foto in 16:9 über die volle Kartenbreite, Beschreibung auf
  drei Zeilen gekappt, Fußzeile per `margin-top: auto` unten bündig — die drei
  Regeln sind der Grund, warum die Karten einer Reihe auf gleicher Höhe
  abschließen. `ausrichtung="quer"` legt Bild und Text nebeneinander; das
  nutzt die Übersicht für Kategorien mit nur EINEM Artikel (vier der acht),
  wo eine schmale Karte neben zwei leeren Rasterspalten wie ein Fehler
  aussieht. Bewusst KEIN "Zum Artikel"-Knopf je Karte: siebzehn gleiche
  Knöpfe untereinander sind die Kartenmonotonie aus Design-Regel 7 — die
  Fußzeile trägt stattdessen die Lesezeit als echte Information.
  Vorgeschichte in drei Stufen, damit sie nicht zum vierten Mal umgebaut
  wird: flache Kartenwand ohne Gruppierung → typografische Zeilen mit
  108px-Vorschau (Gruppierung richtig, Fotos unlesbar, Bildoberkanten
  sprangen mit der Titellänge) → Karten MIT Gruppierung. Die Gruppierung nach
  Kategorie bleibt in jedem Fall.
- `src/lib/heroBilder.js` — löst den Frontmatter-Pfad eines Hero-Fotos auf die
  optimierte Datei in `src/assets/heroes/` auf. Damit bleiben Schema und alle
  17 MDX-Dateien unangetastet. Vier Aufrufer: `ArticleHero.astro`,
  `ArtikelKarte.astro`, die Startseite und das Ratgeber-Panel im Header.
- `src/lib/lesedauer.js` — EINE Formel (220 Wörter/Minute) für die Lesezeit
  über dem Artikel und auf der Karte. Zwei Formeln hießen: Übersicht
  verspricht 4 Minuten, Artikel sagt 6.
- `src/pages/methodik/index.astro` + `src/lib/quellen.js` — die Methodik-Seite
  mit jeder Konstante (Wert, Quelle, Begründung, Stand), den Grundlagen
  (PVGIS vs. Bundesdurchschnitt, Autarkie vs. Eigenverbrauchsquote), einem
  Abschnitt **"Was das Modell nicht kann"** und der Quellenliste.
  **Alle Werte werden aus `calculate.js` importiert, nie abgeschrieben** —
  eine abgeschriebene Tabelle veraltet beim ersten Konstanten-Update, und dann
  behauptet ausgerechnet diese Seite etwas Falsches. Was sich nicht
  importieren lässt (Quelle, Stand), steht im Kommentar über der Konstante;
  die Spalten sind dessen Lesefassung. Beim Ändern eines Werts beide Stellen
  ziehen. `quellen.js` ist die einzige Quelle für die Organisationsliste und
  verlinkt bewusst Themen-Landingpages statt Einzelausgaben (Studienreihen
  bekommen jährlich neue URLs). Seit September 2026 ersetzt diese Seite den
  Quellen-Abschnitt der Startseite: Dort stand er als dunkle
  Vollflächen-Platte an zweiter Position, vor allem, wofür Besucher gekommen
  waren. Der Beleg steht jetzt als EINE Zeile neben der Zahl — im
  `RechnerWidget` und in `DetailSection.jsx` —, die vollständige Tabelle hier.
  Verlinkt aus dem Footer.
- `src/components/ArticleFaq.astro` + `VerwandteArtikel.astro` — werden von
  `ArticleLayout.astro` gerendert, nicht einzeln im MDX eingebunden. Der
  "Weiterlesen"-Block zeigt seit September 2026 `ArtikelKarte.astro` mit
  Hero-Foto statt reiner Textzeilen — vorher war das die fünfte
  Darstellungsform für dieselbe Sache. Vier Vorschläge statt drei: Sie stehen
  in einem Zweierraster (die Artikelspalte ist 620px breit, drei Karten darin
  wären 190px schmal), und der vierte ist ein Link mehr im Themencluster. Trägt
  ein FAQ-Eintrag das optionale Feld `gruppe`, gliedert ArticleFaq die
  Fragen in benannte Blöcke; das FAQPage-JSON-LD bleibt trotzdem eine
  flache Liste, weil schema.org keine Gruppen kennt.
- `src/pages/ratgeber/[slug].astro` reicht an `ArticleLayout.astro` neben den
  Frontmatter-Daten zwei abgeleitete Werte durch: die **gerenderten
  `headings`** (aus `render(entry)`) und die **`lesedauer`** (Wörter aus
  `entry.body` ÷ 220). Das Layout rendert daraus die Inhaltsangabe (nur
  h2/h3, nur wenn mehr als eine Überschrift), die Lesezeit-Meta, den
  Kategorie-Hero und die optionale "Zusammenfassung"-Box
  (`zusammenfassung` im Frontmatter). Diese Bausteine gehören NICHT in den
  MDX-Fließtext.
- `src/components/ArticleHero.astro` — Hero am Artikelanfang, von
  ArticleLayout automatisch gerendert, kein Eingriff im MDX nötig. Zwei
  Varianten: Liegt `heroImage` im Frontmatter, zeigt der Hero das Foto;
  ohne Angabe greift als Fallback das datengetriebene SVG-Motiv mit EINER
  belegten Kennzahl je Kategorie (Quelle + Stand direkt in der Datei) —
  die Kennzahlen sind bei der jährlichen Datenpflege mitzuziehen. Seit
  September 2026 haben alle 17 Artikel ein Foto, das SVG ist damit nur
  noch der Pfad für neue Artikel ohne Bild.
- `src/components/Definition.astro` — Fachbegriff-Einblendung im Fließtext:
  sichtbares Wort, Erklärung als Hover/Focus-Popover, reines CSS ohne
  JavaScript. Nutzung im MDX: `<Definition begriff="kWp">Erklärung…
  </Definition>` (Komponente muss importiert werden).
- `src/components/Diagramm.astro` — kleiner Balkenvergleich als Inline-SVG
  für den Fließtext (Kostenanteile, Vergütungsverlauf). Werte und Quelle
  kommen als Props aus dem MDX, kein Chart-Paket, kein JavaScript.
- `src/components/RechnerWidget.jsx` — kompakter Mini-Rechner für den
  Artikeltext. Nutzt `calculate.js`-Konstanten, `Slider`/`Segmented` aus
  `calculator/ui` und `theme.js`. Einbindung im MDX mit
  `<RechnerWidget client:load />`. Bewusst OHNE PVGIS/Standort — nur erste
  Größenordnung mit Bundesdurchschnitt, damit der ausführliche Rechner
  (`/rechner/photovoltaik/`) der Mehrwert bleibt.

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
Oberflächen-Font: 'Archivo' (Navigation, Rechner, Headlines, Zahlen)
Lese-Font:     'Source Serif 4' (nur Artikel-Fließtext)
```

Beide Schriften selbst gehostet (`public/fonts/`), nie über
fonts.googleapis.com. Space Grotesk stand hier bis zum Typografie-Umbau,
kam aber aus einem früheren Claude-Designdokument und nicht aus einem
Markenhandbuch — Begründung der Ablösung steht im Kopfkommentar von
`src/styles/global.css`.

Logo: `src/assets/pv-aktuell-logo-light.png` (transparent, dunkle Wortmarke
— für die Navbar auf hellem Grund) und `pv-aktuell-logo-dark.png`
(opakes dunkles Card-Badge, für dunkle Flächen reserviert, aktuell nicht
im Einsatz). In Navbar (`Header.astro`) läuft die transparente Version;
der Footer zeigt nur Text ("Photovoltaik Aktuell" + "Ein Produkt der PPC
GmbH" als Kleingedrucktes), kein Logo-Bild.

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

### Hintergrund: Raster statt Verlauf

Die Seite hat EINE Hintergrundtextur, und nur an einer Stelle: ein feines
Millimeterpapier-Raster hinter dem Hero-Band der Startseite (`.hero` in
`src/pages/index.astro`). Ein Farbwert bei 3,5% Deckkraft, 32px Teilung,
harte Farbstopps — das rendert als 1px-Linie, nicht als Verlauf.

Zwei Dinge daran sind Absicht und sollen so bleiben:

1. **Der Ursprung liegt auf der linken Textkante**, nicht in der Seitenmitte
   (`background-position: calc(50% - 570px)` ab 1180px, darunter `20px`).
   Dadurch fällt eine Rasterlinie exakt auf die Kante, an der Überschrift,
   Eingabefeld und jeder andere Abschnitt beginnen. Ein frei laufendes Raster
   wäre Dekoration; eines, das am Satzspiegel einrastet, gehört zum Layout.
   Geprüft bei 1440/1280/1180/900/360px — Linie und Textkante liegen überall
   auf demselben Wert.
2. **Nur das Hero-Band.** Über die ganze Seite gezogen wird aus Struktur ein
   Muster.

Was hier NICHT hingehört, auch wenn "schönerer Hintergrund" gewünscht wird:
Farbverläufe, Mesh-Flächen, weichgezeichnete Farbflecken, Aurora-Effekte.
Das ist das bekannteste Erkennungsmerkmal generierter Landingpages und
verstößt gegen die Regeln 2 und 5. Die Seite argumentiert mit belegten Zahlen
und soll wie ein Messprotokoll aussehen — ein technisches Raster sagt genau
das, ein Verlauf sagt das Gegenteil.

Bei jedem Vorschlag gegenprüfen: "Sieht das aus wie jede zweite
AI-generierte SaaS-Landingpage gerade?" Wenn ja, überarbeiten.

### Eine linke Kante für alle Seiten

Seit September 2026 beginnt auf JEDER Seite alles an derselben linken Kante:
Kopf, Brotkrume, Überschrift, Inhalt. Vorher liefen drei Raster nebeneinander
— Seitenköpfe in der zentrierten `.prose`-Spalte (Kante 410px bei 1440px
Breite), Inhalte im `.container` (150px), die Methodik-Tabellen in einem
eigenen 920px-Block (280px). Auf einer Seite sah das aus wie ein Fehler, über
mehrere Seiten wie Zufall.

Regel für neue Seiten: Der Seitenkopf gehört in einen `.container`, nicht in
`.prose`. Die Lesebreite setzt man am Textelement (`max-width: 68ch` am `<p>`),
nicht am Abschnitt. Und Abstände am Kopf immer als `padding-block` — die
`padding`-Kurzform setzt die seitlichen 20px des Containers auf 0, und der
Kopf steht 20px links vom Rest (zweimal passiert, einmal auf der
Kategorieseite, einmal auf den Rechnerseiten).

### Rechner-CTA-Platzierung: inline, nicht Sidebar

Stand der CTAs außerhalb der Artikel (September 2026): Die Ratgeber-Übersicht,
die acht Kategorieseiten und `/methodik/` hatten keinen einzigen Weg zum
Rechner — siebzehn Artikel mit CTA, aber die Seiten, die sie auflisten,
endeten im Nichts. Alle drei tragen jetzt dieselbe Abschluss-Box
(`RechnerCta variant="final"`), damit niemand eine zweite Form lernen muss.
Die Startseite endet mit einem eigenen Abschluss-Block (`.abschluss`): zwei
verschiedene nächste Schritte (rechnen / erst lesen) auf hellem Grund mit
1px-Rand. Bewusst KEIN vollflächig oranges Band mit demselben Link wie oben —
genau das stand dort bis August 2026 und ist als Generierungs-Tell entfernt
worden.

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
- Jede Konstante in `calculate.js` trägt Quelle, Stand und Prüf-Rhythmus
  als Kommentar direkt darüber (Strompreis, Einspeisevergütung,
  Systemkosten, CO2-Faktor). Diese Kommentare sind die Dokumentation —
  beim Ändern eines Werts den Kommentar mitziehen, sonst ist die Quelle
  verloren. Seit September 2026 sind diese Kommentare zusätzlich
  die Grundlage der öffentlichen Methodik-Seite (`/methodik/`), die die Werte
  live aus `calculate.js` importiert. Ändert sich ein Wert, ändert sich die
  Seite mit; Quelle und Stand stehen nur im Kommentar und müssen dort
  nachgezogen werden.
- Autarkiegrad vs. Eigenverbrauchsquote nicht verwechseln (siehe Kommentar
  in `calculate.js` und Artikel "Wie funktioniert eine Photovoltaikanlage").
- Alle abgeleiteten Rechner importieren aus `calculate.js`, statt Werte zu
  duplizieren. Duplikate sind schon zweimal auseinandergelaufen
  (`M2_PRO_KWP_REINIGUNG`, die Verbrauchs-Anzeigewerte im Kombi-Rechner).
- Randfälle abfangen: Verbrauch 0, Ersparnis 0, Speicher 0. Diese Pfade
  lieferten `NaN`, `Infinity` und `null` bis in die Anzeige.
- Die vier harten Invarianten stehen weiter unten in einem eigenen
  Abschnitt.

## Verbot: erfundene Aussagen über das Unternehmen

Kein erfundener Beleg, keine erfundene Identität — § 5 UWG bzw. § 5 TMG.
Betrifft in diesem Projekt konkret:

- **Testimonials, Bewertungen, Kundennamen.** Gleiche Regel wie im
  `pvrechner`-Quellprojekt.
- **Leistungsversprechen.** Auf der Seite standen "Fachbetrieb aus unserem
  bundesweiten Partnernetzwerk", "in {Stadt} und Umgebung" und "Antwort
  innerhalb von 24 Stunden". Ein solches Netzwerk existiert laut PPC nicht;
  die Aussagen sind entfernt. Nichts zusagen, was nicht bestätigt ist.
- **Firmendaten.** Im Impressum standen `Musterstraße 1`, `HRB 12345`,
  `DE123456789`, `Max Mustermann`. Statt Beispieldaten immer
  `[BITTE EINTRAGEN]` mit sichtbarem Warnbanner.
- **Artikel-Autoren.** Läuft bewusst ohne Byline (Nutzerentscheidung); im
  Article-Schema steht die Organisation als `author`. Falls später Autoren
  ergänzt werden: nur echte Namen und Rollen.
- **Marke.** **Photovoltaik Aktuell** ist der sichtbare Produktname,
  **PPC GmbH** der im Impressum genannte Rechtsträger. Kein Zwischenname
  ohne echten Betreiber dahinter.

## Content-Regeln für Artikel

- Eigene Gliederung pro Artikel, keine Struktur von ADAC/co2online/
  solaranlage-ratgeber.de/Envion nachbauen.
- Fakten/Zahlen mit Quellenangabe im Fließtext (nicht nur im Kommentar wie
  in `calculate.js` — hier ist der Leser das Publikum).
- PPCs eigene Rechner-Methodik als Content-Differenzierung nutzen, wo es
  passt (siehe `ausrichtung-und-neigung-realistischer-ertrag.mdx` als
  Beispiel: erklärt explizit, wie der eigene Rechner PVGIS nutzt).
- Jeder Artikel endet mit der automatischen "Passend dazu"-CTA-Box und dem
  "Weiterlesen"-Block (beide aus `ArticleLayout.astro`) — nicht im MDX
  duplizieren. Der CTA-Titel wird aus `relatedRechner` abgeleitet, also
  `relatedRechner` immer auf den thematisch passenden Rechner setzen.
- **FAQ: höchstens 8–9 Fragen je Artikel** (Nutzervorgabe). Darüber wirkt
  der Block wie Füllmaterial und verwässert die FAQPage-Strukturdaten. Was
  mehr wert ist, gehört als `##`-Abschnitt in den Fließtext.
- FAQ-Antworten müssen inhaltlich im Artikeltext gedeckt sein — der
  sichtbare Block und das JSON-LD kommen aus derselben `faq:`-Quelle im
  Frontmatter, weil Google Übereinstimmung verlangt.
- Kontextuelle Links auf andere Artikel im Fließtext setzen. Bis September
  2026 enthielt kein einziger Artikel einen Link auf einen anderen — jede
  Seite war eine Sackgasse. Inzwischen hat jeder Artikel mindestens einen
  ausgehenden Link, Struktur Hub-and-Spoke: "Wie funktioniert eine
  Photovoltaikanlage" (Grundlagen) und "Kosten & Förderung" sind die Hubs.
  Bei einem neuen Artikel beide Richtungen setzen — Link vom neuen Artikel
  zum Hub UND mindestens ein Link aus einem thematisch passenden Bestands-
  artikel auf den neuen.
- Artikelseiten-Aufbau ist automatisiert: Inhaltsangabe und Lesezeit kommen
  aus den MDX-Headings (`[slug].astro`), der Hero aus
  `ArticleHero.astro` (Foto über `heroImage`/`heroImageAlt` im
  Frontmatter, sonst SVG-Fallback). Diese drei NICHT von Hand im MDX
  nachbauen; die
  "Zusammenfassung"-Box ist optional über das Frontmatter-Feld
  `zusammenfassung: [Liste kurzer Kernsätze]` aktivierbar. Tabellen und
  Musterrechnungen gehören wie gehabt in den Fließtext — Vorbild ist der
  Ausbau von `pv-kosten-und-foerderung-ueberblick.mdx`.

## Stand der Rechner

Alle **11 Rechner sind live** — es gibt keine "Phase 2" und keine
"bald verfügbar"-Karten mehr (der Status-Schalter auf `/rechner/` wurde
entfernt, weil ihn kein Eintrag mehr nutzte). Liste und Reihenfolge stehen
in `src/lib/rechner.js`.

Eigene Modelle mit eigener Methodik, jeweils in `src/lib/calculate<Name>.js`
plus `src/components/<name>/**`:

- **photovoltaik** — Hauptrechner, einziger mit PVGIS-Standortdaten und
  Karte. Alle anderen leiten ihre Konstanten aus `calculate.js` ab.
- **gestehungskosten** — vereinfachte, undiskontierte LCOE-Rechnung.
  Methodik-Hinweis im Begleitartikel.
- **balkonkraftwerk** — 800-W-Deckelung nach Solarpaket I. Eigenverbrauchs-
  anteil (85 %) ist eine dokumentierte eigene Annahme, keine externe Quelle.
- **speicher** — Mehr-Eigenverbrauch kommt aus `autarkieSchaetzung()`, nicht
  aus einer eigenen Faustregel (siehe Invarianten unten).
- **mieterstrom** — Amortisation auf Deckungsbeitrag. `betriebskostenProWeJahr`
  ist bewusst mit 0 vorbelegt: Für die laufenden Kosten (Messwesen,
  Abrechnung) liegt keine belastbare Quelle vor, und ein geschätzter Betrag
  würde die zentrale Kennzahl unbelegt verschieben.
- **rendite, kombi, co2, reinigung, eauto, steuer** — jeweils eigene
  Fragestellung, gemeinsame Konstanten.

## Rechner-Bedienung

**Im Rechner ist nichts vorausgewählt** (Nutzervorgabe, September 2026) —
im großen Wizard UND im Mini-Rechner (`RechnerWidget.jsx`, dort `haushalt`
und `speicher` auf `null`, Ergebnisblock erst ab `bereit`). Bis
dahin standen Satteldach, Süd, mittlere Neigung, 4 Personen und "kein E-Auto"
orange markiert da, bevor der Besucher etwas angeklickt hatte — er hält das
leicht für seine eigene Angabe, und die Live-Vorschau zeigte eine fertige
Ersparnis für ein Haus, das niemand beschrieben hat.

Folgen, die beim Ändern mitgedacht werden müssen:

- `dachform`, `ausrichtung`, `neigung`, `haushalt`, `eauto`, `waermepumpe`
  starten auf `null`, `verbrauch` auf 0. `calculate()` verträgt das (geprüft:
  kein NaN, kein Infinity) — `AUSRICHTUNG.find(...)?.factor || 1` und die
  Verbrauch-0-Pfade fangen es ab.
- **Ausnahme Schieberegler:** Die Dachfläche startet bei 60 m². Ein Regler
  ohne Wert hat keine Position. Er zählt deshalb NICHT als getroffene
  Entscheidung.
- `angabenVollstaendig` (Wizard.jsx) = Dachform gewählt UND Verbrauch > 0.
  Erst dann zeigen Live-Vorschau und mobile Leiste Zahlen, vorher "Noch keine
  Angaben". Ohne dieses Gate griffe `computeKwp()` auf den Mittelwert 0.7
  zurück und lieferte plausible 8,9 kWp für eine leere Eingabe.
- Die Kontextleiste zeigt "–" statt eines Werts, solange die zugehörige
  Angabe fehlt.

Auto-Advance trägt den Ablauf weiterhin: Karten-Screens gehen erst nach einer
Auswahl weiter, der übergeordnete "Weiter"-Knopf erscheint erst am Ende eines
Sub-Flows. Ein Überspringen ohne Entscheidung ist damit nicht möglich.

## Icon-Strichstärke

`Icons.jsx` setzt zentral `strokeWidth: 1.9` (vorher 1.6) — bei 18–24px
Anzeigegröße wirkten die Zeichen sonst blass, besonders in der grauen
Sekundärfarbe. Der Wert gilt über den `<Svg>`-Wrapper AUCH für die elf
Rechner-Signets in `IconsRechner.jsx`; die generierte Datei selbst trägt keine
Strichangaben und bleibt unangetastet. Ab etwa 2.2 kippt die Optik ins Fette
und die Innenräume kleiner Zeichen (Stecker, Batterie) laufen zu.

## Invarianten (bei jeder Änderung gegenprüfen)

Diese vier sind schon einmal gebrochen worden und haben je einen echten
Fehler erzeugt:

1. **Kein Drittanbieter-Request beim Seitenaufruf.** Schriften (`public/fonts/`)
   und Leaflet (`node_modules`, dynamischer Import) werden selbst
   ausgeliefert. Nominatim wird ausschließlich aufgerufen, wenn der Nutzer
   das optionale Straßenfeld ausfüllt (`src/lib/geocode.js`); die PLZ löst
   `src/lib/plz.js` lokal aus einer statischen Tabelle auf. Google Fonts,
   unpkg und ein Nominatim-Aufruf je Tastendruck haben zuvor ungefragt
   Besucher-IPs an Dritte übertragen. Gegenprobe: Netzwerk-Tab öffnen —
   außer PVGIS über die eigene API-Route und den Kartenkacheln darf nichts
   Externes erscheinen.
2. **Einspeisevergütung immer über `einspeiseStaffel(kwp)`**, nie `EINSPEISE`
   direkt. Der ≤10-kWp-Satz auf jede Anlagengröße anzuwenden überschätzte
   die Einspeiseerlöse bei 30 kWp um rund 9 %.
3. **Speicher darf die Amortisation nie verkürzen.** Wird derzeit verletzt,
   die frühere Notiz ("0,1 Jahre bei 2–3 kWh") war zu eng gefasst. Gemessen
   (Sweep über Dachfläche 20–160 m², Verbrauch 1.500–15.000 kWh, Speicher
   1–20 kWh, Sept. 2026): 79 Fälle, in denen der Speicher die Amortisation
   verkürzt, maximal um **0,6 Jahre**. Schwerpunkt sind überdimensionierte
   Anlagen — 55 der 79 Fälle liegen bei Ertrag ≥ 2× Jahresverbrauch; bei
   realistischer Auslegung (< 2×) bleibt die Abweichung ≤ 0,2 Jahre.
   Identisch im `pvrechner`-Quellprojekt reproduzierbar, also kein Fehler
   dieses Repos, sondern eine Eigenschaft des gemeinsamen Modells. Ursache
   sind zwei belegte Werte (ADAC-Autarkiekurve, 400 €/kWh) — ohne neue
   Recherche nicht anfassen. Beim Ändern eines der beiden Werte diesen
   Sweep erneut fahren und die Zahlen hier mitziehen.
4. **Speicher- und Hauptrechner müssen denselben Mehr-Eigenverbrauch
   liefern.** Beide leiten ihn aus `autarkieSchaetzung()` ab. Eine eigene
   lineare Faustregel im Speicher-Rechner wich bei 10 kWh um Faktor 1,57 ab.
   Seit dem Flussbild betrifft das einen dritten Aufrufer: `calculate()` gibt
   `speicherBeitrag` zurück (der Teil des Eigenverbrauchs, den es ohne Speicher
   nicht gäbe) und bildet ihn ebenfalls als Differenz zweier
   `autarkieSchaetzung()`-Aufrufe. Gemessen (Sweep über Dachfläche 20–160 m²,
   Verbrauch 1.500–15.000 kWh, Speicher 1–20 kWh, Sept. 2026): 216 Fälle,
   maximale Abweichung zu `calculateSpeicher()` **1 kWh** — reine Rundung.

Prüfskript-Muster für alle vier: Node gegen `src/lib/*.js` laufen lassen und
die Werte vergleichen, nicht nur den Code lesen.

## Was noch offen ist (vor Livegang)

- ~~`src/pages/impressum/` und `src/pages/datenschutz/`~~ — erledigt: Beide
  tragen seit dem 08.09.2026 die echten Angaben der PPC GmbH (vom Betreiber
  geliefert). Der Absatz hier stand noch auf dem alten
  `[BITTE EINTRAGEN]`-Stand und war damit falsch. Weiterhin gilt: nie
  Musterdaten einsetzen, im Zweifel Platzhalter mit sichtbarem Warnbanner.
- `LEAD_WEBHOOK_URL` (Vercel-Env) ist nicht gesetzt. Solange sie fehlt,
  landen Leads nur im Funktions-Log (`pv-lead`), niemand wird benachrichtigt.
- ~~`public/og-default.png` und Favicon~~ — erledigt: beide aus der
  Logo-Bildmarke erzeugt (`favicon.svg` als Vektor-Nachbau der vier
  Modulfelder, `favicon.ico` dieselbe Marke gerastert, `og-default.png`
  1200×630 mit Logo, Archivo-Headline und Akzentlinie).
  `OG_STANDARD_VORHANDEN` steht auf `true`.
  Achtung bei künftigen Marken-Arbeiten: Die Bildmarke im Logo trägt Gold
  (#D4950A), nicht das Akzent-Token #FF5200 der Oberfläche. Der Satz weiter
  oben, #FF5200 stamme aus dem Logo-File, stimmt so nicht — im PNG kommt
  dieser Wert nicht vor.
- Bilder: Hero-Fotos für alle 17 Artikel liegen seit September 2026 in
  `src/assets/heroes/` (vorher `public/images/heroes/` — verschoben, damit
  `astro:assets` sie in WebP wandelt und mehrere Breiten erzeugt; als
  108px-Vorschau fiel das nicht auf, seit die Ratgeber-Karten sie groß
  zeigen, wären es gut 4 MB Rohdaten je Seitenaufruf). Der Pfad im
  Frontmatter bleibt die alte Schreibweise; `src/lib/heroBilder.js` löst ihn
  über den Dateinamen auf. Quelle ist Pexels (Lizenz erlaubt kommerzielle
  Nutzung ohne Namensnennung); Fotograf, Pexels-ID und Fundstelle je Datei
  stehen in `src/assets/heroes/BILDNACHWEIS.md` — bei neuen Bildern dort mit
  eintragen, sonst ist die Lizenzlage nicht belegbar. **Offen:** `einspeiseverguetung.jpg` ist ein Bestandsbild ohne
  dokumentierte Herkunft und muss vor Livegang ersetzt oder belegt werden.
  Echte Reportage-Bilder aus der Firmen-NAS-Quelle stehen weiter aus.
- Artikel-Umfang Ø ~630 Wörter gegen 1.500–3.000 beim Wettbewerb
  (ADAC, Verbraucherzentrale, co2online). Ausbau wartet auf die
  Themen-Priorisierung durch PPC.
- Recherche-Ergebnis (August 2026): Speicherkosten-Band in `calculate.js`
  (300–470 €/kWh, Marktpreisquelle) weicht vom Fraunhofer-ISE-LCOE-
  Modellinput (400–1.000 €/kWh) ab — bewusste Nutzerentscheidung, NICHT
  geändert. Bei künftiger Änderung Invariante 3 gegenprüfen.

## Session Checklist

- [ ] Design-Regeln oben gegengecheckt (kein Emoji, keine Tailwind-
      Defaults, keine bekannten AI-Tell-Kombinationen)
- [ ] Neue/geänderte Geldbeträge oder Prozentwerte haben Quelle+Stand
- [ ] Neue Artikel: eigene Gliederung, keine Autoren-Byline (aktuell),
      Quellenangaben im Text, max. 8–9 FAQ-Fragen, Links auf andere Artikel
- [ ] Deutsch durchgehend, mobile-first
- [ ] `npm run build` läuft fehlerfrei nach der Änderung
- [ ] Bei Änderungen an Rechen-Logik: die vier Invarianten oben **numerisch**
      geprüft, nicht nur den Code gelesen
- [ ] Bei UI-Änderungen: einmal live im Browser durchgeklickt, Konsole leer,
      Netzwerk-Tab ohne fremde Hosts, 360 px ohne horizontales Scrollen
- [ ] Bei Frontmatter-Änderungen: gegen den **Build** geprüft, nicht gegen
      den Dev-Server (siehe Cache-Falle unter Befehle)
