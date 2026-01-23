import React, { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import SOMGrid from "./components/SOMGrid";
import Charts from "./components/Charts";
import FeatureLegend from "./components/FeatureLegend"; // <-- 1. Import component chú thích màu

function App() {
  const [somData, setSomData] = useState(null);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentWeights, setCurrentWeights] = useState(null);
  const [dataStats, setDataStats] = useState({ min: [], max: [] });
  // State lưu tên các cột để hiển thị Legend
  const [columns, setColumns] = useState([]);

  const handleDataUploaded = (data) => {
    console.log("Data uploaded from Server:", data); // DEBUG

    // Lưu toàn bộ data nhận được
    setSomData(data);

    // --- SỬA LỖI Ở ĐÂY ---
    // Trước đó bạn dùng "response.columns" nhưng tham số là "data"
    // Kiểm tra xem data.columns có tồn tại không trước khi set
    if (data.columns) {
      setColumns(data.columns);
    } else {
      setColumns([]);
    }
    if (data.min_values && data.max_values) {
      setDataStats({
        min: data.min_values,
        max: data.max_values,
      });
    }
    // Hiển thị weights ban đầu ngay khi upload
    if (data.weights) {
      setCurrentWeights(data.weights);
    }
  };

  const handleTrainingComplete = (history) => {
    console.log("Training complete:", history); // DEBUG
    setTrainingHistory(history);
    setIsTraining(false);

    // Hiển thị weights của epoch cuối cùng
    if (history && history.length > 0) {
      const lastWeights = history[history.length - 1].weights;
      setCurrentWeights(lastWeights);
    }
  };

  return (
    <div
      className="app"
      style={{
        padding: "20px",
        minHeight: "100vh",
        color: "white",
        maxWidth: "1300px", // Giới hạn chiều rộng để không bị bè quá trên màn hình to
        width: "100%",
        margin: "0 auto", // Căn giữa màn hình
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        SOM Visualization Tool
      </h1>

      <ControlPanel
        onDataUploaded={handleDataUploaded}
        onTrainingStart={() => setIsTraining(true)}
        onTrainingComplete={handleTrainingComplete}
      />

      {/* --- 2. HIỂN THỊ CHÚ THÍCH MÀU (Nếu đã có tên cột) --- */}
      {columns.length > 0 && <FeatureLegend columns={columns} />}

      <div
        className="visualization-area"
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap", // Cho phép xuống dòng trên màn hình nhỏ
          alignItems: "flex-start", // Căn hàng đầu
        }}
      >
        {/* Phần lưới SOM */}
        <div style={{ flex: "0 0 auto" }}>
          <SOMGrid
            weights={currentWeights}
            isTraining={isTraining}
            trainingHistory={trainingHistory}
            columns={columns}
            minValues={dataStats.min}
            maxValues={dataStats.max}
          />
        </div>

        {/* Phần biểu đồ - Cho phép co giãn (flex: 1) */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <Charts history={trainingHistory} />
        </div>
      </div>
    </div>
  );
}

export default App;
