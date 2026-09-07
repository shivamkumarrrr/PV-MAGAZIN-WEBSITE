export async function getCity(plzInput) {
  const clean = plzInput.trim().replace(/\D.*$/, "").trim();
  if (clean.length !== 5) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&postalcode=${clean}&country=Germany&limit=1`,
      { headers: { "Accept-Language": "de", "User-Agent": "PV-Content-Hub/1.0" } }
    );
    const data = await res.json();
    if (data?.[0]) {
      const parts = data[0].display_name.split(",");
      return parts[0].trim();
    }
  } catch {}
  return null;
}

export async function getCoords(plzInput) {
  const clean = plzInput.trim().replace(/\D.*$/, "").trim();
  if (clean.length !== 5) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&postalcode=${clean}&country=Germany&limit=1`,
      { headers: { "Accept-Language": "de", "User-Agent": "PV-Content-Hub/1.0" } }
    );
    const data = await res.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch {}
  return null;
}

export async function searchPlz(query) {
  const clean = query.trim();
  if (clean.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}, Germany&limit=5`,
      { headers: { "Accept-Language": "de", "User-Agent": "PV-Content-Hub/1.0" } }
    );
    const data = await res.json();
    return data.map(d => ({
      label: d.display_name.split(",").shift().trim(),
      postalcode: d.postcode,
      lat: parseFloat(d.lat),
      lon: parseFloat(d.lon),
    }));
  } catch {
    return [];
  }
}
