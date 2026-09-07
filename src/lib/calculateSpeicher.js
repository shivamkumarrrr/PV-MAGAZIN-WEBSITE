// Speicher-Wirtschaftlichkeitsrechnung: "Lohnt sich der Batteriespeicher als
// Erweiterung einer PV-Anlage?" — eigenständiges, bewusst einfacheres Modell
// als calculate.js, das genau EINE Frage beantwortet: Was bringt der Speicher
// ZUSÄTZLICH zur PV-Anlage (in € und Jahren), und kostet er das.
//
// Kernmethode:
//   Amortisation = Speicherinvestition / (Mehr-Eigenverbrauch × Spread)
//   Spread = Strompreis − Einspeisevergütung  (der Mehrwert pro zusätzlich
//            selbst verbrauchter kWh gegenüber der reinen Einspeisung)
//   Mehr-Eigenverbrauch = Autarkiegewinn durch den Speicher × Jahresverbrauch
//
// Der Mehr-Eigenverbrauch kommt aus derselben Autarkie-Kennlinie wie der
// Haupt-Rechner (autarkieSchaetzung in calculate.js) — EINE Quelle der
// Wahrheit, wie es calculateKombi.js und calculateRendite.js ebenfalls
// halten. Vorher rechnete diese Datei linear mit einer eigenen Faustregel
// (200 kWh je nutzbarer Speicher-kWh, rechne24.de 2026). Das ergab bei
// größeren Speichern deutlich andere Zahlen als der Haupt-Rechner — bei
// 10 kWh Speicher 180 statt 115 kWh je kWh, also Faktor 1,57 — weil die
// Faustregel keine Sättigung kennt: ab einer gewissen Größe findet der
// Speicher schlicht keinen zusätzlichen Überschuss mehr zum Zwischenspeichern.
// Die Kennlinie in calculate.js bildet genau diese Sättigung ab (ADAC-Spannen
// 30–55 % ohne, bis 85 % mit Speicher). Die Faustregel bleibt als
// dokumentierter Plausibilitäts-Vergleichswert erhalten (siehe unten), fließt
// aber nicht mehr in die Rechnung ein.
//
// Wichtig (bewusste Botschaft, deckt sich mit 2026er-Marktlage): Speicher
// amortisieren sich mit den aktuellen Preisen/Strompreisen rechnerisch oft
// erst spät in ihrer Lebensdauer oder darüber hinaus. Der praktische
// Zusatznutzen (höhere Autarkie, Unabhängigkeit, Notstrom) bleibt dabei
// bewusst getrennt von der rein wirtschaftlichen Kennzahl.
import {
  STROMPREIS,
  einspeiseStaffel,
  SPEICHER_KOSTEN_PRO_KWH,
  ERTRAG_PRO_KWP,
  autarkieSchaetzung,
} from "./calculate.js";

// Faustregel-Vergleichswert: zusätzlicher jährlicher Eigenverbrauch pro
// nutzbarer kWh Speicherkapazität. Quelle: rechne24.de PV-Speicher-
// Amortisation 2026; Praxisberichte nennen 200–250 kWh/kWh. NICHT mehr Teil
// der Rechnung (siehe Kopfkommentar) — nur noch als Einordnung ausgewiesen,
// damit sichtbar bleibt, wie weit die Kennlinie von der Faustregel abweicht.
export const MEHR_EIGENVERBRAUCH_PRO_KWH = 200;

// Round-Trip-Wirkungsgrad moderner LiFePO₄-Speicher (DC) laut Fraunhofer ISE /
// solaranlage-ratgeber.de 2026: 90–95% Zell-, ~85–90% System-Wirkungsgrad.
// Wird NICHT mehr auf den Mehr-Eigenverbrauch angewendet: die Autarkie-
// Kennlinie stützt sich auf gemessene ADAC-Autarkiegrade realer Anlagen, in
// denen die Systemverluste bereits stecken — ein zweiter Abzug wäre eine
// Doppelzählung. Nur noch als ausgewiesene Geräte-Kennzahl im Ergebnis.
export const SPEICHER_WIRKUNGSGRAD = 0.9;

