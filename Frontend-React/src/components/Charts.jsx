import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function Charts({ history }) {
  if (!history || history.length === 0) {
    return <div>No training data yet</div>;
  }

  const data = {
    labels: history.map((h) => h.epoch),
    datasets: [
      {
        label: "Quantization Error",
        data: history.map((h) => h.error),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Training Error Over Time",
      },
    },
  };

  return (
    <div className="charts">
      <h2>📈 Statistics</h2>
      <Line data={data} options={options} />
    </div>
  );
}

export default Charts;
