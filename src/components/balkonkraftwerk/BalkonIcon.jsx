import theme from "../../theme.js";

// Signature-Illustration für den Balkonkraftwerk-Rechner: ein Modul,
// schräg an ein Balkongeländer gelehnt — bewusst anderes Bildmotiv als
// RoofIcon/SunArc (Dach-Rechner), damit die beiden Rechner nicht wie ein
// wiederverwendetes Reskin wirken. Gleicher Zeichenstil (dünne Striche,
// viewBox-Illustration, Akzentfarbe) wie die übrigen Rechner-Icons.
export default function BalkonIcon({ size = 88 }) {
  return (
    <svg viewBox="0 0 120 100" style={{ width: size, height: Math.round(size * (100 / 120)), display: "block" }} role="img" aria-label="Balkonkraftwerk-Illustration">
      {/* Geländer */}
      <line x1="8" y1="90" x2="112" y2="90" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
      <line x1="8" y1="55" x2="112" y2="55" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      {[16, 34, 52, 70, 88, 106].map((x) => (
        <line key={x} x1={x} y1="55" x2={x} y2="90" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      ))}
      {/* Modul, schräg angelehnt */}
      <g transform="rotate(-18 60 55)">
        <rect x="30" y="18" width="60" height="38" rx="2" fill={theme.color.accent} opacity="0.9" />
        <line x1="30" y1="30" x2="90" y2="30" stroke={theme.color.textPrimary} strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="44" x2="90" y2="44" stroke={theme.color.textPrimary} strokeWidth="1" opacity="0.5" />
        <line x1="50" y1="18" x2="50" y2="56" stroke={theme.color.textPrimary} strokeWidth="1" opacity="0.5" />
        <line x1="70" y1="18" x2="70" y2="56" stroke={theme.color.textPrimary} strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  );
}