// Typische technische Lebensdauer eines LiFePO₄-Speichers. Quelle: Fraunhofer
// ISE "Stromgestehungskosten" (Speicher: 15 Jahre), Hersteller-Garantien
// typisch 10–15 Jahre. Wird für die Einordnung "amortisiert sich innerhalb
// der Lebensdauer?" gebraucht.
export const SPEICHER_LEBENSDAUER_JAHRE = 15;

// Empfohlene Speichergröße als Faustregel 1:1 zur PV-Leistung (kWh ≈ kWp).
// Quelle: solaranlage-ratgeber.de 2026 (auch "1 kWh / 1.000 kWh Jahres-"
// "verbrauch" gebräuchlich). Für den Default-Vorschlag im Rechner.
export function empfohleneSpeicherKwh(kwp, jahresverbrauch) {
  const ausKwp = Math.round(kwp);
  const ausVerbrauch = Math.round(jahresverbrauch / 1000);
  return Math.round(Math.max(ausKwp, ausVerbrauch));
}

export function calculateSpeicher(speicherKwh, kwp, jahresverbrauch) {
  const verbrauch = Math.max(0, jahresverbrauch || 0);

  // Autarkiegewinn aus derselben Kennlinie wie der Haupt-Rechner: einmal ohne,
  // einmal mit Speicher. Die Differenz ist der zusätzlich selbst verbrauchte
  // Anteil des Jahresverbrauchs.
  const autarkieOhne = autarkieSchaetzung(kwp, verbrauch, 0);
  const autarkieMit = autarkieSchaetzung(kwp, verbrauch, speicherKwh);
  const autarkieGewinn = Math.max(0, autarkieMit - autarkieOhne);

  // Deckel: Der Speicher kann nur zwischenspeichern, was die Anlage auch
  // erzeugt und ohne ihn eingespeist würde. Ohne diese Grenze könnte ein
  // großer Speicher an einer kleinen Anlage mehr "Mehr-Eigenverbrauch"
  // ausweisen, als überhaupt Überschuss anfällt.
  const jahresertrag = kwp * ERTRAG_PRO_KWP;
  const ueberschussOhneSpeicher = Math.max(0, jahresertrag - verbrauch * autarkieOhne);
  const mehrEigenverbrauch = Math.round(
    Math.min(autarkieGewinn * verbrauch, ueberschussOhneSpeicher)
  );

  const spread = STROMPREIS - einspeiseStaffel(kwp);
  const jahresMehrErsparnis = Math.round(mehrEigenverbrauch * spread);

  const investition = Math.round(speicherKwh * SPEICHER_KOSTEN_PRO_KWH);
  const amortisation = jahresMehrErsparnis > 0
    ? Math.round((investition / jahresMehrErsparnis) * 10) / 10
    : null;

  // Einordnung: amortisiert sich der Speicher innerhalb seiner Lebensdauer?
  const lohntSich = amortisation !== null && amortisation <= SPEICHER_LEBENSDAUER_JAHRE;

  // Nur zur Einordnung im Ergebnis: was die reine Faustregel behaupten würde.
  const faustregelVergleich = Math.round(speicherKwh * MEHR_EIGENVERBRAUCH_PRO_KWH);

  return {
    speicherKwh,
    autarkieOhne,
    autarkieMit,
    autarkieGewinnProzentpunkte: Math.round(autarkieGewinn * 1000) / 10,
    mehrEigenverbrauch,
    mehrEigenverbrauchProKwh: speicherKwh > 0 ? Math.round(mehrEigenverbrauch / speicherKwh) : 0,
    faustregelVergleich,
    spread,
    jahresMehrErsparnis,
    investition,
    amortisation,
    lohntSich,
    empfohlen: empfohleneSpeicherKwh(kwp, jahresverbrauch),
    wirkungsgrad: SPEICHER_WIRKUNGSGRAD,
    lebensdauer: SPEICHER_LEBENSDAUER_JAHRE,
  };
}
