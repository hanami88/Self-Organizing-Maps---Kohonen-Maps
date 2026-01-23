import React, { useEffect, useRef, useState } from "react";

// Helper: Hàm giải mã dữ liệu từ 0-1 về giá trị thật
const denormalize = (value, min, max) => {
  if (min === undefined || max === undefined) return value; // Fallback nếu không có min/max
  return value * (max - min) + min;
};

function SOMGrid({
  weights,
  isTraining,
  trainingHistory,
  columns,
  minValues,
  maxValues,
}) {
  const canvasRef = useRef(null);

  // State lưu thông tin tooltip
  const [hoverInfo, setHoverInfo] = useState(null);

  // Ref lưu weights hiện tại đang vẽ (để dùng trong sự kiện hover mà không bị closure cũ)
  const currentWeightsRef = useRef(null);

  useEffect(() => {
    if (!weights) return;
    currentWeightsRef.current = weights; // Cập nhật ref

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawSOMGrid(ctx, weights, canvas.width, canvas.height);
  }, [weights]);

  // Animation logic
  useEffect(() => {
    if (trainingHistory && trainingHistory.length > 0) {
      playAnimation();
    }
  }, [trainingHistory]);

  const drawSOMGrid = (ctx, weightsData, width, height) => {
    if (!weightsData || weightsData.length === 0) return;

    // Cập nhật ref mỗi khi vẽ lại (quan trọng cho animation)
    currentWeightsRef.current = weightsData;

    const gridX = weightsData.length;
    const gridY = weightsData[0].length;
    const cellWidth = width / gridX;
    const cellHeight = height / gridY;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < gridX; i++) {
      for (let j = 0; j < gridY; j++) {
        const weight = weightsData[i][j];
        if (!weight) continue;

        // Vẽ màu RGB
        const r = Math.floor(
          Math.min(255, Math.max(0, (weight[0] || 0) * 255)),
        );
        const g = Math.floor(
          Math.min(255, Math.max(0, (weight[1] || 0) * 255)),
        );
        const b = Math.floor(
          Math.min(255, Math.max(0, (weight[2] || 0) * 255)),
        );

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
      }
    }
  };

  const playAnimation = () => {
    if (!trainingHistory || trainingHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let frame = 0;
    const interval = setInterval(() => {
      if (frame < trainingHistory.length) {
        const frameData = trainingHistory[frame];
        if (frameData && frameData.weights) {
          drawSOMGrid(ctx, frameData.weights, canvas.width, canvas.height);
        }
        frame++;
      } else {
        clearInterval(interval);
      }
    }, 100); // Tăng tốc độ lên 100ms cho mượt
  };

  // --- LOGIC XỬ LÝ HOVER ---
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentWeightsRef.current) return;

    // 1. Lấy tọa độ chuột so với canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 2. Tính kích thước ô
    const weightsData = currentWeightsRef.current;
    const gridX = weightsData.length;
    const gridY = weightsData[0].length;

    // Lưu ý: Cần tính dựa trên kích thước thật hiển thị (CSS size)
    // Nếu canvas width=600 nhưng CSS hiển thị nhỏ hơn thì rect.width sẽ khác
    const cellWidth = rect.width / gridX;
    const cellHeight = rect.height / gridY;

    // 3. Tìm chỉ số ô (i, j)
    const i = Math.floor(x / cellWidth);
    const j = Math.floor(y / cellHeight);

    // 4. Kiểm tra biên (tránh lỗi out of bound)
    if (i >= 0 && i < gridX && j >= 0 && j < gridY) {
      const neuronWeights = weightsData[i][j];

      setHoverInfo({
        x: e.clientX, // Tọa độ chuột trên màn hình (để đặt tooltip)
        y: e.clientY,
        i,
        j, // Vị trí nơ-ron
        values: neuronWeights, // Giá trị trọng số (đang là 0-1)
      });
    } else {
      setHoverInfo(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  return (
    <div className="som-grid" style={{ padding: "20px", position: "relative" }}>
      <h2>🗺️ SOM Grid Visualization</h2>

      {!weights && !isTraining && (
        <div style={{ color: "#666", marginBottom: "10px" }}>
          Please upload data...
        </div>
      )}

      {/* Canvas Wrapper để xử lý sự kiện chuột */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            border: "2px solid #333",
            backgroundColor: "#f0f0f0",
            cursor: "crosshair",
            maxWidth: "100%", // Responsive
            height: "auto",
          }}
        />

        {/* --- TOOLTIP COMPONENT --- */}
        {hoverInfo && (
          <div
            style={{
              position: "fixed", // Dùng fixed để không bị che khuất
              top: hoverInfo.y + 15,
              left: hoverInfo.x + 15,
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              pointerEvents: "none", // Để chuột không bị vướng vào tooltip
              zIndex: 1000,
              fontSize: "12px",
              minWidth: "150px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid #555",
                marginBottom: "5px",
                paddingBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Neuron [{hoverInfo.i}, {hoverInfo.j}]
            </div>

            {/* Loop qua từng cột để hiển thị giá trị thật */}
            {columns && columns.length > 0
              ? columns.map((col, index) => {
                  const rawVal = hoverInfo.values[index];
                  // Tính lại giá trị thật
                  const realVal = denormalize(
                    rawVal,
                    minValues ? minValues[index] : 0,
                    maxValues ? maxValues[index] : 1,
                  );

                  // Format số cho đẹp (nếu là số nguyên thì không cần thập phân)
                  const displayVal =
                    Math.abs(realVal) > 100
                      ? Math.round(realVal) // Số lớn làm tròn
                      : realVal.toFixed(2); // Số nhỏ lấy 2 số lẻ

                  return (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#aaa" }}>{col}:</span>
                      <span style={{ fontWeight: "bold", marginLeft: "10px" }}>
                        {displayVal}
                      </span>
                    </div>
                  );
                })
              : // Fallback nếu không có tên cột
                hoverInfo.values.map((val, idx) => (
                  <div key={idx}>
                    Feat {idx}: {val.toFixed(2)}
                  </div>
                ))}
          </div>
        )}
      </div>

      {isTraining && (
        <div style={{ marginTop: "10px", color: "#00aa00" }}>
          ⏳ Training in progress...
        </div>
      )}
    </div>
  );
}

export default SOMGrid;
