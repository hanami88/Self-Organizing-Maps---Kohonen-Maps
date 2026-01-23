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
        pointRadius: 6, // Mặc định là 3, tăng lên 6
        pointHoverRadius: 8, // Khi di chuột vào
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
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
    scales: {
      y: {
        // Trục tung
        beginAtZero: true, // Bắt buộc trục Y bắt đầu từ số 0 (thay vì số nhỏ nhất của data)
      },
    },
  };

  return (
    <div className="charts" style={{ height: "400px", width: "100%", flex: 1 }}>
      <h2>📈 Statistics</h2>
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default Charts;
