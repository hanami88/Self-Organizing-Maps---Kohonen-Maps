import React, { useState } from "react";
import type { LayerSOM } from "../types";
import { SOMGrid } from "./SOMGrid";

interface Props {
  layers: LayerSOM[];
  combinedView: boolean;
}

type ViewMode = "umatrix" | "activation" | "scatter";

export const LayerViewer: React.FC<Props> = ({ layers, combinedView }) => {
  const [activeLayer, setActiveLayer] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("umatrix");

  if (layers.length === 0) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: "48px 24px",
          textAlign: "center",
          color: "#444",
          fontFamily: "monospace",
          fontSize: 13,
        }}
      >
        SOM visualization appears here after the first epoch
      </div>
    );
  }

  return (
    <div>
      {/* Layer tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#666",
            marginRight: 4,
            letterSpacing: 1,
          }}
        >
          LAYER:
        </span>
        {layers.map((l, i) => (
          <button
            key={i}
            onClick={() => setActiveLayer(i)}
            style={{
              padding: "5px 14px",
              background:
                activeLayer === i ? "rgba(0,221,180,0.12)" : "transparent",
              border: `1px solid ${activeLayer === i ? "#00ddb4" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 20,
              color: activeLayer === i ? "#00ddb4" : "#666",
              fontFamily: "monospace",
              fontSize: 11,
              cursor: "pointer",
              letterSpacing: 0.5,
            }}
          >
            {l.layer_name}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {(["umatrix", "activation", "scatter"] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                padding: "4px 12px",
                background:
                  viewMode === m ? "rgba(123,47,255,0.2)" : "transparent",
                border: `1px solid ${viewMode === m ? "#7b2fff" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 20,
                color: viewMode === m ? "#a070ff" : "#555",
                fontFamily: "monospace",
                fontSize: 10,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              {m === "umatrix"
                ? "U-Matrix"
                : m === "activation"
                  ? "Activation"
                  : "Scatter"}
            </button>
          ))}
        </div>
      </div>

      {combinedView ? (
        // All layers side by side
        <div
          style={{
            display: "flex",
            gap: 20,
            overflowX: "auto",
            paddingBottom: 8,
          }}
        >
          {layers.map((l, i) => (
            <div key={i} style={{ flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#666",
                  marginBottom: 8,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                }}
              >
                {l.layer_name.toUpperCase()}
              </div>
              <SOMGrid layer={l} viewMode={viewMode} />
              <LayerStats layer={l} />
            </div>
          ))}
        </div>
      ) : (
        // Single layer view
        <div>
          {layers[activeLayer] && (
            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                alignItems: "flex-start",
              }}
            >
              <div>
                <SOMGrid layer={layers[activeLayer]} viewMode={viewMode} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <LayerStats layer={layers[activeLayer]} />
                <Legend viewMode={viewMode} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LayerStats: React.FC<{ layer: LayerSOM }> = ({ layer }) => (
  <div
    style={{
      marginTop: 12,
      fontFamily: "monospace",
      fontSize: 11,
      color: "#666",
      lineHeight: 1.8,
    }}
  >
    <div>
      <span style={{ color: "#444" }}>neurons:</span>{" "}
      <span style={{ color: "#00ddb4" }}>{layer.n_neurons}</span>
    </div>
    <div>
      <span style={{ color: "#444" }}>weight dims:</span>{" "}
      <span style={{ color: "#00ddb4" }}>{layer.n_weights}</span>
    </div>
    <div>
      <span style={{ color: "#444" }}>SOM grid:</span>{" "}
      <span style={{ color: "#00ddb4" }}>
        {layer.som_size}×{layer.som_size}
      </span>
    </div>
  </div>
);

const Legend: React.FC<{ viewMode: ViewMode }> = ({ viewMode }) => {
  const desc: Record<ViewMode, string> = {
    umatrix:
      "U-Matrix: brighter = neurons more different from neighbors (boundary between clusters)",
    activation: "Activation: brighter = more neurons mapped to this cell",
    scatter: "Scatter: dots = individual neurons, color = weight magnitude",
  };
  return (
    <div
      style={{
        marginTop: 16,
        padding: "10px 12px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 8,
        fontSize: 11,
        color: "#555",
        lineHeight: 1.6,
        fontFamily: "monospace",
      }}
    >
      {desc[viewMode]}
    </div>
  );
};
