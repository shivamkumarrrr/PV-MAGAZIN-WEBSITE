// Design tokens für die Rechner-Komponenten (portiert aus pvrechner). PPC-
// Werte direkt gesetzt, kein White-Label-Merge-Layer — dieses Repo hat genau
// einen Mandanten. Quelle: pvrechner/PRODUCT_DESIGN.md + CLAUDE.md
// ("echtes PPC-Orange #FF5200 exakt aus dem offiziellen Logo-File").
const theme = {
  color: {
    bg: "#F6F8F7", // kühles Off-White, NICHT cremig
    surface: "#FFFFFF",
    textPrimary: "#141B22",
    textSecondary: "#5A6570",
    textMuted: "#8A9099",

    accent: "#FF5200", // echtes PPC-Orange
    accentHover: "#D64700",
    accentSubtle: "#FFE9DD",

    // echte "pp"-Wortmarken-Farbe — für dunkle Headline-Akzente, nicht als
    // Button-Füllung oder Logo-Hintergrund-Chip.
    brandNavy: "#382E4A",

    // nur für Daten-Elemente (z.B. Ertragskurve), nie mit accent gemischt.
    sky: "#2E6F95",
    skySubtle: "#E7EFF3",

    success: "#1E8A5F",
    successSubtle: "#E3F3EC",
    danger: "#C4432B",
    dangerSubtle: "#FBEAE5",

    border: "#E1E5E4", // bewusst nicht Tailwind-Slate #e2e8f0

    white: "#FFFFFF",
  },

  radius: { sm: 6, md: 10, lg: 12, pill: 999 },

  shadow: {
    // nur für echte Overlay-Elemente, nie für Cards/Buttons (die nutzen 1px-Border).
    floating: "0 2px 8px rgba(20,27,34,0.18)",
  },

  // Muss mit --font-body / --font-display in global.css übereinstimmen.
  font: {
    family: "'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Archivo', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  maxWidth: 680,
  maxWidthWide: 1080,
};

export default theme;
