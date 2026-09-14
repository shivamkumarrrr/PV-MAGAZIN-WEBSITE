// Hand-drawn line-icon set, replacing emoji throughout the app. Same visual
// language as the Dachform illustrations: thin rounded strokes, currentColor.
const base = { fill: "none", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

function Svg({ size = 20, children, label }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke="currentColor" {...base} role="img" aria-label={label} aria-hidden={label ? undefined : true}>
      {children}
    </svg>
  );
}

export function IconMapPin(props) {
  return <Svg {...props}><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.4" /></Svg>;
}

export function IconSatellite(props) {
  return <Svg {...props}><rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)" /><path d="M7 7 4 4M17 7l3-3M3 12h2M19 12h2" /><path d="M13.5 10.5 20 4" /></Svg>;
}

export function IconLock(props) {
  return <Svg {...props}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>;
}

export function IconHouse(props) {
  return <Svg {...props}><path d="M4 11 12 4l8 7" /><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" /><path d="M10 20v-5h4v5" /></Svg>;
}

export function IconMail(props) {
  return <Svg {...props}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4 7l8 6 8-6" /></Svg>;
}

export function IconCalendar(props) {
  return <Svg {...props}><rect x="4" y="5.5" width="16" height="15" rx="2" /><path d="M4 10h16M8 3.5v3M16 3.5v3" /></Svg>;
}

