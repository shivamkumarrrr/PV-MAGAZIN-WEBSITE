import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import theme from "../../theme.js";
import { getCity, getCoords } from "../../lib/plz.js";
import { geocodeAddress } from "../../lib/geocode.js";
import { fetchPVGIS, PVGIS_ASPECT, PVGIS_ANGLE } from "../../lib/pvgis.js";
import { calculate, computeKwp, computeGesamtVerbrauch, HAUSHALT, SPEICHER_KWH_PRO_1000_VERBRAUCH } from "../../lib/calculate.js";
import StepStandort from "./steps/StepStandort.jsx";
import StepDach from "./steps/StepDach.jsx";
import StepVerbrauch from "./steps/StepVerbrauch.jsx";
import StepSpeicher from "./steps/StepSpeicher.jsx";
import ResultScreen from "./ResultScreen.jsx";
import Layout from "./Layout.jsx";
import LivePanel from "./LivePanel.jsx";
import { IconMapPin, IconRuler, IconSun, IconBolt, IconBattery } from "../Icons.jsx";

export default function Wizard() {
  const [step, setStep] = useState(0);
  // NICHTS ist vorausgewählt (Nutzervorgabe, September 2026). Vorher standen
  // Satteldach, Süd, mittlere Neigung, 4 Personen und "kein E-Auto" als
  // orange markierte Auswahl da, bevor der Besucher irgendetwas angeklickt
  // hatte. Zwei Probleme: Er hält die Vorauswahl leicht für seine eigene
  // Angabe, und die Live-Vorschau zeigte eine fertige Ersparnis für ein Haus,
  // das nie jemand beschrieben hat.
  //
  // Der Schieberegler für die Dachfläche ist die Ausnahme: Ein Regler ohne
  // Wert hat keine Position. Er startet bei 60 m², zählt aber nicht als
  // getroffene Entscheidung (siehe `angabenVollstaendig` unten).
  const [dach, setDach] = useState(60);
  const [ausrichtung, setAusrichtung] = useState(null);
  const [neigung, setNeigung] = useState(null);
  const [haushalt, setHaushalt] = useState(null);
  const [verbrauch, setVerbrauch] = useState(0);
  const [speicherKwh, setSpeicherKwh] = useState(0);
  // 3-Zustände: "nein" | "ja" | "geplant" — "geplant" zählt nicht in die
  // Berechnung. `null` = noch nicht beantwortet und rechnet wie "nein".
  const [eauto, setEauto] = useState(null);
  const [waermepumpe, setWaermepumpe] = useState(null);
  const [eautoProfil, setEautoProfil] = useState("Hauptwagen");
  const [tageszeit, setTageszeit] = useState([]);
  const [plz, setPlz] = useState("");
  const [address, setAddress] = useState("");
  const [dachform, setDachform] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [animDir, setAnimDir] = useState("right");
  const [animKey, setAnimKey] = useState(0);
  // Schritte mit Sub-Screens (Dach, Verbrauch): der übergeordnete "Weiter →"
  // ist erst freigeschaltet, wenn der Sub-Flow den letzten Screen erreicht
  // hat (one decision per screen) — die Steps melden das über onReadyChange.
  const [stepReady, setStepReady] = useState(false);
  const SUB_FLOW_STEPS = [1, 2];
  // Sub-Screen-Position pro Sub-Flow-Schritt (Dach=1, Verbrauch=2): hochgezogen,
  // damit beim Zurück-/Weiter-Navigieren zwischen den Hauptschritten die Stelle
  // im Sub-Flow erhalten bleibt statt wieder vorne zu starten.
  const [subIndex, setSubIndex] = useState({ 1: 0, 2: 0 });
  // Ref auf den SubFlow des aktuell sichtbaren Schritts — der Wizard nutzt
  // dessen `back()`, um innerhalb eines Sub-Flows einen Screen zurückzugehen
  // (inkl. Timer-Cleanup des Auto-Advance).
  const subFlowRef = useRef(null);
  const [pvgisData, setPvgisData] = useState(null);
  const [pvgisLoading, setPvgisLoading] = useState(false);
  // Incremented on every successfully loaded PVGIS result — LivePanel uses it
  // as flashKey to pulse when a NEW location's data has finished calculating.
  const [pvgisVersion, setPvgisVersion] = useState(0);
  // Precise coordinates from clicking/dragging the marker on the map,
  // overriding the coarse PLZ-prefix center used by default. Stored together
  // with the PLZ it was captured for, so a changed PLZ immediately invalidates
  // it during render — no separate reset-effect needed.
  const [manualCoords, setManualCoords] = useState(null); // { lat, lon, plz }

  // Synchron aus der statischen PLZ-Tabelle (siehe plz.js) — kein Netzwerk-
  // Aufruf und damit kein Effekt/Race mehr für die reine PLZ-Auflösung.
  const plzCoords = useMemo(() => getCoords(plz), [plz]);
  const resolvedCity = useMemo(() => getCity(plz), [plz]);

  const coords = manualCoords && manualCoords.plz === plz ? manualCoords : plzCoords;
  const displayLocation = resolvedCity ? `${plz} ${resolvedCity}` : plz;

  // Requests can race (PLZ or marker changed while a PVGIS call is in flight).
  // Each call takes a fresh sequence number; a slower older response must not
  // overwrite the result of the newest request.
  const pvgisReqSeq = useRef(0);

  const loadPVGIS = useCallback(async () => {
    const seq = ++pvgisReqSeq.current;
    if (!coords) { setPvgisData(null); setPvgisLoading(false); return; }
    const angle = PVGIS_ANGLE[neigung] || 30;
    const aspect = PVGIS_ASPECT[ausrichtung] ?? 0;
    setPvgisLoading(true);
    const data = await fetchPVGIS(coords.lat, coords.lon, 1, angle, aspect);
    if (seq !== pvgisReqSeq.current) return;
    setPvgisData(data);
    setPvgisVersion((v) => v + 1);
    setPvgisLoading(false);
  }, [coords, neigung, ausrichtung]);

  // Debounced statt bei jeder Ziffer/jedem Zeichen: verhindert Anfragen-Spam
  // und die Race-Conditions, die vorher auftraten wenn PLZ (oder die davon
  // abgeleiteten coords) schnell hintereinander wechselten. loadPVGIS() in
  // den Deps sorgt dafür, dass auch ein durch Adress-Geocoding (unten) oder
  // Marker-Drag geänderter coords-Wert nach der Pause automatisch neu lädt.
  // Die Startseite schickt eine bereits eingegebene PLZ als `?plz=` mit, damit
  // der Besucher sie nicht zweimal tippt. Bewusst in einem Effekt statt als
  // useState-Initialwert: Astro rendert diese Insel serverseitig vor, dort gibt
  // es kein `location` — ein Initialwert aus der URL ergäbe eine
  // Hydrations-Abweichung zwischen Server- und Client-Markup.
  useEffect(() => {
    const ausUrl = new URLSearchParams(window.location.search).get("plz");
    if (!ausUrl) return;
    const ziffern = ausUrl.replace(/\D/g, "").slice(0, 5);
    if (ziffern.length === 5) setPlz(ziffern);
  }, []);

  const pvgisDebounceRef = useRef(null);
  useEffect(() => {
    if (pvgisDebounceRef.current) clearTimeout(pvgisDebounceRef.current);
    if (plz.length !== 5) return;
    pvgisDebounceRef.current = setTimeout(() => loadPVGIS(), 800);
    return () => clearTimeout(pvgisDebounceRef.current);
  }, [plz, loadPVGIS]);

  // Straße+Hausnummer → Nominatim-Geocoding mit der KOMBINIERTEN Adresse
  // (präziser als der PLZ-Regionsmittelpunkt). 800 ms nach dem letzten
  // Tastendruck in PLZ ODER Straße, nicht pro Zeichen. Eigener State-Pfad
  // wie beim manuellen Marker-Drag: setManualCoords → coords ändert sich →
  // der Effekt oben lädt PVGIS automatisch neu, keine doppelte Logik nötig.
  // Kein Treffer/Netzwerkfehler → manualCoords bleibt unverändert, coords
  // fällt still auf den PLZ-Wert zurück (kein Error-State). Das Adressfeld
  // war vorher reine Deko: es wurde erhoben, aber nie ausgewertet.
  const geoDebounceRef = useRef(null);
  useEffect(() => {
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    if (plz.length !== 5 || address.trim().length <= 3) return;
    geoDebounceRef.current = setTimeout(() => {
      geocodeAddress(address.trim(), plz, resolvedCity).then((geo) => {
        if (geo) setManualCoords({ lat: geo.lat, lon: geo.lon, plz });
      });
    }, 800);
    return () => clearTimeout(geoDebounceRef.current);
  }, [plz, address, resolvedCity]);

  // Standort-Schritt: eine vollständige PLZ ist Pflicht, bevor es weitergeht —
  // ohne PLZ landet man nur beim standortunabhängigen Schätzwert statt echten
  // PVGIS-Daten. War vorher nicht gegated (Bug): der "Weiter"-Button war auf
  // Schritt 0 immer aktiv, unabhängig vom PLZ-Feld.
  useEffect(() => {
    if (step === 0) setStepReady(plz.length === 5);
  }, [step, plz]);

  const goStep = (newStep) => {
    setAnimDir(newStep > step ? "right" : "left");
    setAnimKey((k) => k + 1);
    setStep(newStep);
    // Optimistischer Default; für Schritt 0 (PLZ-Pflicht) und die Sub-Flow-
    // Schritte korrigiert der jeweilige useEffect das direkt danach anhand
    // des echten Zustands — hier lieber zu vorsichtig (false) als kurz einen
    // Button zeigen, der es noch nicht sein darf.
    setStepReady(newStep !== 0 && !SUB_FLOW_STEPS.includes(newStep));
  };

  const goBack = () => {
    if (SUB_FLOW_STEPS.includes(step) && subIndex[step] > 0) {
      subFlowRef.current?.back();
    } else {
      goStep(step - 1);
    }
  };

  const goResult = () => {
    setAnimDir("right");
    setAnimKey((k) => k + 1);
    setShowResult(true);
  };

  const restart = () => {
    setShowResult(false);
    setStep(0);
  };

  const handleHaushalt = (label) => {
    setHaushalt(label);
    const h = HAUSHALT.find((x) => x.label === label);
    if (h) setVerbrauch(h.kwh);
  };

  const gesamtVerbrauch = computeGesamtVerbrauch(verbrauch, eauto, waermepumpe, eautoProfil);
  const { kwp } = computeKwp(dach, dachform);
  const speicherVorschlagKwh = Math.round(gesamtVerbrauch / 1000 * SPEICHER_KWH_PRO_1000_VERBRAUCH * 2) / 2;

  const result = calculate(dach, ausrichtung, neigung, verbrauch, speicherKwh, eauto, waermepumpe, pvgisData, dachform, eautoProfil, tageszeit);

  // Ab wann die Live-Vorschau echte Zahlen zeigen darf. Ohne Dachform greift
  // computeKwp() auf einen Mittelwert zurück und ohne Verbrauch ist die
  // Autarkie nicht definiert — beides ergäbe eine plausibel aussehende Zahl
  // für Angaben, die niemand gemacht hat. Bis dahin steht in der Vorschau,
  // was noch fehlt.
  const angabenVollstaendig = Boolean(dachform) && verbrauch > 0;

  const steps = [
    {
      title: "Ihr Standort",
      sub: "Wo soll die Anlage installiert werden?",
      content: (
        <StepStandort
          plz={plz} setPlz={setPlz}
          address={address} setAddress={setAddress}
          resolvedCity={resolvedCity}
          pvgisLoading={pvgisLoading} pvgisData={pvgisData}
          coords={coords}
          onLocationChange={(lat, lon) => setManualCoords({ lat, lon, plz })}
        />
      ),
    },
    {
      title: "Ihr Dach",
      sub: "Dachform, Fläche, Ausrichtung und Neigung",
      content: (
        <StepDach
          dachform={dachform} setDachform={setDachform}
          dach={dach} setDach={setDach}
          ausrichtung={ausrichtung} setAusrichtung={setAusrichtung}
          neigung={neigung} setNeigung={setNeigung}
          onReadyChange={setStepReady}
          subFlowIndex={subIndex[1]}
          onSubFlowIndexChange={(i) => setSubIndex((s) => ({ ...s, 1: i }))}
          subFlowRef={subFlowRef}
        />
      ),
    },
    {
      title: "Ihr Stromverbrauch",
      sub: "Haushaltsgröße, Verbraucher und wann Sie Strom nutzen",
      content: (
        <StepVerbrauch
          haushalt={haushalt} onHaushaltChange={handleHaushalt}
          verbrauch={verbrauch} setVerbrauch={setVerbrauch} setHaushalt={setHaushalt}
          eauto={eauto} setEauto={setEauto}
          eautoProfil={eautoProfil} setEautoProfil={setEautoProfil}
          waermepumpe={waermepumpe} setWaermepumpe={setWaermepumpe}
          tageszeit={tageszeit} setTageszeit={setTageszeit}
          onReadyChange={setStepReady}
          subFlowIndex={subIndex[2]}
          onSubFlowIndexChange={(i) => setSubIndex((s) => ({ ...s, 2: i }))}
          subFlowRef={subFlowRef}
        />
      ),
    },
    {
      title: "Stromspeicher",
      sub: "Mehr Eigenverbrauch durch Batteriespeicher",
      content: (
        <StepSpeicher
          speicherKwh={speicherKwh} setSpeicherKwh={setSpeicherKwh}
          kwp={kwp} gesamtVerbrauch={gesamtVerbrauch}
          vorschlagKwh={speicherVorschlagKwh}
          tageszeit={tageszeit}
        />
      ),
    },
  ];

  const contextItems = [
    { icon: <IconMapPin size={15} />, label: "Standort", value: displayLocation || "–" },
    { icon: <IconRuler size={15} />, label: "Dachfläche", value: dachform ? `${dach} m²` : "–" },
    { icon: <IconSun size={15} />, label: "Anlage", value: dachform ? `${kwp} kWp` : "–" },
    { icon: <IconBolt size={15} />, label: "Verbrauch", value: gesamtVerbrauch > 0 ? `${gesamtVerbrauch.toLocaleString("de-DE")} kWh` : "–" },
    { icon: <IconBattery size={15} />, label: "Speicher", value: speicherKwh > 0 ? `${speicherKwh} kWh` : "–" },
  ];

  if (showResult) {
    return (
      <ResultScreen
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
        onRestart={restart}
      />
    );
  }

  // Mitlaufende Ergebniszeile für schmale Bildschirme. Zeigt genau die zwei
  // Zahlen, die sich mit jeder Eingabe ändern und über die Entscheidung
  // tragen — mehr passt nicht auf 360px, ohne dass die Leiste zum zweiten
  // Panel wird.
  const mobileBar = (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: theme.color.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
          Ersparnis pro Jahr
        </div>
        {angabenVollstaendig ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: theme.color.accent, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(result.jahresErsparnis).toLocaleString("de-DE")} €
            </span>
            <span style={{ fontSize: 12, color: theme.color.textSecondary, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(result.autarkie)} % Autarkie
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: theme.color.textSecondary }}>
            Noch keine Angaben
          </div>
        )}
      </div>
      <a
        href="#live-vorschau"
        style={{
          flexShrink: 0,
          padding: "9px 14px",
          borderRadius: theme.radius.pill,
          border: `1px solid ${theme.color.border}`,
          color: theme.color.textPrimary,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Vorschau
      </a>
    </div>
  );

  return (
    <Layout
      mobileBar={mobileBar}
      main={(
        <div style={{
          background: theme.color.white,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.color.border}`,
          padding: "24px 22px",
        }}>
          {/* Wizard Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: theme.font.display, fontSize: 19, fontWeight: 600, color: theme.color.textPrimary, margin: "0 0 4px" }}>
              Ihr persönlicher Photovoltaik-Rechner
            </h2>
            <p style={{ fontSize: 13, color: theme.color.textMuted, margin: 0 }}>
              4 kurze Schritte — kostenlos und unverbindlich
            </p>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 3,
                    background: i <= step ? theme.color.accent : theme.color.border,
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {["Standort", "Dach", "Verbrauch", "Speicher"].map((label, i) => (
                <div key={label} style={{
                  fontSize: 12,
                  // Inaktive Schritte standen in der Randfarbe (#E1E5E4) und
                  // waren auf Weiß praktisch unlesbar — jetzt die gedämpfte
                  // Textfarbe, die AA erfüllt.
                  color: i <= step ? theme.color.accentHover : theme.color.textMuted,
                  fontWeight: i === step ? 700 : 500,
                  textAlign: "center",
                  flex: 1,
                  transition: "color 0.3s",
                }}>{label}</div>
              ))}
            </div>
          </div>

          {/* Step Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: theme.color.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              Schritt {step + 1} von {steps.length}
            </div>
            <div style={{ fontSize: 21, fontWeight: 700, color: theme.color.textPrimary, lineHeight: 1.25 }}>{steps[step].title}</div>
            <div style={{ fontSize: 14, color: theme.color.textSecondary, lineHeight: 1.45, marginTop: 2 }}>{steps[step].sub}</div>
          </div>

          {/* Step Content */}
          <div
            key={animKey}
            style={{
              minHeight: 280,
              animation: "slideIn 0.3s ease",
            }}
          >
            <style>{`
              @keyframes slideIn {
                from { opacity: 0; transform: translateX(${animDir === "right" ? "30px" : "-30px"}); }
                to { opacity: 1; transform: translateX(0); }
              }
            `}</style>
            {steps[step].content}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button
                onClick={goBack}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 12,
                  border: `1.5px solid ${theme.color.border}`,
                  background: theme.color.white,
                  color: theme.color.textSecondary,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                ← Zurück
              </button>
            )}
            {/* Bei Sub-Flow-Schritten (Dach, Verbrauch) übernimmt der jeweilige
                Sub-Screen die Navigation (Auto-Advance ODER eigener "Weiter"-
                Button) — der übergeordnete Button hier wird erst sichtbar,
                sobald der Sub-Flow den letzten Screen erreicht hat (stepReady).
                Vorher: der Button war zwar über `stepReady` gesteuert deklariert,
                wurde in diesem JSX aber nie ausgewertet — dadurch war er auf
                JEDEM Sub-Screen sofort klickbar und sprang bei Klick direkt zum
                nächsten Hauptschritt, unabhängig vom Sub-Flow-Fortschritt (auf
                der Dachfläche z.B. zusätzlich zum eigenen ContinueButton sichtbar
                → zwei Buttons mit unterschiedlicher Wirkung).
                Schritt 0 (Standort) ist kein Sub-Flow, wird hier aber genauso
                gegated: stepReady wird erst true, wenn die PLZ vollständig ist
                (siehe eigener useEffect oben). */}
            {((!SUB_FLOW_STEPS.includes(step) && step !== 0) || stepReady) && (
              <button
                onClick={() => {
                  if (step < steps.length - 1) goStep(step + 1);
                  else goResult();
                }}
                style={{
                  flex: step === 0 ? 1 : 2,
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: step === steps.length - 1 ? theme.color.accent : theme.color.textPrimary,
                  color: theme.color.white,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.15s, transform 0.1s",
                }}
                onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
                onMouseUp={(e) => e.target.style.transform = "scale(1)"}
              >
                {step === steps.length - 1 ? "Ergebnis berechnen" : "Weiter →"}
              </button>
            )}
          </div>
        </div>
      )}
      sidebar={(
        <>
          {/* Kontext-Leiste: die bisherigen Eingaben auf einen Blick. Steht
              bewusst IN der rechten Spalte, direkt über der Live-Vorschau —
              nicht mehr über die volle Seitenbreite. Auf Mobile (<960px)
              stapelt sie sich zwischen Wizard-Card und Live-Vorschau. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {contextItems.map((c) => (
                <div key={c.label} style={{
                  flexShrink: 0,
                  minWidth: 92,
                  flex: "1 1 auto",
                  padding: "7px 10px",
                  background: theme.color.white,
                  border: `1px solid ${theme.color.border}`,
                  borderRadius: 10,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: theme.color.textMuted, marginBottom: 2 }}>
                    <span style={{ color: theme.color.textSecondary, display: "flex" }}>{c.icon}</span>
                    {c.label}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.color.textPrimary, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{c.value}</div>
                </div>
              ))}
            </div>
            <LivePanel result={result} speicherKwh={speicherKwh} flashKey={pvgisVersion} bereit={angabenVollstaendig} />
          </div>
        </>
      )}
    />
  );
}
