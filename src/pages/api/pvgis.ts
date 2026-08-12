// Server-seitiger Proxy für die EU-PVGIS-API. Nötig, weil re.jrc.ec.europa.eu
// keinen Access-Control-Allow-Origin-Header sendet — ein direkter Browser-
// fetch() wird per CORS blockiert (im Quellprojekt pvrechner per echtem
// Browser-Test bestätigt: jeder direkte Aufruf schlug lautlos fehl, calculate()
// griff deshalb immer auf die standortunabhängige Schätzung zurück). Diese
// Route läuft on-demand (kein Prerender) über den Vercel-Adapter; der Rest
// der Seite bleibt statisch.
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const peakpower = url.searchParams.get("peakpower") ?? "1";
  const loss = url.searchParams.get("loss") ?? "14";
  const angle = url.searchParams.get("angle") ?? "30";
  const aspect = url.searchParams.get("aspect") ?? "0";

  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: "lat and lon are required" }), { status: 400 });
  }

  const upstreamUrl = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&peakpower=${encodeURIComponent(peakpower)}&loss=${encodeURIComponent(loss)}&angle=${encodeURIComponent(angle)}&aspect=${encodeURIComponent(aspect)}&outputformat=json`;

  try {
    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: "PVGIS upstream error" }), { status: upstream.status });
    }
    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400", // Ertragsdaten ändern sich nicht stündlich
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "PVGIS unreachable" }), { status: 502 });
  }
};
