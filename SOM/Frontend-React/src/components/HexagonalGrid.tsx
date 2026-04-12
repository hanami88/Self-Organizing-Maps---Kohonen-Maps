interface SOMNeuron {
  id: string;
  x: number;
  y: number;
  weights: number[];
  activated: boolean;
  activationLevel: number;
}

interface Umatrix {
  neurons: number[][];
  error: number;
  iteration: number;
}

export default function HexagonalGrid({
  X,
  Y,
  neurons,
  uMatrix,
}: {
  X: number;
  Y: number;
  neurons: SOMNeuron[];
  uMatrix?: Umatrix | null;
}) {
  const cellSize = 60;
  const hexHeight = (cellSize * Math.sqrt(3)) / 1.6;
  const spacingX = cellSize * 1;
  const spacingY = hexHeight * 0.75;
  const svgWidth = X * spacingX + cellSize * 3;
  const svgHeight = Y * spacingY + cellSize - 30;
  const paddingLeft = cellSize * 2;
  const paddingTop = cellSize - 20;

  // Normalize uMatrix.neurons về 0-1
  const flat = uMatrix ? uMatrix.neurons.flat() : [];
  const min = flat.length ? Math.min(...flat) : 0;
  const max = flat.length ? Math.max(...flat) : 1;
  const range = max - min || 1;

  const getColor = (neuron: SOMNeuron) => {
    if (!uMatrix) {
      // Chưa có uMatrix → tô màu theo activationLevel
      const hue = neuron.activationLevel * 180;
      const saturation = neuron.activated ? 100 : 50;
      const lightness = 50 - neuron.activationLevel * 30;
      return { color: `hsl(${hue}, ${saturation}%, ${lightness}%)`, lightness };
    }
    // Có uMatrix → trắng = gần, đen = xa
    const value = uMatrix.neurons[neuron.y]?.[neuron.x] ?? 0;
    const normalized = (value - min) / range;
    const lightness = Math.round((1 - normalized) * 100);
    return { color: `hsl(0, 0%, ${lightness}%)`, lightness };
  };

  return (
    <svg
      width="100%"
      height="340"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="bg-blue-100 rounded-lg border border-blue-200"
      preserveAspectRatio="xMidYMid meet"
    >
      {neurons.map((neuron) => {
        const x =
          neuron.x * spacingX + (neuron.y % 2) * (spacingX / 2) + paddingLeft;
        const y = neuron.y * spacingY + paddingTop;
        const { color, lightness } = getColor(neuron);

        return (
          <g
            key={neuron.id}
            style={{ transition: "all 0.3s ease", cursor: "pointer" }}
          >
            <polygon
              points={`${x},${y - hexHeight / 2} ${x + cellSize / 2},${y - hexHeight / 4} ${x + cellSize / 2},${y + hexHeight / 4} ${x},${y + hexHeight / 2} ${x - cellSize / 2},${y + hexHeight / 4} ${x - cellSize / 2},${y - hexHeight / 4}`}
              fill={color}
              stroke="#ffffff"
              strokeWidth="0.3"
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill={lightness > 50 ? "#1e293b" : "#f1f5f9"}
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
