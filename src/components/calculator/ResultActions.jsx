import { useEffect } from "react";
import theme from "../../theme.js";

// "Ergebnis mitnehmen" — der Schritt nach der Zahl, der keine E-Mail-Adresse
// verlangt. Wer mit dem Ergebnis zu einem Installateur geht, nimmt einen
// neutralen Ausdruck mit Annahmen und Quellen mit, statt dessen Angebot ohne
// Vergleich zu bekommen. Browser-Druckdialog statt PDF-Bibliothek: "Als PDF
// speichern" ist dort eingebaut, und es kommt kein Paket hinzu.
//
// Gedruckt wird die Seite selbst; was dabei stört (Kopfzeile, Fußzeile,
// Anfrageformular, dieser Block) blendet @media print in global.css aus. Die
// Aufklapp-Blöcke ("So haben wir das berechnet") sind im Ausdruck der Beleg
// — sie werden deshalb für den Druck geöffnet und danach wieder zugeklappt.
export default function ResultActions() {
  useEffect(() => {
    let geoeffnet = [];
    const vorDruck = () => {
      geoeffnet = Array.from(document.querySelectorAll("main details:not([open])"));
      geoeffnet.forEach((d) => (d.open = true));
    };
    const nachDruck = () => {
      geoeffnet.forEach((d) => (d.open = false));
      geoeffnet = [];
    };
    window.addEventListener("beforeprint", vorDruck);
    window.addEventListener("afterprint", nachDruck);
    return () => {
      window.removeEventListener("beforeprint", vorDruck);
      window.removeEventListener("afterprint", nachDruck);
    };
  }, []);

  return (
    <>
      <section
        className="druck-aus"
        aria-labelledby="ergebnis-mitnehmen"
        style={{
          marginBottom: 20,
          padding: "20px 22px",
          background: theme.color.surface,
          border: `1px solid ${theme.color.border}`,
          borderRadius: theme.radius.lg,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div style={{ flex: "1 1 260px" }}>
          <h2 id="ergebnis-mitnehmen" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: theme.color.textPrimary }}>
            Ergebnis mitnehmen
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.5, color: theme.color.textSecondary }}>
            Ausdruck mit Ihren Angaben, den Annahmen und den Quellen — zum Vergleich mit Angeboten von Installateuren.
            Ohne Anmeldung.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: "11px 18px",
            minHeight: 44,
            background: theme.color.surface,
            color: theme.color.textPrimary,
            border: `1.5px solid ${theme.color.textPrimary}`,
            borderRadius: theme.radius.md,
            fontFamily: "inherit",
            fontSize: 14.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Drucken / als PDF speichern
        </button>
      </section>

      {/* Nur im Ausdruck sichtbar: woher die Zahlen stammen und wo die
          Annahmen stehen. Steht in der Papierfassung nicht im Seitentext. */}
      <p className="nur-druck" style={{ display: "none", fontSize: 12, color: theme.color.textSecondary }}>
        Modellrechnung von Photovoltaik Aktuell, kein Angebot. Konstanten, Quellen und Grenzen des Modells:{" "}
        {typeof window !== "undefined" ? window.location.origin : ""}/methodik/
      </p>
    </>
  );
}