export function IconLoader(props) {
  return (
    <svg width={props.size ?? 20} height={props.size ?? 20} viewBox="0 0 24 24" role="img" aria-label="Lädt">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" opacity="0.25" fill="none" />
      <path d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export function IconChart(props) {
  return <Svg {...props}><path d="M4 20V9M10 20V4M16 20v-7M22 20H2" /></Svg>;
}

export function IconMap(props) {
  return <Svg {...props}><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" /><path d="M9 4v14M15 6v14" /></Svg>;
}

export function IconBattery(props) {
  return <Svg {...props}><rect x="3" y="8" width="16" height="9" rx="2" /><path d="M21 11v3" /><path d="M9 12.5h2l-1.2 2.5 3.2-3-2-.1 1.2-2.4Z" fill="currentColor" stroke="none" /></Svg>;
}

export function IconBolt(props) {
  return <Svg {...props}><path d="M13 3 6 13h5l-1 8 8-11h-5l1-7Z" /></Svg>;
}

export function IconCheck(props) {
  return <Svg {...props}><path d="M4.5 12.5 9 17l10.5-11" /></Svg>;
}

export function IconStar({ filled, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8Z"
        fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTrendingUp(props) {
  return <Svg {...props}><path d="M3 17 10 10l4 4 7-8" /><path d="M15 6h6v6" /></Svg>;
}

export function IconLeaf(props) {
  return <Svg {...props}><path d="M5 19c8-1 13-6 14-14-8 1-13 6-14 14Z" /><path d="M5 19c1.5-3.5 4-6 9-8.5" /></Svg>;
}

export function IconPlug(props) {
  return <Svg {...props}><path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0V8Z" /><path d="M12 17v4" /></Svg>;
}

export function IconRuler(props) {
  return <Svg {...props}><path d="m4 15 5-11 11 5-5 11z" /><path d="m8.5 8.5 1.5 1.5M10.5 6l1.5 1.5M13.5 12.5l1.5 1.5M11.5 15l1.5 1.5" /></Svg>;
}

export function IconDocumentCheck(props) {
  return <Svg {...props}><path d="M6 2.5h8l4 4V21H6Z" /><path d="M14 2.5v4h4" /><path d="m9.5 13 2.2 2.2 4-4.4" /></Svg>;
}

export function IconWrench(props) {
  return <Svg {...props}><path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-3-3-1.9 1.9Z" /></Svg>;
}

export function IconContact(props) {
  return <Svg {...props}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c1-3.5 3.8-5.5 6.5-5.5s5.5 2 6.5 5.5" /></Svg>;
}

export function IconSearch(props) {
  return <Svg {...props}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.8-4.8" /></Svg>;
}

export function IconSun(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="4.5" />{[0,45,90,135,180,225,270,315].map(a => (
    <line key={a} x1={12 + 6.5*Math.cos(a*Math.PI/180)} y1={12 + 6.5*Math.sin(a*Math.PI/180)} x2={12 + 9.5*Math.cos(a*Math.PI/180)} y2={12 + 9.5*Math.sin(a*Math.PI/180)} />
  ))}</Svg>;
}

export function IconTarget(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></Svg>;
}

export function IconPerson(props) {
  return <Svg {...props}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.1-3.7 3.8-5.6 7-5.6s5.9 1.9 7 5.6" /></Svg>;
}

export function IconCar(props) {
  return <Svg {...props}><path d="M5 16v-1a2.2 2.2 0 0 1 .4-1.2L7.3 11.4A2.5 2.5 0 0 1 9.4 10.5h5.2a2.5 2.5 0 0 1 2.1.9l1.9 2.4a2.2 2.2 0 0 1 .4 1.2v1" /><path d="M6 16.8h.5M17.5 16.8h.5" /><circle cx="8.4" cy="17" r="1.4" /><circle cx="15.6" cy="17" r="1.4" /></Svg>;
}

export function IconHeatpump(props) {
  return <Svg {...props}><rect x="5" y="7" width="14" height="10" rx="2" /><circle cx="12" cy="12" r="2.4" /><path d="M10.2 10.2 8.6 8.6M13.8 10.2l1.6-1.6M10.2 13.8l-1.6 1.6M13.8 13.8l1.6 1.6" /></Svg>;
}

export function IconClock(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.2 2" /></Svg>;
}

export function IconChevronDown(props) {
  return <Svg {...props}><path d="m6 9 6 6 6-6" /></Svg>;
}

// ── Rechner-Signets ────────────────────────────────────────────────────
// Ein Zeichen je Rechner für die Übersichtskarten (/rechner/). Vorher
// unterschieden sich die elf Karten nur durch ihre Überschrift — beim
// Überfliegen sahen alle gleich aus (Card-Monotonie, CLAUDE.md Regel 7).
//
// Gemeinsame Klammer der Familie, damit es nicht nach zusammengesuchten
// Stock-Icons aussieht: dasselbe 24er-Raster, dieselbe Strichstärke wie der
// Rest dieser Datei (1.6 — nicht 2, sonst stünden die neuen Zeichen fetter
// im Satz als die 28 bestehenden), runde Enden, currentColor. Wiederkehrendes
// Motiv ist die schräge Modulfläche mit einer Rasterlinie; was sich
// unterscheidet, ist das jeweils gemessene Ding davor.
//
// Reine Inline-SVG, keine Emoji, keine Fremddatei — und in .astro ohne
// client:-Direktive eingebunden, damit die Übersicht dafür kein Byte
// JavaScript lädt.

export function IconRechnerPhotovoltaik(props) {
  return <Svg {...props}><path d="M3.5 18.5h11l3.2-7.5h-11l-3.2 7.5Z" /><path d="M5.2 14.7h11" /><circle cx="17.2" cy="5" r="2.4" /><path d="M17.2 1.1v1.3M21.1 5h1.3M20 2.2l.9-.9M20 7.8l.9.9" /></Svg>;
}

export function IconRechnerKombi(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="2.6" /><path d="M12 9.4V6M9.8 13.4 6.6 16.4M14.2 13.4l3.2 3" /><path d="M9.6 3.2h4.8v2.6H9.6zM3 17h4.4v3.4H3zM16.6 17H21v3.4h-4.4z" /></Svg>;
}

export function IconRechnerRendite(props) {
  return <Svg {...props}><path d="M3.5 20.5h17" /><path d="M4.5 16.2 9 11.6l3 2.9 5.4-6.2" /><path d="M14.2 8.3h3.6v3.5" /></Svg>;
}

export function IconRechnerSpeicher(props) {
  return <Svg {...props}><rect x="6.5" y="5.5" width="11" height="15" rx="2.2" /><path d="M10 3.4h4" /><path d="M8.8 16.4h6.4M8.8 12.9h6.4" /><path d="M12.6 6.6 10.4 10h3.2l-2.2 3.4" /></Svg>;
}

export function IconRechnerBalkonkraftwerk(props) {
  return <Svg {...props}><path d="M3.4 10.4h10.8l2.6-6.8H6L3.4 10.4Z" /><path d="M5 7h11.4" /><path d="M10 10.4v3.4a3 3 0 0 0 3 3h1.6" /><rect x="14.8" y="14.2" width="5.4" height="5" rx="1.4" /><path d="M16.4 19.2v1.3M18.6 19.2v1.3" /></Svg>;
}

export function IconRechnerCo2(props) {
  return <Svg {...props}><path d="M7.6 13.4h8.8a3.2 3.2 0 0 0 .2-6.4 4.6 4.6 0 0 0-8.8 1.1 2.8 2.8 0 0 0-.2 5.3Z" /><path d="M12 16v4.6M9.4 18.2 12 20.8l2.6-2.6" /></Svg>;
}

export function IconRechnerGestehungskosten(props) {
  return <Svg {...props}><path d="M4 4.2h7.6l8.2 8.2-7.4 7.4L4 11.8V4.2Z" /><circle cx="7.9" cy="8.1" r="1.3" /><path d="M13.4 10.6 11 13.9h3.2l-2.4 3.4" /></Svg>;
}

export function IconRechnerReinigung(props) {
  return <Svg {...props}><path d="M3.5 19.5h11l3.2-7h-11l-3.2 7Z" /><path d="M5.2 16h11" /><path d="M18.6 3.4c1.2 1.7 1.9 2.7 1.9 3.6a1.9 1.9 0 0 1-3.8 0c0-.9.7-1.9 1.9-3.6Z" /><path d="M13.9 4.6c.8 1.1 1.2 1.8 1.2 2.4a1.2 1.2 0 0 1-2.4 0c0-.6.4-1.3 1.2-2.4Z" /></Svg>;
}

export function IconRechnerEauto(props) {
  return <Svg {...props}><path d="M3.6 18.4v-1.3a2.3 2.3 0 0 1 .4-1.3l2.1-2.7a2.5 2.5 0 0 1 2-1h7.8a2.5 2.5 0 0 1 2 1l2.1 2.7a2.3 2.3 0 0 1 .4 1.3v1.3" /><circle cx="7.4" cy="18.7" r="1.4" /><circle cx="16.6" cy="18.7" r="1.4" /><path d="M13.4 2.5 9.6 8.2h3.2L11.4 11.5l4-5.6h-3.2l1.2-3.4Z" /></Svg>;
}

export function IconRechnerSteuer(props) {
  return <Svg {...props}><path d="M5.5 3.5h7.8L18.5 8.4v12.1H5.5V3.5Z" /><path d="M13.1 3.5v4.9h5.4" /><path d="M14.4 12.6a3.4 3.4 0 1 0 0 5.6" /><path d="M8.6 14.4h4.8M8.6 16.4h4.4" /></Svg>;
}

export function IconRechnerMieterstrom(props) {
  return <Svg {...props}><path d="M5 20.5V9.2h14v11.3" /><path d="M6.6 9.2 8 5.8h8l1.4 3.4" /><path d="M8.4 12.4h2.2M13.4 12.4h2.2M8.4 16.2h2.2M13.4 16.2h2.2" /><path d="M3.5 20.5h17" /></Svg>;
}
