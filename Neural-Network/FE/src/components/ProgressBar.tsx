import React from "react";

interface Props {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  running: boolean;
}

export const ProgressBar: React.FC<Props> = ({
  epoch,
  totalEpochs,
  loss,
  accuracy,
  running,
}) => {
  const pct = totalEpochs > 0 ? (epoch / totalEpochs) * 100 : 0;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "16px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#888",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {running ? "Training…" : epoch > 0 ? "Complete" : "Ready"}
        </span>
        <span
          style={{ fontFamily: "monospace", fontSize: 12, color: "#00ddb4" }}
        >
          {epoch} / {totalEpochs || "—"} epochs
        </span>
      </div>

      <div
        style={{
          height: 6,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 3,
          overflow: "hidden",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #00ddb4, #7b2fff)",
            borderRadius: 3,
            transition: "width 0.4s ease",
            boxShadow: "0 0 8px rgba(0,221,180,0.6)",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        <Stat
          label="Loss"
          value={loss > 0 ? loss.toFixed(4) : "—"}
          color="#ff9f5f"
        />
        <Stat
          label="Accuracy"
          value={accuracy > 0 ? `${(accuracy * 100).toFixed(1)}%` : "—"}
          color="#00ddb4"
        />
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div>
    <div
      style={{ fontSize: 10, color: "#666", letterSpacing: 1, marginBottom: 2 }}
    >
      {label.toUpperCase()}
    </div>
    <div
      style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color }}
    >
      {value}
    </div>
  </div>
);
