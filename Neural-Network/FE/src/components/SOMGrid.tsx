import React, { useRef, useEffect, useState } from "react";
import type { LayerSOM, NeuronPosition } from "../types";

interface Props {
  layer: LayerSOM;
  viewMode: "umatrix" | "activation" | "scatter";
}

function lerp(
  t: number,
  c0: [number, number, number],
  c1: [number, number, number],
): string {
  const r = Math.round(c0[0] + t * (c1[0] - c0[0]));
  const g = Math.round(c0[1] + t * (c1[1] - c0[1]));
  const b = Math.round(c0[2] + t * (c1[2] - c0[2]));
  return `rgb(${r},${g},${b})`;
}

// Deep purple → electric teal gradient
const COLOR_LOW: [number, number, number] = [15, 12, 40];
const COLOR_MID: [number, number, number] = [80, 30, 140];
const COLOR_HIGH: [number, number, number] = [0, 220, 180];

function valueToColor(v: number): string {
  if (v < 0.5) return lerp(v * 2, COLOR_LOW, COLOR_MID);
  return lerp((v - 0.5) * 2, COLOR_MID, COLOR_HIGH);
}

const ACTV_LOW: [number, number, number] = [10, 10, 30];
const ACTV_HIGH: [number, number, number] = [255, 160, 20];

function actvToColor(v: number): string {
  return lerp(v, ACTV_LOW, ACTV_HIGH);
}

export const SOMGrid: React.FC<Props> = ({ layer, viewMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<NeuronPosition | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

  const CELL = 44;
  const PAD = 2;
  const SIZE = layer.som_size;
  const W = SIZE * (CELL + PAD) + PAD;
  const H = SIZE * (CELL + PAD) + PAD;

  // Build neuron lookup: (x,y) → list of neurons
  const neuronMap = React.useMemo(() => {
    const m = new Map<string, NeuronPosition[]>();
    for (const n of layer.neuron_positions) {
      const key = `${n.som_x},${n.som_y}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(n);
    }
    return m;
  }, [layer.neuron_positions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const x = PAD + col * (CELL + PAD);
        const y = PAD + row * (CELL + PAD);

        let v = 0;
        let color = "#0a0a1a";

        if (viewMode === "umatrix") {
          v = layer.u_matrix[row][col];
          color = valueToColor(v);
        } else if (viewMode === "activation") {
          v = layer.activation_map[row][col];
          color = actvToColor(v);
        } else {
          // scatter: base dark
          color = "#0d0d24";
        }

        // Cell background
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, CELL, CELL, 6);
        ctx.fill();

        // Neurons in this cell (scatter)
        if (viewMode === "scatter") {
          const neurons = neuronMap.get(`${col},${row}`) ?? [];
          if (neurons.length > 0) {
            const maxNorm = Math.max(
              ...layer.neuron_positions.map((n) => n.weight_norm),
            );
            neurons.forEach((n, i) => {
              const nx = x + 8 + (i % 3) * 12;
              const ny = y + 8 + Math.floor(i / 3) * 12;
              const t = n.weight_norm / (maxNorm || 1);
              ctx.fillStyle = `hsl(${160 + t * 120}, 80%, ${40 + t * 30}%)`;
              ctx.beginPath();
              ctx.arc(
                Math.min(nx, x + CELL - 6),
                Math.min(ny, y + CELL - 6),
                4,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            });
          }
        }

        // Neuron count badge
        const cnt = neuronMap.get(`${col},${row}`)?.length ?? 0;
        if (cnt > 0) {
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(String(cnt), x + CELL / 2, y + CELL - 4);
        }
      }
    }
  }, [layer, viewMode, W, H, SIZE, neuronMap]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const col = Math.floor((mx - PAD) / (CELL + PAD));
    const row = Math.floor((my - PAD) / (CELL + PAD));
    if (col >= 0 && col < SIZE && row >= 0 && row < SIZE) {
      const neurons = neuronMap.get(`${col},${row}`);
      setHovered(neurons?.[0] ?? null);
      setTooltip({ x: e.clientX, y: e.clientY });
    } else {
      setHovered(null);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
        style={{ cursor: "crosshair", display: "block", borderRadius: 10 }}
      />
      {hovered && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            background: "rgba(10,8,30,0.95)",
            border: "1px solid rgba(0,220,180,0.4)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontFamily: "monospace",
            color: "#00ddb4",
            pointerEvents: "none",
            zIndex: 9999,
            whiteSpace: "nowrap",
          }}
        >
          neuron #{hovered.neuron_idx}
          <br />
          <span style={{ color: "#aaa" }}>
            |w| = {hovered.weight_norm.toFixed(3)}
          </span>
        </div>
      )}
    </div>
  );
};
