import React, { useEffect, useRef, useState } from "react";

function SOMGrid({ weights, isTraining, trainingHistory }) {
  const canvasRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Vẽ khi có weights
  useEffect(() => {
    console.log("SOMGrid received weights:", weights); // DEBUG

    if (!weights) {
      console.log("No weights yet");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    drawSOMGrid(ctx, weights, canvas.width, canvas.height);
  }, [weights]);

  // Animation khi có training history
  useEffect(() => {
    console.log("Training history:", trainingHistory); // DEBUG

    if (trainingHistory && trainingHistory.length > 0) {
      playAnimation();
    }
  }, [trainingHistory]);

  const drawSOMGrid = (ctx, weightsData, width, height) => {
    console.log("Drawing SOM Grid..."); // DEBUG
    console.log("Weights data:", weightsData); // DEBUG

    if (!weightsData || weightsData.length === 0) {
      console.error("Invalid weights data");
      return;
    }

    const gridX = weightsData.length;
    const gridY = weightsData[0].length;
    const cellWidth = width / gridX;
    const cellHeight = height / gridY;

    console.log(
      `Grid size: ${gridX}x${gridY}, Cell: ${cellWidth}x${cellHeight}`,
    );

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Vẽ từng cell
    for (let i = 0; i < gridX; i++) {
      for (let j = 0; j < gridY; j++) {
        const weight = weightsData[i][j];

        if (!weight || weight.length < 3) {
          console.warn(`Invalid weight at [${i},${j}]:`, weight);
          continue;
        }
        // Convert weight thành màu RGB
        const r = Math.floor(Math.min(255, Math.max(0, weight[0] * 255)));
        const g = Math.floor(Math.min(255, Math.max(0, weight[1] * 255)));
        const b = Math.floor(Math.min(255, Math.max(0, weight[2] * 255)));

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);

        // Vẽ border
        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
      }
    }

    console.log("Grid drawn successfully!");
  };

  const playAnimation = () => {
    console.log("Starting animation...");

    if (!trainingHistory || trainingHistory.length === 0) {
      console.log("No training history for animation");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let frame = 0;

    const interval = setInterval(() => {
      if (frame < trainingHistory.length) {
        console.log(`Frame ${frame}/${trainingHistory.length}`);

        const frameData = trainingHistory[frame];
        if (frameData && frameData.weights) {
          drawSOMGrid(ctx, frameData.weights, canvas.width, canvas.height);
        }

        frame++;
      } else {
        clearInterval(interval);
        console.log("Animation complete!");
      }
    }, 300); // 300ms mỗi frame
  };

  return (
    <div className="som-grid" style={{ padding: "20px" }}>
      <h2>🗺️ SOM Grid Visualization</h2>

      {!weights && !isTraining && (
        <div style={{ color: "#666", marginBottom: "10px" }}>
          Please upload data and start training
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        style={{
          border: "2px solid #333",
          backgroundColor: "#f0f0f0",
        }}
      />

      {isTraining && (
        <div style={{ marginTop: "10px", color: "#00aa00" }}>
          ⏳ Training in progress...
        </div>
      )}
    </div>
  );
}

export default SOMGrid;
