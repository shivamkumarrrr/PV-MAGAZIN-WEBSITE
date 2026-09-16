import theme from "../../../theme.js";

// Zwei Jahresbilanzen als Balken: oben, was die Anlage erzeugt, unten, was der
// Haushalt verbraucht. Beide teilen sich dasselbe Mittelstück — den selbst
// verbrauchten Solarstrom.
//
// Der Grund für diese Darstellung ist inhaltlich, nicht dekorativ: Autarkiegrad
// und Eigenverbrauchsquote sind zwei verschiedene Prozentwerte auf zwei
// verschiedene Bezugsgrößen, und genau diese Verwechslung ist in calculate.js
// als wiederkehrender Fehler dokumentiert. Nebeneinander gelegt ist ohne einen
// Satz Erklärung sichtbar, dass 65 % Autarkie und 45 % Eigenverbrauchsquote
// gleichzeitig stimmen können.
//
// Vorbild ist das Flussbild im zolar-Solarrechner; bewusst als flacher
// Balken statt als gezeichnetes Haus mit Flusslinien: Die Ergebnisseite hat mit
// den Monatscharts schon ihre Grafiken, ein zweites Bildmotiv wäre ein zweites
// Signature-Element (Design-Regel 11). Alle Werte kommen aus `calculate()` —
// hier wird nichts nachgerechnet.
const NF = new Intl.NumberFormat("de-DE");

function Balken({ titel, summe, segmente }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: theme.color.textSecondary, fontWeight: 500 }}>{titel}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>
          {NF.format(Math.round(summe))} kWh
        </span>
      </div>

      <div
        style={{ display: "flex", height: 14, borderRadius: theme.radius.sm, overflow: "hidden", background: theme.color.bg }}
        role="img"
        aria-label={segmente
          .filter((s) => s.wert > 0)
          .map((s) => `${s.label}: ${NF.format(Math.round(s.wert))} kWh`)
          .join(", ")}
      >
        {segmente.map((s) =>
          s.wert > 0 ? (
            <div key={s.label} style={{ width: `${(s.wert / summe) * 100}%`, background: s.farbe }} />
          ) : null
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 7 }}>
        {segmente.map((s) =>
          s.wert > 0 ? (
            <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: theme.color.textSecondary }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: s.farbe, flexShrink: 0 }} aria-hidden="true" />
              {s.label}
              <strong style={{ color: theme.color.textPrimary, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {NF.format(Math.round(s.wert))} kWh
              </strong>
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}

export default function Energiebilanz({ result }) {
  const { jahresertrag, eigenverbrauch, einspeisung, gesamtVerbrauch, autarkie } = result;
  const netzbezug = Math.max(0, gesamtVerbrauch - eigenverbrauch);
  const eigenquote = jahresertrag > 0 ? Math.round((eigenverbrauch / jahresertrag) * 100) : 0;

  // Ohne Ertrag oder ohne Verbrauch gäbe es nichts aufzuteilen — dann bleibt der
  // Block weg, statt zwei leere Balken zu zeigen (Randfall aus CLAUDE.md).
  if (!jahresertrag || !gesamtVerbrauch) return null;

  return (
    <section
      aria-labelledby="energiebilanz-titel"
      style={{
        background: theme.color.white,
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        padding: "18px 20px",
        marginBottom: 16,
      }}
    >
      <h3
        id="energiebilanz-titel"
        style={{ fontFamily: theme.font.display, fontSize: 15, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 14px" }}
      >
        Energiebilanz im Jahr
      </h3>

      <Balken
        titel="Erzeugt"
        summe={jahresertrag}
        segmente={[
          { label: "selbst verbraucht", wert: eigenverbrauch, farbe: theme.color.accent },
          { label: "eingespeist", wert: einspeisung, farbe: theme.color.sky },
        ]}
      />

      <Balken
        titel="Verbraucht"
        summe={gesamtVerbrauch}
        segmente={[
          { label: "aus der Anlage", wert: eigenverbrauch, farbe: theme.color.accent },
          // Dieselben drei Farben wie im Monatschart darunter: Eigenverbrauch
          // orange, Einspeisung Blau, Netzbezug Grau — sonst müsste der Leser
          // zwei Legenden lernen.
          { label: "aus dem Netz", wert: netzbezug, farbe: theme.color.textMuted },
        ]}
      />

      <p style={{ fontSize: 12, color: theme.color.textSecondary, lineHeight: 1.55, margin: "10px 0 0" }}>
        Dasselbe orange Stück steht in beiden Balken: {NF.format(Math.round(eigenverbrauch))} kWh Solarstrom, den Sie
        selbst nutzen. Gemessen am Verbrauch sind das <strong style={{ color: theme.color.textPrimary, fontWeight: 600 }}>{autarkie} % Autarkie</strong>,
        gemessen an der Erzeugung <strong style={{ color: theme.color.textPrimary, fontWeight: 600 }}>{eigenquote} % Eigenverbrauchsquote</strong> —
        zwei Prozentwerte auf zwei verschiedene Bezugsgrößen.
      </p>
    </section>
  );
}
