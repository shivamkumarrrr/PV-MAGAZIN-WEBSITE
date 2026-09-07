import theme from "../../theme.js";
import { IconSatellite } from "../Icons.jsx";

export default function Transparency({ result }) {
  if (!result.dataSource?.includes("PVGIS")) return null;
  return (
    <div style={{ textAlign: "center", marginTop: 12, padding: "6px 12px", background: theme.color.successSubtle, borderRadius: 6, fontSize: 11, color: theme.color.success, display: "inline-flex", alignItems: "center", gap: 4, width: "100%", justifyContent: "center" }}>
      <IconSatellite size={13} /> Datenquelle: {result.dataSource}
    </div>
  );
}
