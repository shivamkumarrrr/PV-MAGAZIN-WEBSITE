// ACHTUNG: Diese Datei wird von scripts/signets-sync.mjs erzeugt.
// Nicht von Hand bearbeiten — die Quelle der Zeichen ist die Figma-Datei
// "Photovoltaik Aktuell — Rechner-Signets"
// (https://www.figma.com/design/IMQ7LVEoRqfStuXZnGyuCF).
//
// Nach einer Änderung in Figma:
//   node scripts/signets-sync.mjs --from-figma      (braucht FIGMA_TOKEN)
//   node scripts/signets-sync.mjs --from ~/Downloads (lokal exportierte SVGs)
//
// Der <Svg>-Wrapper stammt aus Icons.jsx und setzt Raster 24, Strichstärke
// 1.6, runde Enden und currentColor — deshalb tragen die Pfade hier weder
// Farbe noch Strichangaben.
import { Svg } from "./Icons.jsx";

// photovoltaik — Modulfläche mit Sonne
export function IconRechnerPhotovoltaik(props) {
  return <Svg {...props}><path d="M3.5 18.5h11l3.2-7.5h-11l-3.2 7.5Z" /><path d="M5.2 14.7h11" /><circle cx="17.2" cy="5" r="2.4" /><path d="M17.2 1.1v1.3M21.1 5h1.3M20 2.2l.9-.9M20 7.8l.9.9" /></Svg>;
}

// kombi — Verteilung auf mehrere Verbraucher
export function IconRechnerKombi(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="2.6" /><path d="M12 9.4V6M9.8 13.4 6.6 16.4M14.2 13.4l3.2 3" /><path d="M9.6 3.2h4.8v2.6H9.6zM3 17h4.4v3.4H3zM16.6 17H21v3.4h-4.4z" /></Svg>;
}

// rendite — Ertragskurve über die Laufzeit
export function IconRechnerRendite(props) {
  return <Svg {...props}><path d="M3.5 20.5H20.5" /><path d="M4.5 16.2L9 11.6L12 14.5L17.4 8.3" /><path d="M14.2 8.3H17.8V11.8" /></Svg>;
}

// speicher — Batteriezelle mit Ladung
export function IconRechnerSpeicher(props) {
  return <Svg {...props}><rect x="6.5" y="5.5" width="11" height="15" rx="2.2" /><path d="M10 3.4h4" /><path d="M8.8 16.4h6.4M8.8 12.9h6.4" /><path d="M12.6 6.6 10.4 10h3.2l-2.2 3.4" /></Svg>;
}

// balkonkraftwerk — Modul am Kabel mit Stecker
export function IconRechnerBalkonkraftwerk(props) {
  return <Svg {...props}><path d="M3.4 10.4h10.8l2.6-6.8H6L3.4 10.4Z" /><path d="M5 7h11.4" /><path d="M10 10.4v3.4a3 3 0 0 0 3 3h1.6" /><rect x="14.8" y="14.2" width="5.4" height="5" rx="1.4" /><path d="M16.4 19.2v1.3M18.6 19.2v1.3" /></Svg>;
}

// co2 — vermiedene Emissionen
export function IconRechnerCo2(props) {
  return <Svg {...props}><path d="M7.6 13.4h8.8a3.2 3.2 0 0 0 .2-6.4 4.6 4.6 0 0 0-8.8 1.1 2.8 2.8 0 0 0-.2 5.3Z" /><path d="M12 16v4.6M9.4 18.2 12 20.8l2.6-2.6" /></Svg>;
}

// gestehungskosten — Preisschild je Kilowattstunde
export function IconRechnerGestehungskosten(props) {
  return <Svg {...props}><path d="M4 4.2h7.6l8.2 8.2-7.4 7.4L4 11.8V4.2Z" /><circle cx="7.9" cy="8.1" r="1.3" /><path d="M13.4 10.6 11 13.9h3.2l-2.4 3.4" /></Svg>;
}

// reinigung — Modulfläche mit Wasser
export function IconRechnerReinigung(props) {
  return <Svg {...props}><path d="M3.5 19.5h11l3.2-7h-11l-3.2 7Z" /><path d="M5.2 16h11" /><path d="M18.6 3.4c1.2 1.7 1.9 2.7 1.9 3.6a1.9 1.9 0 0 1-3.8 0c0-.9.7-1.9 1.9-3.6Z" /><path d="M13.9 4.6c.8 1.1 1.2 1.8 1.2 2.4a1.2 1.2 0 0 1-2.4 0c0-.6.4-1.3 1.2-2.4Z" /></Svg>;
}

// eauto — Fahrzeug mit Ladeblitz
export function IconRechnerEauto(props) {
  return <Svg {...props}><path d="M3.6 18.4v-1.3a2.3 2.3 0 0 1 .4-1.3l2.1-2.7a2.5 2.5 0 0 1 2-1h7.8a2.5 2.5 0 0 1 2 1l2.1 2.7a2.3 2.3 0 0 1 .4 1.3v1.3" /><circle cx="7.4" cy="18.7" r="1.4" /><circle cx="16.6" cy="18.7" r="1.4" /><path d="M13.4 2.5 9.6 8.2h3.2L11.4 11.5l4-5.6h-3.2l1.2-3.4Z" /></Svg>;
}

// steuer — Bescheid mit Eurozeichen
export function IconRechnerSteuer(props) {
  return <Svg {...props}><path d="M5.5 3.5h7.8L18.5 8.4v12.1H5.5V3.5Z" /><path d="M13.1 3.5v4.9h5.4" /><path d="M14.4 12.6a3.4 3.4 0 1 0 0 5.6" /><path d="M8.6 14.4h4.8M8.6 16.4h4.4" /></Svg>;
}

// mieterstrom — Mehrfamilienhaus mit Dachanlage
export function IconRechnerMieterstrom(props) {
  return <Svg {...props}><path d="M5 20.5V9.2H19V20.5" /><path d="M6.60001 9.2L8.00001 5.8H16L17.4 9.2" /><path d="M8.39999 12.4H10.6M13.4 12.4H15.6M8.39999 16.2H10.6M13.4 16.2H15.6" /><path d="M3.5 20.5H20.5" /></Svg>;
}
