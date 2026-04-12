import React, { useState } from "react";
import type { TrainingConfig } from "../types";

interface Props {
  onStart: (cfg: TrainingConfig) => void;
  onStop: () => void;
  running: boolean;
}

export const ConfigPanel: React.FC<Props> = ({ onStart, onStop, running }) => {
  const [epochs, setEpochs] = useState(8);
  const [layers, setLayers] = useState("128,64");
  const [lr, setLr] = useState(0.001);
  const [batchSize, setBatchSize] = useState(256);
  const [somInterval, setSomInterval] = useState(1);

  const handleStart = () => {
    const hidden_sizes = layers
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
    onStart({
      epochs,
      hidden_sizes,
      lr,
      batch_size: batchSize,
      som_interval: somInterval,
    });
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "20px 24px",
      }}
    >
      <h3
        style={{
          margin: "0 0 18px",
          fontSize: 13,
          letterSpacing: 2,
          color: "#00ddb4",
          textTransform: "uppercase",
        }}
      >
        Configuration
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px 20px",
        }}
      >
        <Field label="Hidden layers (neurons)" hint="comma-separated">
          <input
            type="text"
            value={layers}
            onChange={(e) => setLayers(e.target.value)}
            disabled={running}
            style={inputStyle}
          />
        </Field>

        <Field label="Epochs">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="range"
              min={1}
              max={20}
              value={epochs}
              onChange={(e) => setEpochs(+e.target.value)}
              disabled={running}
              style={{ flex: 1, accentColor: "#00ddb4" }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: "#00ddb4",
                minWidth: 24,
              }}
            >
              {epochs}
            </span>
          </div>
        </Field>

        <Field label="Learning rate">
          <select
            value={lr}
            onChange={(e) => setLr(+e.target.value)}
            disabled={running}
            style={inputStyle}
          >
            <option value={0.01}>0.01</option>
            <option value={0.001}>0.001</option>
            <option value={0.0001}>0.0001</option>
          </select>
        </Field>

        <Field label="Batch size">
          <select
            value={batchSize}
            onChange={(e) => setBatchSize(+e.target.value)}
            disabled={running}
            style={inputStyle}
          >
            <option value={64}>64</option>
            <option value={128}>128</option>
            <option value={256}>256</option>
            <option value={512}>512</option>
          </select>
        </Field>

        <Field label="SOM update every N epochs">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="range"
              min={1}
              max={5}
              value={somInterval}
              onChange={(e) => setSomInterval(+e.target.value)}
              disabled={running}
              style={{ flex: 1, accentColor: "#00ddb4" }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: "#00ddb4",
                minWidth: 20,
              }}
            >
              {somInterval}
            </span>
          </div>
        </Field>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        {!running ? (
          <button onClick={handleStart} style={btnStyle("#00ddb4", "#0a2520")}>
            Train & Visualize
          </button>
        ) : (
          <button onClick={onStop} style={btnStyle("#ff5f5f", "#2a0a0a")}>
            Stop Training
          </button>
        )}
      </div>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div>
    <div
      style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: 1 }}
    >
      {label.toUpperCase()}{" "}
      {hint && <span style={{ color: "#555" }}>({hint})</span>}
    </div>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7,
  padding: "7px 10px",
  color: "#e0e0e0",
  fontFamily: "monospace",
  fontSize: 13,
  outline: "none",
};

const btnStyle = (color: string, bg: string): React.CSSProperties => ({
  padding: "10px 24px",
  background: bg,
  border: `1px solid ${color}`,
  borderRadius: 8,
  color: color,
  fontFamily: "monospace",
  fontSize: 13,
  letterSpacing: 1,
  cursor: "pointer",
  transition: "all 0.2s",
});
