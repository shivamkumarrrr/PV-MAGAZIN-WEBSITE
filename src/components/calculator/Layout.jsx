import theme from "../../theme.js";

// Zwei-Spalten-Layout für den Rechner: links der Wizard, rechts das Live-Panel.
// Unterhalb von 960px stapelt sich das Panel unter den Wizard.
//
// `mobileBar` schließt die Lücke, die dabei entsteht: gestapelt liegt die
// Live-Vorschau irgendwo unterhalb des sichtbaren Bereichs, während getippt
// wird — dasselbe Problem hat zolars Solarrechner auf dem Handy. Die Leiste
// bleibt am unteren Rand stehen und zeigt die eine Kennzahl, um die es geht;
// ein Tipp darauf springt zur vollständigen Vorschau. Ab 960px ist sie aus,
// weil dort die klebende Seitenspalte denselben Zweck erfüllt.
export default function Layout({ main, sidebar, mobileBar }) {
  return (
    <div className={mobileBar ? "calc-layout calc-layout--mit-leiste" : "calc-layout"}>
      <style>{`
        .calc-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
          align-items: start;
          max-width: ${theme.maxWidthWide}px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .calc-layout__leiste {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 20;
          background: ${theme.color.white};
          border-top: 1px solid ${theme.color.border};
          padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
        }
        /* Platz, damit die Leiste den letzten Block nicht verdeckt — am
           Raster selbst, nicht nur an der Hauptspalte: gestapelt steht die
           Live-Vorschau als LETZTES auf der Seite, und genau sie lag sonst
           unter der Leiste. */
        .calc-layout--mit-leiste { padding-bottom: 92px; }
        /* Mobil: weniger Kopf über jeder Frage — Kartentitel und die zweite
           (Unter-)Fortschrittsleiste entfallen; Hauptfortschritt + "Schritt
           X von 4" + Überschrift bleiben. */
        @media (max-width: 719px) {
          .calc-card__title, .subflow-progress { display: none !important; }
        }
        @media (min-width: 960px) {
          .calc-layout { grid-template-columns: minmax(0, 1fr) 400px; }
          .calc-layout__sidebar { position: sticky; top: 84px; }
          .calc-layout__leiste { display: none; }
          .calc-layout--mit-leiste { padding-bottom: 0; }
        }
      `}</style>
      <div>{main}</div>
      <div className="calc-layout__sidebar" id="live-vorschau">{sidebar}</div>
      {mobileBar && <div className="calc-layout__leiste">{mobileBar}</div>}
    </div>
  );
}
