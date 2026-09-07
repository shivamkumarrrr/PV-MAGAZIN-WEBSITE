import { useState } from "react";
import theme from "../../theme.js";
import Slider from "../calculator/ui/Slider.jsx";
import ContinueButton from "../calculator/ui/ContinueButton.jsx";
import { siteConfig } from "../../config.js";
import { calculateMieterstrom, zuschlagFuer, empfehlungDirektverbrauch } from "../../lib/calculateMieterstrom.js";
import { ERTRAG_PRO_KWP } from "../../lib/calculate.js";

function euro(v) {
  return v.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
}

export default function MieterstromWizard() {
  const [kwp, setKwp] = useState(30);
  const [we, setWe] = useState(8);
  const [teilnahme, setTeilnahme] = useState(0.7);
  const [direktQuote, setDirektQuote] = useState(0.4);
  const [mpPreis, setMpPreis] = useState(0.28);
  const [investition, setInvestition] = useState(33000);

  const [showResult, setShowResult] = useState(false);

  const result = calculateMieterstrom({
    kwp,
    we,
    teilnahmeQuote: teilnahme,
    direktVerbrauchQuote: direktQuote,
    mieterstromPreis: mpPreis,
    investition,
  });

  const restart = () => setShowResult(false);

  if (showResult) {
    return (
      <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", fontFamily: theme.font.family }}>
        <div style={{ background: theme.color.textPrimary, borderRadius: theme.radius.lg, padding: "32px 28px", color: theme.color.white, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, marginBottom: 6 }}>Jährliche Gesamteinnahmen</div>
          <div style={{ fontFamily: theme.font.display, fontSize: 42, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: theme.color.accent }}>
            {euro(result.gesamtEinnahmen)}
          </div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 2 }}>
            {result.kwp.toLocaleString("de-DE")} kWp · {result.we} WE · {result.teilnehmendeWe} teilnehmende Haushalte
          </div>
          <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(255,255,255,0.1)", borderRadius: theme.radius.md, fontSize: 13, opacity: 0.95 }}>
            Amortisation: etwa <strong>{result.amortisation.toLocaleString("de-DE", { maximumFractionDigits: 1 })} Jahre</strong> bei einer Investition von {euro(investition)}
          </div>
        </div>

        <div style={{ background: theme.color.white, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, padding: "18px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Mieterstromerlös</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{euro(result.erloesMieterstrom)}</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>{result.mieterstromKwh.toLocaleString("de-DE")} kWh @ {(mpPreis * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} ct</div>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Mieterstromzuschlag</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.success, fontVariantNumeric: "tabular-nums" }}>{euro(result.erloesZuschlag)}</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>{((result.zuschlag) * 100).toLocaleString("de-DE", { maximumFractionDigits: 2 })} ct/kWh</div>
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <div style={{ fontSize: 11, color: theme.color.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Einspeisung</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums" }}>{euro(result.erloesEinspeisung)}</div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, marginTop: 2 }}>{result.einspeisungKwh.toLocaleString("de-DE")} kWh Überschuss</div>
          </div>
        </div>

        <div
          style={{
            background: result.wohnungenGenug ? theme.color.successSubtle : theme.color.dangerSubtle,
            borderRadius: theme.radius.lg, padding: "16px 18px", marginBottom: 16,
            fontSize: 13, lineHeight: 1.6,
            color: result.wohnungenGenug ? theme.color.success : theme.color.danger,
          }}
        >
          {result.wohnungenGenug
            ? <strong>Passt gut:</strong>
            : <strong>Achtung:</strong>}{" "}
          {result.wohnungenGenug
            ? `Mieterstrom wird ab ca. 6–8 Wohneinheiten wirtschaftlich sinnvoll, weil sich die Fixkosten für Messkonzept und Abrechnung auf mehr Einheiten verteilen.`
            : `Unter ca. 6 Wohneinheiten übersteigen die Fixkosten für Messkonzept, Abrechnung und Lieferantenpflichten oft die Mehreinnahmen. Die Gemeinschaftliche Gebäudeversorgung (§ 42b EnWG) ist hier oft die schlankere Alternative.`}
        </div>

        <div style={{ background: theme.color.bg, borderRadius: theme.radius.lg, padding: "18px 18px", marginBottom: 16, fontSize: 12.5, color: theme.color.textSecondary, lineHeight: 1.65 }}>
          <strong style={{ color: theme.color.textPrimary }}>So entsteht die Zahl:</strong> Der Betreiber erlöst Strom an die Mieter (max. 90 % des Grundversorgertarifs), erhält den Mieterstromzuschlag ({((result.zuschlag) * 100).toLocaleString("de-DE", { maximumFractionDigits: 2 })} ct/kWh nach § 21 EEG) und die Einspeisevergütung für den Überschuss. Die Amortisation ist eine vereinfachte Modellrechnung ohne Betriebskosten, Messwesen und Steuern — erste Orientierung, kein Ersatz für eine Detailplanung.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
          <a href="/rechner/photovoltaik/" style={{ display: "block", textAlign: "center", padding: 14, borderRadius: theme.radius.lg, background: theme.color.accent, color: theme.color.white, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            Zur PV-Rechnung für einzelne Dächer →
          </a>
          {siteConfig.contact.calendlyUrl && (
            <a href={siteConfig.contact.calendlyUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: 14, borderRadius: theme.radius.lg, border: `1.5px solid ${theme.color.border}`, color: theme.color.textSecondary, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Kostenlose Beratung buchen
            </a>
          )}
          <button onClick={restart} style={{ padding: 12, borderRadius: theme.radius.lg, border: "none", background: "transparent", color: theme.color.textMuted, fontSize: 13, cursor: "pointer" }}>
            Neu berechnen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: theme.maxWidth, margin: "0 auto", background: theme.color.white, borderRadius: theme.radius.lg, border: `1px solid ${theme.color.border}`, padding: "24px 22px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>Mieterstromrechner</h2>
        <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>Erste Wirtschaftlichkeits-Einschätzung für PV im Mehrfamilienhaus</p>
      </div>

      <Slider label="Anlagengröße" value={kwp} onChange={setKwp} min={5} max={100} step={1} unit="kWp" />
      <Slider label="Wohneinheiten" value={we} onChange={setWe} min={2} max={60} step={1} unit="WE" />
      <Slider label="Teilnahmequote" value={Math.round(teilnahme * 100)} onChange={(v) => setTeilnahme(v / 100)} min={30} max={100} step={5} unit="%" />
      <Slider label="Direktverbrauchsquote" value={Math.round(direktQuote * 100)} onChange={(v) => setDirektQuote(v / 100)} min={20} max={80} step={5} unit="%" />
      <Slider label="Mieterstrompreis" value={Math.round(mpPreis * 100)} onChange={(v) => setMpPreis(v / 100)} min={20} max={35} step={0.5} unit="ct/kWh" />
      <Slider label="Investition (Gesamt)" value={investition} onChange={setInvestition} min={10000} max={120000} step={1000} unit="€" />

      <p style={{ fontSize: 12, color: theme.color.textMuted, margin: "4px 0 14px" }}>
        Der Mieterstrompreis darf maximal 90 % des örtlichen Grundversorgertarifs
        betragen — realistisch sind 25–30 ct/kWh. Üblich ist eine
        Direktverbrauchsquote von rund 40 % ohne Speicher, 60 % mit Speicher.
      </p>

      <ContinueButton label="Wirtschaftlichkeit berechnen" onClick={() => setShowResult(true)} />
    </div>
  );
}