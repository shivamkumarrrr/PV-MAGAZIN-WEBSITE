import type { APIRoute } from "astro";

export const prerender = false;

interface LeadPayload {
  name?: string;
  email?: string;
  telefon?: string;
  nachricht?: string;
  plz?: string;
  anlagengroesse?: string;
  jahresertrag?: string;
  jahresersparnis?: string;
  amortisation?: string;
  dachflaeche?: string;
  dachform?: string;
  ausrichtung?: string;
  neigung?: string;
  speicher?: string;
  eauto?: string;
  waermepumpe?: string;
  tageszeiten?: string;
  datenquelle?: string;
  [key: string]: unknown;
}

// Leitet den Lead an einen externen Empfänger weiter (CRM, E-Mail-Dienst via
// Webhook, Zapier/Make etc.). Solange LEAD_WEBHOOK_URL (aus .env) nicht gesetzt
// ist, bleibt die Funktion ein reiner Logger — Leads landen dann in den
// Vercel-Funktions-Logs (RUNTIME-Log "pv-lead").
const EXTERNAL_WEBHOOK = import.meta.env.LEAD_WEBHOOK_URL as string | undefined;

// Kleine Whitelist der Felder, die weitergegeben werden — kein Blind-Forward
// des gesamten Bodies (verhindert, dass unbekannte/Spam-Felder durchgereicht
// oder zu große Payloads erzeugt werden).
const ERLAUBTE_FELDER: (keyof LeadPayload)[] = [
  "name", "email", "telefon", "nachricht", "plz", "anlagengroesse",
  "jahresertrag", "jahresersparnis", "amortisation", "dachflaeche",
  "dachform", "ausrichtung", "neigung", "speicher", "eauto", "waermepumpe",
  "tageszeiten", "datenquelle",
];

function bereinige(obj: LeadPayload): LeadPayload {
  const out: LeadPayload = {};
  for (const feld of ERLAUBTE_FELDER) {
    const wert = obj[feld];
    out[feld] = typeof wert === "string" ? wert.trim().slice(0, 2000) : undefined;
  }
  return out;
}

async function weiterleiten(lead: LeadPayload): Promise<void> {
  if (!EXTERNAL_WEBHOOK) return;
  const res = await fetch(EXTERNAL_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!res.ok) {
    // Nur warnen, den Lead selbst nicht als verloren melden — der Client
    // bekam bereits "success". Fehler idealerweise in einem Fehler-Tracker
    // sichtbar machen.
    console.error("pv-lead: Weiterleitung an Webhook fehlgeschlagen", res.status, res.statusText);
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Ungültige Anfrage" }), { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!name || !email) {
    return new Response(JSON.stringify({ error: "Name und E-Mail sind erforderlich" }), { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Ungültige E-Mail-Adresse" }), { status: 400 });
  }

  const lead = bereinige(body);

  // Strukturiert, einzeilig und über den Tag "pv-lead" durchsuchbar loggen.
  // Format: pv-lead | <id> | <name> | <email> | <plz> | <anlagengroesse> | <ip>
  const id = crypto.randomUUID();
  console.log(
    ["pv-lead", id, lead.name, lead.email, lead.plz || "keine PLZ", lead.anlagengroesse || "-", clientAddress || "-"].join(" | ")
  );

  // Ausführlicher Datensatz als separates Log (optionaler Empfänger kann das
  // Ganze später übernehmen, ohne dass der Kurz-Log geändert werden muss).
  console.log("pv-lead-detail", JSON.stringify({ id, ...lead, clientAddress: clientAddress || null, receivedAt: new Date().toISOString() }));

  // Fehler hier darf die Bestätigung gegenüber dem Nutzer nicht blockieren —
  // der Lead ist bereits protokolliert.
  try {
    await weiterleiten(lead);
  } catch (e) {
    console.error("pv-lead: Externe Weiterleitung fehlgeschlagen", e);
  }

  return new Response(JSON.stringify({ success: true, id, message: "Anfrage empfangen" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
