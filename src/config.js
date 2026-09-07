// Schlanke Konfiguration nur für das, was ResultScreen.jsx tatsächlich liest
// (Lead-Ziel + Calendly). Kein volles Mandanten-System wie im pvrechner-
// Quellprojekt (config.js dort) — dieses Repo hat genau einen Mandanten
// (Photovoltaik Aktuell, ein Produkt der PPC GmbH), kein White-Label.
export const siteConfig = {
  lead: {
    // "webhook" → POST an eigene Vercel-Funktion src/pages/api/lead.ts
    // "web3forms" → Web3Forms-Zugangsschlüssel (kostenlos, 250/mo)
    // "formspree" → Formspree-Kennung (50/mo kostenlos)
    mode: "webhook",
    web3formsKey: "",
    formspreeId: "",
    webhookUrl: "/api/lead",
  },
  contact: {
    calendlyUrl: "https://calendly.com/ppc-beratung/solaranlage",
  },
};
