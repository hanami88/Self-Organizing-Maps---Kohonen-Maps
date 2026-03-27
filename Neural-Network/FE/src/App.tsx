import React, { useState, useCallback, useRef } from "react";
import type { LayerSOM, TrainingConfig, EpochUpdate } from "./types";
import {
  useTrainingSocket,
  startTraining,
  stopTraining,
} from "./hooks/useTraining";
import { ConfigPanel } from "./components/ConfigPanel";
import { ProgressBar } from "./components/ProgressBar";
import { LayerViewer } from "./components/LayerViewer";

export default function App() {
  const [epoch, setEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(0);
  const [loss, setLoss] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [running, setRunning] = useState(false);
  const [layerSoms, setLayerSoms] = useState<LayerSOM[]>([]);
  const [combinedView, setCombinedView] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-40), msg]);
    setTimeout(() => {
      if (logRef.current)
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  }, []);

  const onMessage = useCallback(
    (msg: EpochUpdate) => {
      if (msg.type === "init") {
        if (msg.status) {
          setRunning(msg.status.running);
          setEpoch(msg.status.epoch);
          setTotalEpochs(msg.status.total_epochs);
          setLoss(msg.status.loss);
          setAccuracy(msg.status.accuracy);
        }
        if (msg.results && msg.results.length > 0) setLayerSoms(msg.results);
      } else if (msg.type === "training_started") {
        setRunning(true);
        setEpoch(0);
        addLog(
          `▶ Training started — ${msg.config?.hidden_sizes?.join("→")} neurons, ${msg.config?.epochs} epochs`,
        );
      } else if (msg.type === "epoch_update") {
        setEpoch(msg.epoch ?? 0);
        setTotalEpochs(msg.total_epochs ?? 0);
        setLoss(msg.loss ?? 0);
        setAccuracy(msg.accuracy ?? 0);
        if (msg.layer_soms && msg.layer_soms.length > 0)
          setLayerSoms(msg.layer_soms);
        addLog(
          `epoch ${msg.epoch}/${msg.total_epochs}  loss=${msg.loss?.toFixed(4)}  acc=${((msg.accuracy ?? 0) * 100).toFixed(1)}%`,
        );
      } else if (msg.type === "training_complete") {
        setRunning(false);
        addLog(
          `✓ Training complete — final accuracy ${((msg.accuracy ?? 0) * 100).toFixed(1)}%`,
        );
      }
    },
    [addLog],
  );

  const { connected } = useTrainingSocket(onMessage);

  const handleStart = async (cfg: TrainingConfig) => {
    setLayerSoms([]);
    setEpoch(0);
    setLoss(0);
    setAccuracy(0);
    addLog("Sending config to server…");
    await startTraining(cfg);
  };

  const handleStop = async () => {
    await stopTraining();
    addLog("⏹ Stop requested");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07060f",
        color: "#d0d0d0",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        padding: "28px 32px",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          alignItems: "flex-end",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              letterSpacing: -0.5,
              background: "linear-gradient(90deg, #00ddb4, #7b2fff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SOM · Neural Visualizer
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 11,
              color: "#444",
              letterSpacing: 1,
            }}
          >
            HIDDEN LAYER WEIGHT CLUSTERING
          </p>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "#00ddb4" : "#ff5f5f",
              boxShadow: connected ? "0 0 8px #00ddb4" : "0 0 8px #ff5f5f",
            }}
          />
          <span style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>
            {connected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ConfigPanel
            onStart={handleStart}
            onStop={handleStop}
            running={running}
          />
          <ProgressBar
            epoch={epoch}
            totalEpochs={totalEpochs}
            loss={loss}
            accuracy={accuracy}
            running={running}
          />

          {/* Log */}
          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#444",
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              LOG
            </div>
            <div
              ref={logRef}
              style={{
                height: 180,
                overflowY: "auto",
                fontSize: 11,
                color: "#555",
                lineHeight: 1.8,
              }}
            >
              {log.length === 0 ? (
                <span style={{ color: "#333" }}>Waiting for training…</span>
              ) : (
                log.map((l, i) => (
                  <div
                    key={i}
                    style={{ color: i === log.length - 1 ? "#00ddb4" : "#555" }}
                  >
                    {l}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column — SOM visualization */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "20px 24px",
            minHeight: 480,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 18,
              gap: 12,
            }}
          >
            <h2
              style={{
                fontSize: 12,
                color: "#00ddb4",
                letterSpacing: 2,
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              SOM Visualization
            </h2>
            {layerSoms.length > 1 && (
              <button
                onClick={() => setCombinedView(!combinedView)}
                style={{
                  marginLeft: "auto",
                  padding: "4px 14px",
                  background: combinedView
                    ? "rgba(0,221,180,0.1)"
                    : "transparent",
                  border: `1px solid ${combinedView ? "#00ddb4" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 20,
                  color: combinedView ? "#00ddb4" : "#555",
                  fontFamily: "monospace",
                  fontSize: 10,
                  cursor: "pointer",
                  letterSpacing: 1,
                }}
              >
                {combinedView ? "▣  Combined" : "▢  Combined"}
              </button>
            )}
          </div>

          <LayerViewer layers={layerSoms} combinedView={combinedView} />
        </div>
      </div>

      {/* Bottom explanation */}
      <div
        style={{
          marginTop: 20,
          padding: "14px 20px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 10,
          fontSize: 11,
          color: "#444",
          lineHeight: 1.8,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        <div>
          <span style={{ color: "#00ddb4" }}>U-Matrix</span> — khoảng cách giữa
          các neuron SOM láng giềng. Vùng sáng = ranh giới cụm, vùng tối = trung
          tâm cụm.
        </div>
        <div>
          <span style={{ color: "#7b2fff" }}>Activation map</span> — bao nhiêu
          neuron ANN được ánh xạ vào mỗi ô SOM. Ô sáng = cụm đông.
        </div>
        <div>
          <span style={{ color: "#ff9f5f" }}>Scatter</span> — từng chấm = 1
          neuron ANN, vị trí = vị trí BMU trên lưới SOM, màu = độ lớn vector
          trọng số.
        </div>
      </div>
    </div>
  );
}
