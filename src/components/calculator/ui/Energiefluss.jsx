import theme from "../../../theme.js";
import { IconSun, IconPlug, IconBolt, IconBattery, IconHouse } from "../../Icons.jsx";
import { useAnimatedNumber } from "../../../lib/useAnimatedNumber.js";
import { usePrefersReducedMotion } from "../../../lib/usePrefersReducedMotion.js";

// Flussbild der Jahresbilanz: das Haus in der Mitte, die vier Energieströme als
// Bögen daran. Gedacht als EIN Signature-Element der Live-Vorschau (Design-Regel
// 11) — deshalb ersetzt es dort den Autarkie-Ring und das Monatschart, statt
// neben ihnen zu stehen.
//
// Auf der Ergebnisseite bleibt es bewusst weg: dort erklärt `Energiebilanz.jsx`
// dieselben Zahlen als Balkenpaar, weil dort Autarkie vs. Eigenverbrauchsquote
// nebeneinander liegen müssen — das kann ein Flussbild nicht.
//
// Alles steckt in EINEM SVG mit fester viewBox. Die Beschriftung ist also
// Vektor und skaliert mit: bei 288px Kartenbreite (360px-Viewport) schrumpft
// der Text mit, statt aus seiner Box zu laufen.
//
// Farben sind dieselben wie in MonthlyChart/Energiebilanz — orange = selbst
// erzeugt/genutzt, sky = eingespeist, grau = aus dem Netz. Eine zweite Legende
// soll niemand lernen müssen. Keine Verläufe: Volltonlinien mit Deckkraft.
const NF = new Intl.NumberFormat("de-DE");

const W = 340;
const H = 338;

// Ein Strom: Bogen + Signet + Beschriftung + Wert. `anchor` steuert, an welcher
// Kante der Text ausgerichtet wird, damit nach außen hin nichts anstößt.
function Strom({ pfad, farbe, icon, iconX, iconY, textX, textY, anchor, label, wert, einheit, fluss, bereit = true }) {
  const animiert = useAnimatedNumber(wert);
  return (
    <g opacity={bereit ? 1 : 0.45}>
      <path d={pfad} fill="none" stroke={farbe} strokeWidth="5" strokeLinecap="round" opacity="0.28" />
      <path
        className={fluss ? "energiefluss-strom" : undefined}
        d={pfad}
        fill="none"
        stroke={farbe}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="14 150"
      />
      <g transform={`translate(${iconX} ${iconY})`} style={{ color: farbe }}>{icon}</g>
      <text x={textX} y={textY} textAnchor={anchor} fontSize="11" fill={theme.color.textSecondary} fontFamily={theme.font.family}>
        {label}
      </text>
      <text
        x={textX}
        y={textY + 17}
        textAnchor={anchor}
        fontSize="14"
        fontWeight="700"
        fill={farbe}
        fontFamily={theme.font.family}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {bereit ? NF.format(Math.round(animiert)) : "–"}{" "}
        <tspan fontSize="11" fontWeight="500" fill={theme.color.textSecondary}>{bereit ? einheit : ""}</tspan>
      </text>
    </g>
  );
}

