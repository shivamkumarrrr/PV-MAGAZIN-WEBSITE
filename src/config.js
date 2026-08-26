// Schlanke Konfiguration nur für das, was ResultScreen.jsx tatsächlich liest
// (Lead-Ziel + Calendly). Kein volles Mandanten-System wie im pvrechner-
// Quellprojekt (config.js dort) — dieses Repo hat genau einen Mandanten
// (Photovoltaik Aktuell, ein Produkt der PPC GmbH), kein White-Label.
export const siteConfig = {
  lead: {
    // "demo" = kein Backend, simuliert Erfolg. Auf "web3forms" | "formspree" |
    // "webhook" umstellen, sobald ein echter Endpunkt feststeht.
    mode: "demo",
    web3formsKey: "",
    formspreeId: "",
    webhookUrl: "",
  },
  contact: {
    calendlyUrl: "https://calendly.com/ppc-beratung/solaranlage",
  },
};
