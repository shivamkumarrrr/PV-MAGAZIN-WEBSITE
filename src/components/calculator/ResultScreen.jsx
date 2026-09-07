import theme from "../../theme.js";
import ResultHeader from "./ResultHeader.jsx";
import KeyMetrics from "./KeyMetrics.jsx";
import MonthlyCharts from "./MonthlyCharts.jsx";
import DetailSection from "./DetailSection.jsx";
import LeadForm from "./LeadForm.jsx";
import Transparency from "./Transparency.jsx";
import { formatSpan } from "../../lib/calculate.js";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";
import { useCountUpOnView } from "../../lib/useCountUpOnView.js";

export default function ResultScreen({ result, displayLocation, resolvedCity, dach, dachform, ausrichtung, neigung, speicherKwh, eauto, eautoProfil, waermepumpe, tageszeit, plz, onRestart }) {
  const reduced = usePrefersReducedMotion();
  // Haupt-Ergebniszahl: zählt beim ersten Erscheinen von 0 auf den Wert hoch.
  // Angezeigt als ±12%-Spanne (formatSpan), deren Mitte hochzählt.
  const [savingsRef, savingsCount] = useCountUpOnView(result.jahresErsparnis);

  return (
    <div style={{ fontFamily: theme.font.family, maxWidth: theme.maxWidth, margin: "0 auto", padding: "24px 16px", animation: "fadeScaleIn 0.4s ease" }}>
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ringEnter {
          from { opacity: 0.25; transform: perspective(500px) translateZ(-46px) scale(0.92); }
          to { opacity: 1; transform: perspective(500px) translateZ(0) scale(1); }
        }
      `}</style>

      <ResultHeader result={result} displayLocation={displayLocation} savingsRef={savingsRef} savingsCount={savingsCount} />

      <KeyMetrics result={result} speicherKwh={speicherKwh} eauto={eauto} waermepumpe={waermepumpe} formatSpan={formatSpan} />

      <MonthlyCharts result={result} />

      <DetailSection result={result} dachform={dachform} speicherKwh={speicherKwh} tageszeit={tageszeit} plz={plz} />

      <LeadForm
        result={result}
        displayLocation={displayLocation}
        resolvedCity={resolvedCity}
        dach={dach}
        dachform={dachform}
        ausrichtung={ausrichtung}
        neigung={neigung}
        speicherKwh={speicherKwh}
        eauto={eauto}
        eautoProfil={eautoProfil}
        waermepumpe={waermepumpe}
        tageszeit={tageszeit}
        plz={plz}
        onRestart={onRestart}
      />

      <Transparency result={result} />
    </div>
  );
}
