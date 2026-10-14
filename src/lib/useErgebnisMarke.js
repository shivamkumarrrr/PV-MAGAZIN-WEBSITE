import { useEffect } from "react";

// Setzt `data-ergebnis` am <html>, solange ein Rechner seine Ergebnisseite
// zeigt. Die Erklärabschnitte unter dem Rechner (RechnerSeiteInhalt.astro)
// blenden sich dadurch aus: Wer sein Ergebnis vor sich hat, braucht dort
// nicht noch einmal "So funktioniert der Rechner". Die FAQ bleibt stehen.
// Der Text bleibt im HTML (display: none), die Seite verliert für
// Suchmaschinen nichts.
export default function useErgebnisMarke(zeigtErgebnis) {
  useEffect(() => {
    if (!zeigtErgebnis) return;
    const el = document.documentElement;
    el.setAttribute("data-ergebnis", "");
    return () => el.removeAttribute("data-ergebnis");
  }, [zeigtErgebnis]);
}
