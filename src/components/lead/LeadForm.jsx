import { useState } from "react";
import theme from "../../theme.js";
import { siteConfig } from "../../config.js";
import { IconCheck, IconCalendar, IconMail, IconLoader, IconLock } from "../Icons.jsx";

// Rechner-unabhängiges Lead-Formular.
//
// Vorher existierte diese Erfassung NUR im Photovoltaik-Rechner
// (components/calculator/LeadForm.jsx) und war fest auf dessen Felder
// verdrahtet. Die zehn übrigen Rechner endeten mit "Alle Rechner im
// Überblick" plus einem externen Calendly-Link — bei einer Seite, die laut
// CLAUDE.md Leadgen betreibt, ging dort jeder Abschluss verloren.
//
// Props:
//   rechner        — Slug des Rechners, landet als Herkunft im Lead
//   zusammenfassung— eine Zeile Klartext ("10 kWp · 9.500 kWh/Jahr"), wird
//                    dem Nutzer gezeigt UND mitgeschickt
//   daten          — flaches Objekt aus dem Lead-Feld-Whitelist von
//                    src/pages/api/lead.ts (siehe dort ERLAUBTE_FELDER)
//   onRestart      — optional, blendet "Neu berechnen" ein
export default function LeadForm({ rechner, zusammenfassung, daten = {}, onRestart }) {
  const [showForm, setShowForm] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", telefon: "", nachricht: "" });
  // Art. 6 Abs. 1 lit. b i.V.m. Art. 13 DSGVO: vor dem Absenden muss klar sein,
  // wer die Daten wofür bekommt.
  const [consent, setConsent] = useState(false);
  // Calendly ist ein US-Drittanbieter — iframe erst nach aktiver zweiter
  // Bestätigung laden (Zwei-Klick-Lösung), nicht schon beim Öffnen des Panels.
  const [calendlyGeladen, setCalendlyGeladen] = useState(false);

  const updateForm = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  const formGueltig = form.name.trim() && form.email.trim() && consent;

  const submitForm = async () => {
    if (!formGueltig) return;
    setFormSending(true);
    setFormError(null);

    const leadData = {
      name: form.name,
      email: form.email,
      telefon: form.telefon || "nicht angegeben",
      nachricht: form.nachricht || "keine",
      rechner,
      zusammenfassung,
      ...daten,
    };

    try {
      let success = false;
      const { lead } = siteConfig;

      if (lead.mode === "web3forms" && lead.web3formsKey) {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_key: lead.web3formsKey, subject: `Neuer Lead (${rechner}): ${form.name}`, ...leadData }),
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

      if (success) setFormSent(true);
      else setFormError("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
    } catch {
      setFormError("Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.");
    }
    setFormSending(false);
  };

  const feldStil = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 8,
    border: `1.5px solid ${theme.color.border}`,
    fontSize: 14,
    color: theme.color.textPrimary,
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.15s",
  };

  if (formSent) {
    return (
      <div style={{ background: theme.color.successSubtle, border: `2px solid ${theme.color.success}`, borderRadius: theme.radius.lg, padding: "28px 20px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ color: theme.color.success, marginBottom: 10, display: "flex", justifyContent: "center" }}><IconCheck size={34} /></div>
        <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.success, marginBottom: 6 }}>Vielen Dank, {form.name.split(" ")[0]}!</div>
        <div style={{ fontSize: 14, color: theme.color.success, lineHeight: 1.6 }}>
          Ihre Anfrage ist bei uns eingegangen. Wir melden uns persönlich bei Ihnen und besprechen Ihre Berechnung.
        </div>
        {zusammenfassung && (
          <div style={{ marginTop: 16, padding: "10px 16px", background: theme.color.successSubtle, borderRadius: 8, fontSize: 12, color: theme.color.success, display: "inline-block" }}>
            Ihre Berechnung: {zusammenfassung}
          </div>
        )}
      </div>
    );
  }

  if (showCalendly) {
    return (
      <div style={{ background: theme.color.white, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: "20px 18px", marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>Beratungstermin buchen</div>
        <div style={{ fontSize: 13, color: theme.color.textSecondary, marginBottom: 16 }}>
          Wählen Sie einen Termin — wir besprechen Ihre Berechnung persönlich mit Ihnen.
        </div>
        {zusammenfassung && (
          <div style={{ background: theme.color.bg, borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: theme.color.textSecondary, lineHeight: 1.6 }}>
            Ihre Berechnung wird mitgeteilt: {zusammenfassung}
          </div>
        )}
        {calendlyGeladen ? (
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${theme.color.border}`, height: 500, marginBottom: 14 }}>
            <iframe src={`${siteConfig.contact.calendlyUrl}?hide_gdpr_banner=1&primary_color=${theme.color.accent.slice(1)}`} width="100%" height="100%" style={{ border: 0, minHeight: 500 }} title="Beratungstermin buchen" />
          </div>
        ) : (
          <div style={{ borderRadius: 10, border: `1px solid ${theme.color.border}`, background: theme.color.bg, padding: "22px 18px", marginBottom: 14, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: theme.color.textSecondary, lineHeight: 1.6, margin: "0 0 14px" }}>
              Der Buchungskalender wird von <strong>Calendly LLC</strong> bereitgestellt.
              Beim Laden werden Daten — darunter Ihre IP-Adresse — an Calendly in den
              USA übertragen. Mit dem Klick stimmen Sie dieser Übermittlung zu.{" "}
              <a href="/datenschutz/" target="_blank" rel="noopener noreferrer" style={{ color: theme.color.accent }}>Datenschutzerklärung</a>
            </p>
            <button onClick={() => setCalendlyGeladen(true)} style={{ padding: "12px 22px", borderRadius: theme.radius.md, border: "none", background: theme.color.accent, color: theme.color.white, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Kalender laden
            </button>
          </div>
        )}
        <button onClick={() => setShowCalendly(false)} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", color: theme.color.textMuted, fontSize: 13, cursor: "pointer" }}>
          ← Zurück zum Ergebnis
        </button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div style={{ background: theme.color.white, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: "20px 18px", marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: theme.color.textPrimary, marginBottom: 4 }}>Anfrage zu Ihrer Berechnung</div>
        <div style={{ fontSize: 13, color: theme.color.textSecondary, marginBottom: 16 }}>
          Wir melden uns zu Ihrer Berechnung und klären offene Punkte — ohne Verpflichtung Ihrerseits.
        </div>

        {[
          { key: "name", label: "Name *", placeholder: "Vor- und Nachname", type: "text" },
          { key: "email", label: "E-Mail *", placeholder: "name@example.de", type: "email" },
          { key: "telefon", label: "Telefon (optional)", placeholder: "für Rückfragen", type: "tel" },
        ].map((f) => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label htmlFor={`lead-${f.key}`} style={{ display: "block", fontSize: 12, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>{f.label}</label>
            <input
              id={`lead-${f.key}`}
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => updateForm(f.key, e.target.value)}
              style={feldStil}
              onFocus={(e) => (e.target.style.borderColor = theme.color.accent)}
              onBlur={(e) => (e.target.style.borderColor = theme.color.border)}
            />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label htmlFor="lead-nachricht" style={{ display: "block", fontSize: 12, color: theme.color.textSecondary, fontWeight: 500, marginBottom: 4 }}>Nachricht (optional)</label>
          <textarea
            id="lead-nachricht"
            placeholder="Was möchten Sie wissen?"
            value={form.nachricht}
            onChange={(e) => updateForm("nachricht", e.target.value)}
            rows={3}
            style={{ ...feldStil, resize: "vertical", fontFamily: "inherit" }}
            onFocus={(e) => (e.target.style.borderColor = theme.color.accent)}
            onBlur={(e) => (e.target.style.borderColor = theme.color.border)}
          />
        </div>

        {zusammenfassung && (
          <div style={{ background: theme.color.bg, borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: theme.color.textSecondary, lineHeight: 1.6 }}>
            Ihre Berechnung wird mitgeschickt: {zusammenfassung}
          </div>
        )}

        <label htmlFor="lead-consent" style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 14, fontSize: 12, lineHeight: 1.55, color: theme.color.textSecondary, cursor: "pointer" }}>
          <input
            id="lead-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: theme.color.accent, cursor: "pointer" }}
          />
          <span>
            Ich bin damit einverstanden, dass die PPC GmbH meine Angaben und die
            Eckdaten dieser Berechnung verarbeitet, um mich zu meiner Anfrage zu
            kontaktieren. Die Einwilligung kann ich jederzeit formlos widerrufen.
            Näheres in der{" "}
            <a href="/datenschutz/" target="_blank" rel="noopener noreferrer" style={{ color: theme.color.accent }}>Datenschutzerklärung</a>.
          </span>
        </label>

        <button onClick={submitForm} disabled={!formGueltig || formSending} style={{ width: "100%", padding: "16px", background: formSending ? theme.color.textMuted : formGueltig ? theme.color.accent : theme.color.border, border: "none", borderRadius: theme.radius.md, color: formGueltig ? theme.color.white : theme.color.textMuted, fontSize: 15, fontWeight: 600, cursor: formGueltig && !formSending ? "pointer" : "default", transition: "background-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {formSending && <IconLoader size={16} />}
          {formSending ? "Wird gesendet..." : "Anfrage senden"}
        </button>

        {formError && (
          <div style={{ textAlign: "center", fontSize: 13, color: theme.color.danger, marginTop: 8, padding: "8px 12px", background: theme.color.dangerSubtle, borderRadius: 8 }}>
            {formError}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontSize: 11, color: theme.color.textMuted, marginTop: 8, lineHeight: 1.5 }}>
          <IconLock size={13} /> Ihre Angaben werden ausschließlich zur Bearbeitung dieser Anfrage genutzt und nicht an Dritte verkauft.
        </div>

        <button onClick={() => setShowForm(false)} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", color: theme.color.textMuted, fontSize: 13, cursor: "pointer", marginTop: 8 }}>
          ← Zurück zum Ergebnis
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setShowCalendly(true)}
        style={{ width: "100%", padding: "18px", background: theme.color.accent, border: "none", borderRadius: theme.radius.lg, color: theme.color.white, fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 10, transition: "background-color 0.15s, transform 0.1s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.color.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = theme.color.accent; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <IconCalendar size={17} /> Beratungstermin buchen
      </button>
      <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: "14px", background: theme.color.white, border: `1.5px solid ${theme.color.border}`, borderRadius: theme.radius.lg, color: theme.color.textSecondary, fontSize: 14, fontWeight: 500, cursor: "pointer", marginBottom: 10, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <IconMail size={16} /> Anfrage per E-Mail
      </button>
      <div style={{ textAlign: "center", fontSize: 12, color: theme.color.textMuted }}>
        Beide Wege sind kostenlos und unverbindlich
      </div>
      {onRestart && (
        <button onClick={onRestart} style={{ width: "100%", marginTop: 12, padding: "12px", background: "transparent", border: `1.5px solid ${theme.color.border}`, borderRadius: 12, color: theme.color.textSecondary, fontSize: 14, cursor: "pointer" }}>
          Neu berechnen
        </button>
      )}
    </div>
  );
}
