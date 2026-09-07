import theme from "../../theme.js";
import BarCompare from "./ui/BarCompare.jsx";
import { IconSearch } from "../Icons.jsx";
import { STROMPREIS, EINSPEISE, M2_PRO_KWP, M2_PRO_KWP_FLACHDACH, PVGIS_SYSTEM_LOSS, DEGRADATION_PRO_JAHR, WARTUNG_PROZENT_PRO_JAHR, wechselrichterKosten, STROMPREIS_STEIGERUNG_PRO_JAHR } from "../../lib/calculate.js";

export default function DetailSection({ result, dachform, speicherKwh, tageszeit, plz }) {
  return (
    <>
      {/* Comparison */}
      <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 14 }}>Stromkosten im Vergleich</div>
        <BarCompare
          label1="Ohne Solar"
          val1={Math.round(result.gesamtVerbrauch * STROMPREIS)}
          label2="Mit Solar"
          val2={Math.round(result.gesamtVerbrauch * STROMPREIS) - result.jahresErsparnis}
          unit="€/Jahr"
          color1={theme.color.danger}
          color2={theme.color.success}
        />
      </div>

      {/* Details */}
      <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "16px", marginBottom: 12, fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 600, color: theme.color.textPrimary, marginBottom: 8 }}>Details Ihrer Berechnung</div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Eigenverbrauch</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{result.eigenverbrauch.toLocaleString("de-DE")} kWh</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Netzeinspeisung</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{result.einspeisung.toLocaleString("de-DE")} kWh</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Eigenverbrauchsanteil</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{Math.round(result.eigenverbrauchsquote * 100)}% des Ertrags</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Ersparnis Eigenverbrauch</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{Math.round(result.eigenverbrauch * STROMPREIS).toLocaleString("de-DE")} €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Einspeisevergütung</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{Math.round(result.einspeisung * EINSPEISE).toLocaleString("de-DE")} €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${theme.color.border}`, paddingTop: 8, marginTop: 8 }}>
          <span>Geschätzte Investition</span><span style={{ fontWeight: 600, color: theme.color.textPrimary }}>{result.investition.toLocaleString("de-DE")} €</span>
        </div>
      </div>

      {/* Transparency: how the numbers came to be — nur gezeigt, solange noch
          KEINE PLZ eingegeben wurde (dann erklären die Texte den Schätzwert).
          Nach Eingabe einer PLZ ist die Stelle redundant und wird ausgeblendet. */}
      {plz?.length !== 5 && (
        <details style={{ marginBottom: 20, border: `1.5px solid ${theme.color.border}`, borderRadius: 12, overflow: "hidden" }}>
          <summary style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: theme.color.textPrimary, cursor: "pointer", background: theme.color.bg, display: "flex", alignItems: "center", gap: 7 }}>
            <IconSearch size={15} /> So haben wir das berechnet
          </summary>
          <div style={{ padding: "4px 16px 16px", fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.7 }}>
            <p style={{ margin: "8px 0" }}>
              {result.dataSource?.includes("PVGIS")
                ? `Der Jahresertrag basiert auf echten Satellitendaten des EU-Programms PVGIS (Photovoltaic Geographical Information System, EU Science Hub) für Ihren genauen Standort — nicht auf einem deutschlandweiten Pauschalwert. PVGIS rechnet dabei mit ${PVGIS_SYSTEM_LOSS}% Systemverlusten (Kabel, Wechselrichter, Verschmutzung, Temperatur).`
                : `Ohne erkannte PLZ verwenden wir einen Schätzwert von ~950 kWh Jahresertrag pro kWp — der bundesweite Durchschnitt. Geben Sie Ihre PLZ ein, um stattdessen echte PVGIS-Satellitendaten für Ihren Standort zu nutzen.`}
            </p>
            <p style={{ margin: "8px 0" }}>
              {dachform === "Flachdach"
                ? `Für die Anlagengröße rechnen wir auf dem Flachdach mit ca. ${M2_PRO_KWP_FLACHDACH} m² Dachfläche pro kWp Modulleistung — deutlich mehr als die ca. ${M2_PRO_KWP} m²/kWp auf dem Schrägdach, weil aufgeständerte Module zur Verschattungsvermeidung Reihenabstand brauchen.`
                : `Für die Anlagengröße rechnen wir mit ca. ${M2_PRO_KWP} m² Dachfläche pro kWp Modulleistung, abhängig von Ihrer Dachform.`} Ihre geschätzte Autarkie von {result.autarkie}% (Anteil Ihres Verbrauchs, den die Anlage selbst deckt) ergibt sich aus dem Verhältnis von Anlagengröße zu Verbrauch{speicherKwh > 0 ? ` und Ihrer Speicherkapazität von ${speicherKwh} kWh` : ""} — keine feste Pauschale: Eine im Verhältnis zum Verbrauch größere Anlage deckt tendenziell einen größeren Teil davon selbst ab. Wir orientieren uns dabei an den offiziell kommunizierten Spannen von 30–55% ohne und bis zu 85% mit Speicher. {tageszeit && tageszeit.length > 0 && `Zusätzlich fließt ein, dass Sie den Strom überwiegend ${tageszeit.join(", ").toLowerCase()} nutzen — Verbrauch in den Produktionszeiten (Mittag) erhöht den Eigenverbrauch, Abend-/Nachtverbrauch senkt ihn.`} Ihre Ersparnis: Eigenverbrauch zu Ihrem Strompreis von {(STROMPREIS * 100).toFixed(0)} Ct/kWh, der eingespeiste Rest zur aktuellen Einspeisevergütung von {(EINSPEISE * 100).toFixed(1)} Ct/kWh.
            </p>
            <p style={{ margin: "8px 0" }}>
              Die 25-Jahres-Prognose berücksichtigt {(DEGRADATION_PRO_JAHR * 100).toFixed(1)}% Ertragsverlust pro Jahr durch Moduldegradation, laufende Betriebskosten von ca. {(WARTUNG_PROZENT_PRO_JAHR * 100).toFixed(0)}% der Investitionssumme pro Jahr sowie einen einmaligen Wechselrichter-Austausch (ca. {Math.round(wechselrichterKosten(result.kwp)).toLocaleString("de-DE")} € nach 12–15 Jahren). Der Jahres-Ersparnis-Wert oben rechnet mit dem heutigen Strompreis; nur die 25-Jahres-Zahl unterstellt zusätzlich vorsichtig eine Strompreissteigerung von {(STROMPREIS_STEIGERUNG_PRO_JAHR * 100).toFixed(0)}%/Jahr.
            </p>
          </div>
        </details>
      )}

      {/* Urgency + Monthly savings */}
      <div style={{ background: theme.color.accentSubtle, border: `1.5px solid ${theme.color.accent}`, borderRadius: theme.radius.lg, padding: "16px 18px", marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: theme.color.accentHover, marginBottom: 4 }}>
          Sie könnten jeden Monat ca. {Math.round(result.jahresErsparnis / 12).toLocaleString("de-DE")} € sparen
        </div>
        <div style={{ fontSize: 13, color: theme.color.accentHover }}>
          Je früher Sie starten, desto mehr sparen Sie. Lassen Sie sich jetzt unverbindlich beraten.
        </div>
      </div>
    </>
  );
}
