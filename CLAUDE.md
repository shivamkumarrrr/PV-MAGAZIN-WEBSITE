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
- `src/components/ArticleFaq.astro` + `VerwandteArtikel.astro` — werden von
  `ArticleLayout.astro` gerendert, nicht einzeln im MDX eingebunden.

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
- Jede Konstante in `calculate.js` trägt Quelle, Stand und Prüf-Rhythmus
  als Kommentar direkt darüber (Strompreis, Einspeisevergütung,
  Systemkosten, CO2-Faktor). Diese Kommentare sind die Dokumentation —
  beim Ändern eines Werts den Kommentar mitziehen, sonst ist die Quelle
  verloren.
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
- Kontextuelle Links auf andere Artikel im Fließtext setzen. Vor September
  2026 enthielt kein einziger Artikel einen Link auf einen anderen — jede
  Seite war eine Sackgasse.

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
3. **Speicher darf die Amortisation nie verkürzen.** Bekannte Restabweichung:
   bei 2–3 kWh sinkt sie um 0,1 Jahre (7,8 → 7,7). Ursache sind zwei belegte
   Werte (ADAC-Autarkiekurve, 400 €/kWh) — ohne neue Recherche nicht
   anfassen.
4. **Speicher- und Hauptrechner müssen denselben Mehr-Eigenverbrauch
   liefern.** Beide leiten ihn aus `autarkieSchaetzung()` ab. Eine eigene
   lineare Faustregel im Speicher-Rechner wich bei 10 kWh um Faktor 1,57 ab.

Prüfskript-Muster für alle vier: Node gegen `src/lib/*.js` laufen lassen und
die Werte vergleichen, nicht nur den Code lesen.

## Was noch offen ist (vor Livegang)

- `src/pages/impressum/` und `src/pages/datenschutz/`: Pflichtangaben stehen
  auf `[BITTE EINTRAGEN]` mit sichtbarem Warnbanner. **Die Seite darf so
  nicht öffentlich gehen** (§ 5 TMG). Vorher standen dort erfundene
  Musterdaten — nicht wieder einfügen, auch nicht als Beispiel.
- `LEAD_WEBHOOK_URL` (Vercel-Env) ist nicht gesetzt. Solange sie fehlt,
  landen Leads nur im Funktions-Log (`pv-lead`), niemand wird benachrichtigt.
- `public/og-default.png` (1200×630) fehlt. Bis dahin gibt
  `BaseLayout.astro` bewusst **kein** `og:image` aus — Schalter
  `OG_STANDARD_VORHANDEN` umlegen, sobald die Datei da ist.
- `public/favicon.svg` ist noch das Astro-Standardlogo.
- Keine Bilder im gesamten Projekt außer dem Logo. Artikel und Startseite
  brauchen welche; Quelle ist voraussichtlich der Firmen-NAS.
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
