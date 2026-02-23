import { useState, useEffect, use } from "react";
import { Link } from "react-router-dom";
import { ButtonBlack, ButtonBlue } from "../components/Button";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import HexagonalGrid from "../components/HexagonalGrid";
import axios from "axios";
import { clearInterval } from "node:timers";

interface SOMNeuron {
  id: string;
  x: number;
  y: number;
  weights: number[];
  activated: boolean;
  activationLevel: number;
}
interface history {
  umatrix: number[][];
  error: number;
  iterations: number;
}
interface Umatrix {
  neurons: number[][];
  error: number;
  iteration: number;
}
export default function Training() {
  const [sigma, setSigma] = useState<number>(0);
  const [sigmaDec, setSigmaDec] = useState<number>(0);
  const [learningRate, setLearningRate] = useState<number>(0);
  const [iterations, setIterations] = useState<number>(0);
  const [inhibition, setInhibition] = useState<number>(0);
  const [X, setX] = useState<number>(5);
  const [Y, setY] = useState<number>(5);
  const [neurons, setNeurons] = useState<SOMNeuron[]>([]);
  const [history, setHistory] = useState<history[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [data, setData] = useState<number[][]>([[]]);
  const [mseHistory, setMseHistory] = useState<
    Array<{ iteration: number; mse: number }>
  >([]);
  const [uMatrix, setUMatrix] = useState<Umatrix | null>(null);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  useEffect(() => {
    const loadedData = sessionStorage.getItem("somData");
    if (loadedData) {
      const currentData = JSON.parse(loadedData);
      setData(currentData.data);
      initializeNeurons(currentData.data, X, Y);
    } else {
      const randomData: number[][] = Array.from({ length: 50 }, () =>
        Array.from({ length: 2 }, () => Math.random()),
      );
      setData(randomData);
      initializeNeurons(randomData, X, Y);
    }
  }, [X, Y]);
  const initializeNeurons = (data: number[][], X: number, Y: number) => {
    const newNeurons: SOMNeuron[] = [];
    for (let y = 0; y < Y; y++) {
      for (let x = 0; x < X; x++) {
        newNeurons.push({
          id: `neuron-${x}-${y}`,
          x,
          y,
          weights: data[y],
          activated: false,
          activationLevel: 0,
        });
      }
    }
    setNeurons(newNeurons);
  };
  const handleStartTraining = async () => {
    setIsTraining(true);
    setMseHistory([]);
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/train`,
      { iterations, neurons, X, Y, learningRate },
    );
    const results = res.data.results;
    setHistory(results);

    let currentProgress = 0 - 100 / (iterations / 10);
    const interval = window.setInterval(() => {
      currentProgress += 100 / (iterations / 10);
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(currentProgress);
        setIsTraining(false);
        window.clearInterval(interval);
      } else {
        const step = Math.min(
          Math.floor(currentProgress / (100 / results.length)),
          results.length - 1,
        );
        const currentStep = results[step];
        if (!currentStep) return;

        setUMatrix({
          neurons: currentStep.u_matrix,
          error: currentStep.error,
          iteration: currentStep.iteration,
        });
        setMseHistory((prev) => [
          ...prev,
          { iteration: currentStep.iteration, mse: currentStep.error },
        ]);

        setProgress(currentProgress);
      }
    }, 100);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-cyan-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            SOM Training
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure parameters and train your self-organizing map
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-5 ">
          <div className="space-y-3">
            <div className="p-4 rounded-lg border-[0.1rem] border-black/20 bg-white">
              <h3 className="font-semibold text-base mb-3 text-foreground">
                Training Parameters
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="sigma" className="text-sm font-medium">
                    Sigma (σ)
                  </label>
                  <div className="flex items-center ">
                    <input
                      id="sigma"
                      type="number"
                      step="1"
                      value={sigma}
                      onChange={(e) => setSigma(Number(e.target.value) || 0)}
                      disabled={isTraining}
                      className="border-black  border-[0.1rem] rounded-md h-[40px] w-[310px] px-[12px] py-[8px]"
                    />
                    <span className="text-sm ml-3 text-[rgb(101,119,129)]">
                      {sigma.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ">
                    Initial neighborhood radius
                  </p>
                </div>
                <div className="space-y-1 ">
                  <label htmlFor="sigmadecay" className="text-sm font-medium">
                    Sigma Decreasing Rate
                  </label>
                  <div className="flex items-center ">
                    <input
                      id="sigmadecay"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={sigmaDec}
                      onChange={(e) =>
                        setSigmaDec(parseFloat(e.target.value) || 0)
                      }
                      disabled={isTraining}
                      className="border-black  border-[0.1rem] w-[310px] bg-[rgb(220, 231, 233)] rounded-md h-[40px] px-[12px] py-[8px]"
                    />
                    <span className="text-sm text-muted-foreground ml-3 text-[rgb(101,119,129)] ">
                      {sigmaDec.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    How fast sigma decreases
                  </p>
                </div>

                {/* Learning Rate */}
                <div className="space-y-1">
                  <label htmlFor="lr" className="text-sm font-medium">
                    Learning Rate
                  </label>
                  <div className="flex items-center">
                    <input
                      id="lr"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={learningRate}
                      onChange={(e) =>
                        setLearningRate(parseFloat(e.target.value) || 0)
                      }
                      disabled={isTraining}
                      className="border-black  border-[0.1rem] w-[310px] bg-[rgb(220, 231, 233)] rounded-md h-[40px] px-[12px] py-[8px]"
                    />
                    <span className="text-sm text-muted-foreground ml-3 text-[rgb(101,119,129)]">
                      {learningRate.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Weight update magnitude
                  </p>
                </div>
                <div className="space-y-1 flex flex-col">
                  <label htmlFor="iterations" className="text-sm font-medium">
                    Iterations
                  </label>
                  <input
                    id="iterations"
                    type="number"
                    value={iterations}
                    onChange={(e) =>
                      setIterations(Number(e.target.value) || 100)
                    }
                    disabled={isTraining}
                    className="border-black  border-[0.1rem] bg-[rgb(220, 231, 233)] rounded-md h-[40px] px-[12px] py-[8px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total training iterations
                  </p>
                </div>
                <div className="space-y-1 ">
                  <label htmlFor="inhibition" className="text-sm font-medium">
                    Inhibition
                  </label>
                  <div className="flex items-center">
                    <input
                      id="inhibition"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={inhibition}
                      onChange={(e) =>
                        setInhibition(parseFloat(e.target.value) || 0.5)
                      }
                      disabled={isTraining}
                      className="border-black w-[310px] border-[0.1rem] bg-[rgb(220, 231, 233)] rounded-md h-[40px] px-[12px] py-[8px]"
                    />
                    <span className="text-sm text-muted-foreground ml-3 text-[rgb(101,119,129)]">
                      {inhibition.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lateral inhibition factor
                  </p>
                </div>
                <div className="pt-3 border-t border-black/20 space-y-3">
                  <h4 className="font-medium text-sm text-foreground">
                    Neuron Grid
                  </h4>
                  <div className="space-y-1">
                    <label htmlFor="neuronsx" className="text-sm font-medium">
                      Grid Width (X neurons)
                    </label>
                    <div className="flex items-center">
                      <input
                        id="neuronsx"
                        type="number"
                        value={X}
                        onChange={(e) => {
                          setX(parseInt(e.target.value));
                        }}
                        disabled={isTraining}
                        className="border-black w-[310px] border-[0.1rem] bg-[rgb(220, 231, 233)] rounded-md h-[40px] px-[12px] py-[8px]"
                      />
                      <span className="text-sm text-muted-foreground ml-3 text-[rgb(101,119,129)]">
                        {X}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="neuronsy" className="text-sm font-medium">
                      Grid Height (Y neurons)
                    </label>
                    <div className="flex items-center">
                      <input
                        id="neuronsy"
                        type="number"
                        value={Y}
                        onChange={(e) => {
                          setY(parseInt(e.target.value));
                        }}
                        disabled={isTraining}
                        className="border-black w-[310px] border-[0.1rem] bg-[rgb(220, 231, 233)] rounded-md h-[40px] px-[12px] py-[8px]"
                      />
                      <span className="text-sm text-muted-foreground ml-3 text-[rgb(101,119,129)]">
                        {Y}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border-[0.1rem] border-black/20 bg-white">
              <h3 className="font-semibold text-base mb-3 text-foreground">
                Training Control
              </h3>

              <div className="space-y-2">
                <ButtonBlue
                  onClick={handleStartTraining}
                  disabled={isTraining}
                  className="w-full gap-2 px-[1rem] py-[0.6rem] flex justify-center items-center"
                >
                  <Play className="w-4 h-4" />
                  Start Training
                </ButtonBlue>

                <ButtonBlack
                  //   onClick={handlePause}
                  disabled={!isTraining}
                  className="w-full gap-2 px-[1rem] py-[0.6rem] flex justify-center items-center"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </ButtonBlack>

                <ButtonBlack
                  //   onClick={handleReset}
                  className="w-full gap-2 px-[1rem] py-[0.6rem] flex justify-center items-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </ButtonBlack>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4  bg-white rounded-lg border-[0.1rem] border-black/20">
              <h3 className="font-semibold text-base mb-3 text-foreground">
                Training Progress
              </h3>
              <div className="space-y-2">
                <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">
                    {Math.floor(progress)}%
                  </span>
                  <span className="text-muted-foreground">
                    {isTraining ? "Training..." : "Ready"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4  bg-white rounded-lg border-[0.1rem] border-black/20">
              <h3 className="font-semibold text-base mb-3 text-foreground">
                SOM Hexagonal Grid
              </h3>
              <div className="overflow-x-auto">
                <HexagonalGrid
                  X={X}
                  Y={Y}
                  neurons={neurons}
                  uMatrix={uMatrix}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-muted-foreground mb-0.5">Total Neurons</p>
                  <p className="font-bold text-foreground">{X * Y}</p>
                </div>
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-muted-foreground mb-0.5">Active</p>
                  <p className="font-bold text-foreground">
                    {/* {neurons.filter((n) => n.activated).length} */}
                  </p>
                </div>
                <div className="p-2 bg-purple-50 rounded border border-purple-200">
                  <p className="text-muted-foreground mb-0.5">Avg Activation</p>
                  <p className="font-bold text-foreground">
                    {(
                      neurons.reduce((sum, n) => sum + n.activationLevel, 0) /
                      neurons.length
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4  bg-white rounded-lg border-[0.1rem] border-black/20">
              <h3 className="font-semibold text-base mb-3 text-foreground">
                Mean Squared Error (MSE)
              </h3>
              {mseHistory.length > 0 ? (
                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mseHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis
                        dataKey="iteration"
                        stroke="#94a3b8"
                        style={{ fontSize: "10px" }}
                      />
                      <YAxis stroke="#94a3b8" style={{ fontSize: "10px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => value.toFixed(4)}
                      />
                      <Line
                        type="monotone"
                        dataKey="mse"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                  <p>Start training to see MSE graph</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
