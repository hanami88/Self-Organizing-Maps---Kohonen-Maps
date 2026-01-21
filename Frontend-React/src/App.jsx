import React, { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import SOMGrid from "./components/SOMGrid";
import Charts from "./components/Charts";

function App() {
  const [somData, setSomData] = useState(null);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentWeights, setCurrentWeights] = useState(null);

  const handleDataUploaded = (data) => {
    console.log("Data uploaded:", data); // DEBUG
    setSomData(data);

    // Hiển thị weights ban đầu
    if (data.weights) {
      setCurrentWeights(data.weights);
    }
  };

  const handleTrainingComplete = (history) => {
    console.log("Training complete:", history); // DEBUG
    setTrainingHistory(history);
    setIsTraining(false);

    // Hiển thị weights cuối cùng
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
        backgroundColor: "#1a1a1a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>SOM Visualization Tool</h1>

      <ControlPanel
        onDataUploaded={handleDataUploaded}
        onTrainingStart={() => setIsTraining(true)}
        onTrainingComplete={handleTrainingComplete}
      />
      <div
        className="visualization-area"
        style={{ display: "flex", gap: "19px", marginTop: "19px" }}
      >
        <SOMGrid
          weights={currentWeights}
          isTraining={isTraining}
          trainingHistory={trainingHistory}
        />
        <Charts history={trainingHistory} />
      </div>
    </div>
  );
}

export default App;
