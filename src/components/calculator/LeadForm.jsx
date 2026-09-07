import { useState } from "react";
import theme from "../../theme.js";
import { siteConfig } from "../../config.js";
import { IconCheck, IconCalendar, IconMail, IconHouse, IconLoader, IconLock } from "../Icons.jsx";

function beschreibeEauto(eauto, eautoProfil) {
  if (eauto === "ja") return `Ja (${eautoProfil})`;
  if (eauto === "geplant") return "Geplant";
  return "Nein";
}
function beschreibeWaermepumpe(waermepumpe) {
  if (waermepumpe === "ja") return "Ja";
  if (waermepumpe === "geplant") return "Geplant";
  return "Nein";
}
function beschreibeTageszeiten(tageszeit) {
  return tageszeit && tageszeit.length ? tageszeit.join(", ") : "Nicht angegeben";
}

export default function LeadForm({
  result,
  displayLocation,
  resolvedCity,
  dach,
  dachform,
  ausrichtung,
  neigung,
  speicherKwh,
  eauto,
  eautoProfil,
  waermepumpe,
  tageszeit,
  plz,
  onRestart,
}) {
  const [showForm, setShowForm] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", telefon: "", nachricht: "" });
  const updateForm = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const submitForm = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setFormSending(true);
    setFormError(null);

    const leadData = {
      name: form.name,
      email: form.email,
      telefon: form.telefon || "nicht angegeben",
      nachricht: form.nachricht || "keine",
      plz: displayLocation || plz,
      anlagengroesse: `${result.kwp} kWp`,
      jahresertrag: `${result.jahresertrag.toLocaleString("de-DE")} kWh`,
      jahresersparnis: `${result.jahresErsparnis.toLocaleString("de-DE")} €`,
      amortisation: `${result.amortisation} Jahre`,
      dachflaeche: `${dach} m²`,
      dachform,
      ausrichtung,
      neigung,
      speicher: speicherKwh > 0 ? `Ja, ${speicherKwh} kWh` : "Nein",
      eauto: beschreibeEauto(eauto, eautoProfil),
      waermepumpe: beschreibeWaermepumpe(waermepumpe),
      tageszeiten: beschreibeTageszeiten(tageszeit),
      datenquelle: result.dataSource || "Schätzung",
    };

    try {
      let success = false;
      const { lead } = siteConfig;

      if (lead.mode === "web3forms" && lead.web3formsKey) {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_key: lead.web3formsKey, subject: `Neuer PV-Lead: ${form.name} (${displayLocation || "unbekannt"})`, ...leadData }),
        });
        const data = await res.json();
        success = data.success;
      } else if (lead.mode === "formspree" && lead.formspreeId) {
        const res = await fetch(`https://formspree.io/f/${lead.formspreeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
        });
        success = res.ok;
      } else if (lead.mode === "webhook" && lead.webhookUrl) {
        const res = await fetch(lead.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData),
        });
        success = res.ok;
      } else {
        await new Promise((r) => setTimeout(r, 800));
        success = true;
      }

      if (success) {
        setFormSent(true);
      } else {
        setFormError("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
      }
    } catch {
      setFormError("Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.");
    }
    setFormSending(false);
  };

  return (
    <>
      {formSent ? (
        <div style={{ background: theme.color.successSubtle, border: `2px solid ${theme.color.success}`, borderRadius: theme.radius.lg, padding: "28px 20px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ color: theme.color.success, marginBottom: 10, display: "flex", justifyContent: "center" }}><IconCheck size={34} /></div>
          <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.success, marginBottom: 6 }}>Vielen Dank, {form.name.split(" ")[0]}!</div>
          <div style={{ fontSize: 14, color: theme.color.success, lineHeight: 1.6 }}>
            Ihre Anfrage wurde erfolgreich übermittelt. Ein Fachberater aus unserem Partnernetzwerk wird sich innerhalb von 24 Stunden bei Ihnen melden.
          </div>
          <div style={{ marginTop: 16, padding: "10px 16px", background: theme.color.successSubtle, borderRadius: 8, fontSize: 12, color: theme.color.success, display: "inline-block" }}>
            Ihre Berechnung: {result.kwp} kWp Anlage · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr Ersparnis
          </div>
        </div>
      ) : showCalendly ? (
        <div style={{ background: theme.color.white, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: "20px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>
            Beratungstermin buchen
          </div>
          <div style={{ fontSize: 13, color: theme.color.textSecondary, marginBottom: 16 }}>
            Wählen Sie einen Termin — ein Fachberater bespricht Ihre Berechnung persönlich mit Ihnen.
          </div>
          <div style={{ background: theme.color.bg, borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: theme.color.textSecondary, lineHeight: 1.6 }}>
            Ihre Berechnung wird mitgeteilt: {result.kwp} kWp · {result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr{displayLocation ? ` · ${displayLocation}` : ""}
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${theme.color.border}`, height: 500, marginBottom: 14 }}>
            <iframe src={`${siteConfig.contact.calendlyUrl}?hide_gdpr_banner=1&primary_color=${theme.color.accent.slice(1)}`} width="100%" height="100%" style={{ border: 0, minHeight: 500 }} title="Beratungstermin buchen" />
          </div>
          <button onClick={() => setShowCalendly(false)} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", color: theme.color.textMuted, fontSize: 13, cursor: "pointer" }}>
            ← Zurück zum Ergebnis
          </button>
        </div>
      ) : showForm ? (
        <div style={{ background: theme.color.white, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: "20px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>
            Kostenloses Angebot erhalten
          </div>
          <div style={{ fontSize: 13, color: theme.color.textSecondary, marginBottom: 16 }}>
            Ein Fachbetrieb aus unserem bundesweiten Partnernetzwerk erstellt Ihnen ein unverbindliches Angebot basierend auf Ihrer Berechnung.
          </div>

          {[
            { key: "name", label: "Name *", placeholder: "Max Mustermann", type: "text" },
            { key: "email", label: "E-Mail *", placeholder: "max@beispiel.de", type: "email" },
            { key: "telefon", label: "Telefon (optional)", placeholder: "0681 123 456", type: "tel" },
          ].map((f) => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label htmlFor={`lead-${f.key}`} style={{ display: "block", fontSize: 12, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>{f.label}</label>
              <input id={`lead-${f.key}`} type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={(e) => updateForm(f.key, e.target.value)} style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: `1.5px solid ${theme.color.border}`, fontSize: 14, color: theme.color.textPrimary, outline: "none", boxSizing: "border-box", transition: "border 0.15s" }} onFocus={(e) => (e.target.style.borderColor = theme.color.accent)} onBlur={(e) => (e.target.style.borderColor = theme.color.border)} />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="lead-nachricht" style={{ display: "block", fontSize: 12, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>Nachricht (optional)</label>
            <textarea id="lead-nachricht" placeholder="z.B. Ich möchte auch eine Wallbox installieren..." value={form.nachricht} onChange={(e) => updateForm("nachricht", e.target.value)} rows={3} style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: `1.5px solid ${theme.color.border}`, fontSize: 14, color: theme.color.textPrimary, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} onFocus={(e) => (e.target.style.borderColor = theme.color.accent)} onBlur={(e) => (e.target.style.borderColor = theme.color.border)} />
          </div>

          <div style={{ background: theme.color.bg, borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: theme.color.textSecondary, lineHeight: 1.6 }}>
            Ihre Berechnung wird mitgeschickt: {result.kwp} kWp · {result.jahresertrag.toLocaleString("de-DE")} kWh/Jahr · {result.jahresErsparnis.toLocaleString("de-DE")} €/Jahr Ersparnis{displayLocation ? ` · ${displayLocation}` : ""}
          </div>

          <button onClick={submitForm} disabled={!form.name.trim() || !form.email.trim() || formSending} style={{ width: "100%", padding: "16px", background: formSending ? theme.color.textMuted : form.name.trim() && form.email.trim() ? theme.color.accent : theme.color.border, border: "none", borderRadius: theme.radius.md, color: form.name.trim() && form.email.trim() ? theme.color.white : theme.color.textMuted, fontSize: 15, fontWeight: 600, cursor: form.name.trim() && form.email.trim() && !formSending ? "pointer" : "default", transition: "background-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {formSending && <IconLoader size={16} />}
            {formSending ? "Wird gesendet..." : "Angebot anfordern — kostenlos & unverbindlich"}
          </button>

          {formError && (
            <div style={{ textAlign: "center", fontSize: 13, color: theme.color.danger, marginTop: 8, padding: "8px 12px", background: theme.color.dangerSubtle, borderRadius: 8 }}>
              {formError}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 11, color: theme.color.textMuted, marginTop: 8, lineHeight: 1.5 }}>
            <IconLock size={13} /> Ihre Angaben gehen ausschließlich an den Fachbetrieb, der Ihr Angebot erstellt — kein Weiterverkauf an Dritte.
          </div>

          <button onClick={() => setShowForm(false)} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", color: theme.color.textMuted, fontSize: 13, cursor: "pointer", marginTop: 8 }}>
            ← Zurück zum Ergebnis
          </button>
        </div>
      ) : (
        <div>
          <button onClick={() => setShowCalendly(true)} style={{ width: "100%", padding: "18px", background: theme.color.accent, border: "none", borderRadius: theme.radius.lg, color: theme.color.white, fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 10, transition: "background-color 0.15s, transform 0.1s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.color.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = theme.color.accent; e.currentTarget.style.transform = "translateY(0)"; }}>
            <IconCalendar size={17} /> Beratungstermin buchen
          </button>
          <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: "14px", background: theme.color.white, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.lg, color: theme.color.textSecondary, fontSize: 14, fontWeight: 500, cursor: "pointer", marginBottom: 10, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <IconMail size={16} /> Angebot per E-Mail anfragen
          </button>
          <div style={{ textAlign: "center", fontSize: 12, color: theme.color.textMuted }}>
            Antwort von einem Fachbetrieb aus unserem Partnernetzwerk, meist innerhalb eines Werktags
          </div>
        </div>
      )}

      {/* Partner network badge */}
      {!formSent && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", background: theme.color.bg, borderRadius: 10, marginBottom: 10 }}>
          <span style={{ color: theme.color.textSecondary, display: "flex" }}><IconHouse size={16} /></span>
          <span style={{ fontSize: 12, color: theme.color.textSecondary }}>
            {resolvedCity ? `Fachbetrieb aus unserem Partnernetzwerk in ${resolvedCity} und Umgebung` : "Fachbetrieb aus unserem bundesweiten Partnernetzwerk"}
          </span>
        </div>
      )}

      <button onClick={onRestart} style={{ width: "100%", padding: "12px", background: "transparent", border: `1.5px solid ${theme.color.border}`, borderRadius: 12, color: theme.color.textSecondary, fontSize: 14, cursor: "pointer" }}>
        Neu berechnen
      </button>
    </>
  );
}