export default function Energiefluss({ result, speicherKwh, bereit = true }) {
  const { jahresertrag = 0, einspeisung = 0, eigenverbrauch = 0, gesamtVerbrauch = 0, speicherBeitrag = 0 } = result;
  const netzbezug = Math.max(0, gesamtVerbrauch - eigenverbrauch);
  const reduced = usePrefersReducedMotion();
  const mitSpeicher = bereit && speicherKwh > 0 && speicherBeitrag > 0;

  const beschreibung = !bereit
    ? "Jahresbilanz: noch keine Angaben — sobald Dachform und Stromverbrauch feststehen, stehen hier die Werte."
    :
    `Jahresbilanz: Erzeugung ${NF.format(Math.round(jahresertrag))} Kilowattstunden, ` +
    `Einspeisung ${NF.format(Math.round(einspeisung))}, Netzbezug ${NF.format(Math.round(netzbezug))}, ` +
    (mitSpeicher ? `aus dem Speicher ${NF.format(Math.round(speicherBeitrag))}, ` : "") +
    `Hausverbrauch ${NF.format(Math.round(gesamtVerbrauch))} Kilowattstunden.`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={beschreibung} style={{ display: "block" }}>
      <style>{`
        .energiefluss-strom {
          animation: energieflussLauf 3.2s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .energiefluss-strom { animation: none; opacity: 0; }
        }
        @keyframes energieflussLauf {
          from { stroke-dashoffset: 164; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Erzeugung — von der Sonne aufs Dach. */}
      <Strom
        pfad="M170 70 C170 104 170 124 170 156"
        farbe={theme.color.accent}
        icon={<IconSun size={24} />}
        iconX={158} iconY={6}
        textX={170} textY={50} anchor="middle"
        label="Erzeugung" wert={jahresertrag} einheit="kWh" fluss={!reduced && bereit} bereit={bereit}
      />

      {/* Netzbezug — vom Netz ins Haus (Richtung bleibt zum Haus hin, wie der
          Strom fließt). */}
      <Strom
        pfad="M44 136 C44 174 76 182 116 210"
        farbe={theme.color.textMuted}
        icon={<IconPlug size={22} />}
        iconX={33} iconY={74}
        textX={6} textY={112} anchor="start"
        label="Netzbezug" wert={netzbezug} einheit="kWh" fluss={!reduced && bereit} bereit={bereit}
      />

      {/* Einspeisung — vom Dach ins Netz. */}
      <Strom
        pfad="M224 210 C264 182 296 174 296 136"
        farbe={theme.color.sky}
        icon={<IconBolt size={22} />}
        iconX={287} iconY={74}
        textX={334} textY={112} anchor="end"
        label="Einspeisung" wert={einspeisung} einheit="kWh" fluss={!reduced && bereit} bereit={bereit}
      />

      {/* Speicher — nur wenn einer gewählt ist. `speicherBeitrag` ist der
          Mehr-Eigenverbrauch aus calculate.js, nicht hier nachgerechnet
          (Invariante 4). */}
      {mitSpeicher && (
        <Strom
          pfad="M54 246 C82 240 98 242 122 250"
          farbe={theme.color.brandNavy}
          icon={<IconBattery size={24} />}
          iconX={42} iconY={220}
          textX={6} textY={278} anchor="start"
          label="aus dem Speicher" wert={speicherBeitrag} einheit="kWh" fluss={!reduced && bereit} bereit={bereit}
        />
      )}

      {/* Haus. Bewusst dieselbe Strichstärke wie die Signets in Icons.jsx. */}
      <ellipse cx="170" cy="272" rx="72" ry="9" fill={theme.color.bg} />
      <g fill="none" stroke={theme.color.textPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M112 202 L170 158 L228 202" />
        <path d="M122 200 V268 H218 V200" />
        <path d="M158 268 V240 H182 V268" />
      </g>
      {/* Modulfeld auf der rechten Dachfläche — vier Felder wie in der
          Bildmarke des Logos. Das Viereck ist ein echtes Parallelogramm in der
          Dachebene (Kanten parallel zur Traufe bzw. zum First), sonst liegt es
          optisch neben dem Dach statt darauf. */}
      <g>
        <path d="M183 172 L205 189 L196 197 L174 180 Z" fill={theme.color.accentSubtle} stroke={theme.color.accent} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M178.5 176 L200.5 193 M194 180.5 L185 188.5" stroke={theme.color.accent} strokeWidth="0.9" opacity="0.75" fill="none" strokeLinecap="round" />
      </g>
      <rect x="133" y="212" width="15" height="14" rx="2" fill={theme.color.bg} stroke={theme.color.textPrimary} strokeWidth="1.4" />
      <rect x="192" y="212" width="15" height="14" rx="2" fill={theme.color.bg} stroke={theme.color.textPrimary} strokeWidth="1.4" />

      {/* Hausverbrauch — die Bezugsgröße unter dem Haus. */}
      <g transform="translate(161 278)" style={{ color: theme.color.textSecondary }}><IconHouse size={18} /></g>
      <HausText gesamtVerbrauch={gesamtVerbrauch} bereit={bereit} />
    </svg>
  );
}

// Eigene Komponente, weil `useAnimatedNumber` ein Hook ist und der Wert unter
// dem Haus nicht zum <Strom>-Muster passt (kein Bogen, kein eigener Farbton).
function HausText({ gesamtVerbrauch, bereit = true }) {
  const animiert = useAnimatedNumber(gesamtVerbrauch);
  return (
    <>
      <text x="170" y="310" textAnchor="middle" fontSize="11" fill={theme.color.textSecondary} fontFamily={theme.font.family}>
        Hausverbrauch
      </text>
      <text
        x="170" y="328" textAnchor="middle" fontSize="14" fontWeight="700"
        fill={theme.color.textPrimary} fontFamily={theme.font.family}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {bereit ? NF.format(Math.round(animiert)) : "–"}{" "}
        <tspan fontSize="11" fontWeight="500" fill={theme.color.textSecondary}>{bereit ? "kWh" : ""}</tspan>
      </text>
    </>
  );
}
