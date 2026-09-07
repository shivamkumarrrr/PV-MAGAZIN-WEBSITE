import theme from "../../theme.js";
import ResultCard from "./ui/ResultCard.jsx";
import { IconClock } from "../Icons.jsx";
import { usePrefersReducedMotion } from "../../lib/usePrefersReducedMotion.js";

export default function KeyMetrics({ result, speicherKwh, eauto, waermepumpe, formatSpan }) {
  const reduced = usePrefersReducedMotion();

  return (
    <>
      {/* Autarkiegrad Ring */}
      <div
        style={{
          background: theme.color.white,
          borderRadius: theme.radius.lg,
          border: `1.5px solid ${theme.color.border}`,
          padding: "20px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0, perspective: 500 }}>
          {/* Mehrschichtiger Tiefen-Schatten: weiche, radial abfallende Basis-
              fläche hinter dem Ring — statisch, bewegt sich nicht mit. */}
          <div style={{
            position: "absolute",
            inset: 4,
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 58%, rgba(20,27,34,0.12), rgba(20,27,34,0.04) 55%, transparent 72%)",
            filter: "blur(1.5px)",
            transform: "translateY(5px) scale(1.04)",
            pointerEvents: "none",
          }} />
          {/* Beim Erscheinen leicht aus der Tiefe herauskommen (translateZ),
              dazu ein scharfer Drop-Shadow auf dem Ring selbst. */}
          <div style={{
            position: "relative",
            width: 100,
            height: 100,
            transformStyle: "preserve-3d",
            animation: reduced ? "none" : "ringEnter 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: 100, height: 100, filter: "drop-shadow(0 2px 3px rgba(20,27,34,0.18))" }} role="img" aria-label={`Autarkiegrad ${result.autarkie}%`}>
              <circle cx="50" cy="50" r="42" fill="none" stroke={theme.color.bg} strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={result.autarkie >= 50 ? theme.color.success : theme.color.accent}
                strokeWidth="10"
                strokeDasharray={`${result.autarkie * 2.64} ${264 - result.autarkie * 2.64}`}
                strokeLinecap="round"
                style={{ transition: reduced ? "none" : "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: theme.color.textPrimary, lineHeight: 1 }}>{result.autarkie}%</div>
              <div style={{ fontSize: 9, color: theme.color.textMuted, marginTop: 2 }}>Autarkie</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>
            {result.autarkie >= 60 ? "Sehr gute Unabhängigkeit!" : result.autarkie >= 40 ? "Gute Unabhängigkeit" : "Teilweise unabhängig"}
          </div>
          <div style={{ fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.5 }}>
            {result.autarkie}% Ihres <strong>gesamten Verbrauchs</strong> deckt die Anlage — der Rest kommt aus dem Netz.
            {!speicherKwh && result.autarkie < 50 && " Mit einem Batteriespeicher steigt Ihre Autarkie spürbar — 100% sind mit einem realistisch dimensionierten Speicher allerdings nicht erreichbar."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", minWidth: 200 }}>
          <div style={{ minWidth: 150 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{Math.round(result.eigenverbrauchsquote * 100)}%</div>
            <div style={{ fontSize: 10.5, color: theme.color.textMuted }}>Eigenverbrauchsanteil</div>
            <div style={{ fontSize: 10.5, color: theme.color.textMuted, lineHeight: 1.4, marginTop: 2 }}>Anteil des <strong>selbst erzeugten</strong> Stroms, den Sie nutzen — der Rest wird eingespeist.</div>
          </div>
          <div style={{ minWidth: 150 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{(result.gesamtVerbrauch - result.eigenverbrauch).toLocaleString("de-DE")}</div>
            <div style={{ fontSize: 10.5, color: theme.color.textMuted }}>kWh Netzbezug</div>
            <div style={{ fontSize: 10.5, color: theme.color.textMuted, lineHeight: 1.4, marginTop: 2 }}>Anteil Ihres Verbrauchs, der trotz Anlage aus dem Netz kommt.</div>
          </div>
        </div>
      </div>

      {/* Geplante Verbraucher: Hinweis, dass sie noch nicht eingerechnet sind */}
      {(eauto === "geplant" || waermepumpe === "geplant") && (
        <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "14px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: theme.color.textSecondary, marginTop: 2, display: "flex", flexShrink: 0 }}><IconClock size={16} /></span>
          <div style={{ fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.6 }}>
            <strong style={{ color: theme.color.textPrimary }}>Geplant, aber noch nicht eingerechnet:</strong>{" "}
            {[eauto === "geplant" && "E-Auto", waermepumpe === "geplant" && "Wärmepumpe"].filter(Boolean).join(" und ")} ist in Ihrer Berechnung noch nicht enthalten, da der Verbrauch erst mit der Installation entsteht. Planen Sie die Anlage im Zweifel etwas größer — das besprechen Sie am besten im Beratungsgespräch.
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <ResultCard label="Anlagengröße" value={result.kwp} unit="kWp" sub={`${result.module} Module · ${result.nutzbar} m²`} />
        <ResultCard label="Jahresertrag" value={formatSpan(result.jahresertrag)} unit="kWh" sub="±12% Spannbreite" />
        <ResultCard label="Amortisation" value={formatSpan(result.amortisation)} unit="Jahre" highlight />
        <ResultCard label="CO₂-Einsparung" value={result.co2.toLocaleString("de-DE")} unit="kg/Jahr" sub={`≈ ${result.co2Baeume.toLocaleString("de-DE")} Bäume/Jahr`} />
      </div>
    </>
  );
}
