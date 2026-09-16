import theme from "../../../theme.js";

// Segmented control für 2–3 gegenseitig exklusive Zustände (z.B. "Nein/Ja/Geplant").
// options: [{ value, label, icon? }]; onChange liefert den gewählten value.
export default function Segmented({ options, value, onChange }) {
  return (
    <div
      role="radiogroup"
      style={{
        display: "flex",
        background: theme.color.bg,
        border: `1px solid ${theme.color.border}`,
        borderRadius: 10,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "11px 8px",
              borderRadius: 8,
              border: "none",
              background: active ? theme.color.white : "transparent",
              color: active ? theme.color.accentHover : theme.color.textPrimary,
              fontWeight: active ? 700 : 500,
              fontSize: 15,
              lineHeight: 1.3,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
