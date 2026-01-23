import React, { useState } from "react";
import axios from "axios";

function ControlPanel({ onDataUploaded, onTrainingStart, onTrainingComplete }) {
  const [file, setFile] = useState(null);
  const [config, setConfig] = useState({
    grid_x: 10,
    grid_y: 10,
    learning_rate: 0.5,
    epochs: 100,
  });

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("grid_x", config.grid_x);
    formData.append("grid_y", config.grid_y);
    formData.append("learning_rate", config.learning_rate);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/upload",
        formData,
      );
      if (response.data.success) {
        alert("Data uploaded successfully!");
        onDataUploaded(response.data);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleTrain = async () => {
    onTrainingStart();
    try {
      const response = await axios.post("http://localhost:5001/api/train", {
        epochs: config.epochs,
      });
      if (response.data.success) {
        onTrainingComplete(response.data.results);
      }
    } catch (error) {
      console.error("Training error:", error);
    }
  };

  return (
    <div className="control-panel">
      <h2>Configuration</h2>

      <div className="upload-section">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleUpload}>Upload Data</button>
      </div>

      <div className="config-section">
        <label>
          Grid Size:
          <input
            type="number"
            value={config.grid_x}
            onChange={(e) => setConfig({ ...config, grid_x: e.target.value })}
          />
          x
          <input
            type="number"
            value={config.grid_y}
            onChange={(e) => setConfig({ ...config, grid_y: e.target.value })}
          />
        </label>

        <label>
          Learning Rate:
          <input
            type="number"
            step="0.1"
            value={config.learning_rate}
            onChange={(e) =>
              setConfig({ ...config, learning_rate: e.target.value })
            }
          />
        </label>

        <label>
          Epochs:
          <input
            type="number"
            value={config.epochs}
            onChange={(e) => setConfig({ ...config, epochs: e.target.value })}
          />
        </label>
      </div>

      <button onClick={handleTrain} className="train-btn">
        ▶️ Start Training
      </button>
    </div>
  );
}

export default ControlPanel;
