interface SOMNeuron {
  id: string;
  x: number;
  y: number;
  weights: number[];
  activated: boolean;
  activationLevel: number;
}

export default function HexagonalGrid({
  X,
  Y,
  neurons,
}: {
  X: number;
  Y: number;
  neurons: SOMNeuron[];
}) {
  const cellSize = 30;
  const hexHeight = (cellSize * Math.sqrt(3)) / 2;

  // Perfect honeycomb packing
  const spacingX = cellSize * 0.75; // Horizontal center spacing
  const spacingY = hexHeight * 0.75; // Vertical center spacing

  // Calculate SVG dimensions
  const svgWidth = X * spacingX + cellSize * 3;
  const svgHeight = Y * spacingY + cellSize * 3;
  const paddingLeft = cellSize * 1.5;
  const paddingTop = cellSize * 1.5;
  return (
    <svg
      width="100%"
      height="340"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="bg-white rounded-lg border border-blue-200"
      preserveAspectRatio="xMidYMid meet"
    >
      {neurons.map((neuron) => {
        const x =
          neuron.x * spacingX + (neuron.y % 2) * (spacingX / 2) + paddingLeft;
        const y = neuron.y * spacingY + paddingTop;
        const hue = neuron.activationLevel * 180; // 0-180 for hue
        const saturation = neuron.activated ? 100 : 50;
        const lightness = 50 - neuron.activationLevel * 30;
        return (
          <g key={neuron.id}>
            <polygon
              points={`${x},${y - hexHeight / 2} ${x + cellSize / 2},${y - hexHeight / 4} ${x + cellSize / 2},${y + hexHeight / 4} ${x},${y + hexHeight / 2} ${x - cellSize / 2},${y + hexHeight / 4} ${x - cellSize / 2},${y - hexHeight / 4}`}
              fill={`hsl(${hue}, ${saturation}%, ${lightness}%)`}
              stroke="#ffffff"
              strokeWidth="0.5"
              style={{
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill={lightness > 60 ? "#1e293b" : "#f1f5f9"}
              fontWeight="bold"
            >
              ({neuron.x},{neuron.y})
            </text>
          </g>
        );
      })}
    </svg>
  );
}
