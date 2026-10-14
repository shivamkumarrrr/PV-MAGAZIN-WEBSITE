// Lebendiges Raster hinter dem Hero-Band der Startseite.
//
// Gleiche Teilung (32px) und gleicher Ursprung wie das CSS-Raster in
// index.astro: Die Punkte sitzen auf den Linienkreuzungen, also auf dem
// Satzspiegel. Zwei Bewegungen, beide aus Sonne und Messprotokoll abgeleitet,
// nicht frei erfunden:
//  1. Zwei Lichtbänder wandern dauernd diagonal über das Feld (Sonnenstand),
//     die Punkte darunter leuchten grün auf; dazu atmet jeder Punkt leise.
//  2. Der Zeiger streut Gold: Punkte in Reichweite wachsen, färben sich zur
//     Sonnenfarbe und weichen minimal aus.
// Kein Verlauf, kein Weichzeichner — nur Punkte in Markenfarben. Farben =
// Token aus global.css (Accent #0B7A62, Sun #D4950A). Ohne JavaScript bleibt
// das CSS-Raster stehen; bei "Bewegung reduzieren" wird einmal gezeichnet.

const TEILUNG = 32;
const REICHWEITE = 150; // px um den Zeiger
const GRUEN = [11, 122, 98];
const GOLD = [212, 149, 10];
const TINTE = [20, 27, 34];

const mische = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

// Optionen: `kante()` liefert die linke Textkante in px relativ zum Feld (sonst
// wie auf der Startseite), `linien` zeichnet die Rasterlinien mit, `staerke`
// dämpft Lichtbänder und Zeiger (1 = Startseite).
export function starteHeroPunkte(hero, leinwand, optionen = {}) {
  const { kante: kanteFn, linien = false, staerke = 1 } = optionen;
  const ctx = leinwand.getContext("2d");
  if (!ctx) return;

  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let breite = 0;
  let hoehe = 0;
  let x0 = 0;
  let zeiger = { x: -9999, y: -9999, staerke: 0, ziel: 0 };
  let laeuft = false;
  let sichtbar = true;
  let rahmen = 0;

  function messen() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    breite = hero.clientWidth;
    hoehe = hero.clientHeight;
    leinwand.width = Math.round(breite * dpr);
    leinwand.height = Math.round(hoehe * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Wie im CSS: ab 1180px liegt die Textkante bei 50% - 570px, darunter bei 20px.
    const kante = kanteFn ? kanteFn() : breite >= 1180 ? breite / 2 - 570 : 20;
    x0 = ((kante % TEILUNG) + TEILUNG) % TEILUNG;
    zeichne(performance.now());
  }

  function zeichne(zeit) {
    ctx.clearRect(0, 0, breite, hoehe);
    if (linien) {
      ctx.fillStyle = "rgba(20,27,34,0.035)";
      for (let x = x0; x <= breite; x += TEILUNG) ctx.fillRect(x, 0, 1, hoehe);
      for (let y = 0; y <= hoehe; y += TEILUNG) ctx.fillRect(0, y, breite, 1);
    }
    const t = ruhig ? 0 : zeit / 1000;

    // Zwei Lichtbänder, dauernd unterwegs: je 8s über die Diagonale, um die
    // halbe Laufzeit versetzt — es ist immer eins im Bild, keine Pause.
    const diagonale = breite + hoehe;
    const lauf = diagonale + 400;
    const bandA = -200 + ((t / 8) % 1) * lauf;
    const bandB = -200 + (((t / 8) + 0.5) % 1) * lauf;

    zeiger.staerke += (zeiger.ziel - zeiger.staerke) * 0.12;

    for (let x = x0; x <= breite + TEILUNG; x += TEILUNG) {
      for (let y = 0; y <= hoehe + TEILUNG; y += TEILUNG) {
        let px = x;
        let py = y;
        let radius = 1.1;
        let farbe = TINTE;
        let alpha = 0.2;

        // Dauerndes leises Funkeln: jeder Punkt atmet mit eigener Phase.
        if (!ruhig) {
          const atem = 0.5 + 0.5 * Math.sin(t * 1.6 + x * 0.045 + y * 0.07);
          alpha += atem * 0.12;
          radius += atem * 0.35;
        }

        // Lichtbänder (diagonal, aus Punkten gebaut)
        const abstandBand = Math.min(Math.abs(x + y - bandA), Math.abs(x + y - bandB));
        if (abstandBand < 170) {
          const k = 1 - abstandBand / 170;
          const welle = k * k;
          farbe = mische(TINTE, GRUEN, Math.min(1, welle * 1.5));
          alpha += welle * 0.65 * staerke;
          radius += welle * 2 * staerke;
        }

        // Zeiger
        if (zeiger.staerke > 0.01) {
          const dx = x - zeiger.x;
          const dy = y - zeiger.y;
          const d = Math.hypot(dx, dy);
          if (d < REICHWEITE) {
            const k = (1 - d / REICHWEITE) * zeiger.staerke;
            const e = k * k * (3 - 2 * k);
            farbe = mische(farbe, GOLD, Math.min(1, e * 1.3));
            alpha = Math.min(0.8, alpha + e * 0.55 * staerke);
            radius += e * 2 * staerke;
            // Ausweichen: bis zu 6px vom Zeiger weg.
            if (d > 0.1) {
              px += (dx / d) * e * 6;
              py += (dy / d) * e * 6;
            }
          }
        }

        ctx.fillStyle = `rgba(${farbe[0] | 0},${farbe[1] | 0},${farbe[2] | 0},${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function schleife(zeit) {
    if (!laeuft) return;
    zeichne(zeit);
    rahmen = requestAnimationFrame(schleife);
  }

  function an() {
    if (laeuft || ruhig || !sichtbar || document.hidden) return;
    laeuft = true;
    rahmen = requestAnimationFrame(schleife);
  }

  function aus() {
    laeuft = false;
    cancelAnimationFrame(rahmen);
  }

  messen();
  new ResizeObserver(messen).observe(hero);

  if (ruhig) return;

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    zeiger.x = e.clientX - r.left;
    zeiger.y = e.clientY - r.top;
    zeiger.ziel = 1;
  });
  hero.addEventListener("pointerleave", () => {
    zeiger.ziel = 0;
  });

  new IntersectionObserver(([eintrag]) => {
    sichtbar = eintrag.isIntersecting;
    sichtbar ? an() : aus();
  }).observe(hero);
  document.addEventListener("visibilitychange", () =>
    document.hidden ? aus() : an(),
  );

  an();
}
