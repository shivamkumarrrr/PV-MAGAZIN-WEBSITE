import theme from "../../theme.js";
import MonthlyChart from "./ui/MonthlyChart.jsx";
import MonthlyBalanceChart from "./ui/MonthlyBalanceChart.jsx";

export default function MonthlyCharts({ result }) {
  return (
    <>
      <MonthlyChart monthly={result.monthly} />
      <MonthlyBalanceChart balance={result.balance} />
      <div
        style={{
          background: theme.color.successSubtle,
          borderRadius: theme.radius.lg,
          padding: "16px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: theme.color.success, fontWeight: 500 }}>Monatliche Ersparnis</div>
          <div style={{ fontSize: 11, color: theme.color.success }}>Durchschnitt über das Jahr</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: theme.color.success }}>
          {result.monatlich} €<span style={{ fontSize: 13, fontWeight: 500 }}>/Monat</span>
        </div>
      </div>
    </>
  );
}
