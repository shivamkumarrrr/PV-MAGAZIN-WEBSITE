import theme from "../../../theme.js";

// Segmented control für 2–3 gegenseitig exklusive Zustände (z.B. "Nein/Ja/Geplant").
// options: [{ value, label, icon? }]; onChange liefert den gewählten value.
// labelledBy: id des sichtbaren Labels — ohne sie meldet ein Screenreader die
// Gruppe namenlos.
export default function Segmented({ options, value, onChange, labelledBy }) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      style={{
        display: "flex",
        background: theme.color.bg,
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.pill,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              minHeight: 40,
              padding: "8px 10px",
              borderRadius: theme.radius.pill,
              border: "none",
              background: active ? theme.color.textPrimary : "transparent",
              color: active ? theme.color.white : theme.color.textSecondary,
              fontWeight: 600,
              fontSize: 14,
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
