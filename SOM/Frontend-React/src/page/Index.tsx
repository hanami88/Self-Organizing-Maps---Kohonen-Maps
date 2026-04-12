import Nav from "../components/Nav";
import { Link } from "react-router-dom";
import { ButtonBlack, ButtonBlue } from "../components/Button";
import { ArrowRight, Brain, Upload, BarChart3 } from "lucide-react";
export default function Index() {
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Visualize Self-Organizing Maps
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Understand how neural networks learn through the Self-Organizing
                Map (SOM) algorithm. Upload your data, configure training
                parameters, and watch your neural network organize in real-time.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/upload" className="flex-1 sm:flex-none">
                <ButtonBlue className="px-[1rem] py-[0.6rem] flex justify-between items-center">
                  <Upload className="w-5 h-5 mr-[0.5rem]" />
                  <div>Start with Data Upload</div>
                  <ArrowRight className="w-4 h-4 ml-[0.5rem]" />
                </ButtonBlue>
              </Link>
              <Link to="/training" className="flex-1 sm:flex-none">
                <ButtonBlack className="px-[1rem] py-[0.6rem] flex justify-between items-center">
                  <Brain className="w-5 h-5 mr-[0.5rem]" />
                  View Training Page
                </ButtonBlack>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl p-8 shadow-[0_8px_32px_rgba(59,130,246,0.15)]">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <svg
                    width="240"
                    height="200"
                    viewBox="0 0 240 200"
                    className="text-blue-500"
                  >
                    {[0, 1, 2, 3].map((row) =>
                      [0, 1, 2, 3].map((col) => {
                        const x = 60 + col * 45 + (row % 2 ? 22.5 : 0);
                        const y = 40 + row * 39;
                        return (
                          <g key={`${row}-${col}`}>
                            <polygon
                              points={`${x},${y - 18} ${x + 15.6},${y - 9} ${x + 15.6},${y + 9} ${x},${y + 18} ${x - 15.6},${y + 9} ${x - 15.6},${y - 9}`}
                              fill="#60a5fa"
                              stroke="#3b82f6"
                              strokeWidth="2"
                              opacity="0.9"
                            />
                          </g>
                        );
                      }),
                    )}
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-foreground text-lg">
                    Neural Network Organization
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Watch neurons self-organize into meaningful patterns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white/50 border-y border-black-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h3 className="text-3xl font-bold text-center mb-16 text-foreground">
            Complete SOM Training Platform
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Upload className="w-8 h-8" />,
                title: "Data Upload & Normalization",
                description:
                  "Upload your dataset with easy parameter configuration for input normalization and data preprocessing.",
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Configurable Training",
                description:
                  "Set all SOM parameters: sigma, learning rate, iterations, inhibition, and neuron grid dimensions.",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Real-time Visualization",
                description:
                  "Watch the network learn with live MSE graphs, progress tracking, and hexagonal grid visualization.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-xl border border-black-100 bg-gradient-to-b from-white to-blue-50 hover:shadow-lg transition-shadow"
              >
                <div className="text-primary mb-4">{feature.icon}</div>
                <h4 className="font-semibold text-lg mb-2 text-foreground">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-12 text-center">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">
            Ready to Explore Neural Networks?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Start by uploading your dataset and configuring the SOM parameters
            to begin the training process.
          </p>
          <Link to="/upload" className="inline-block">
            <ButtonBlue className="gap-2 px-[1rem] py-[0.6rem] flex justify-between items-center">
              Begin Data Upload
              <ArrowRight className="w-5 h-5" />
            </ButtonBlue>
          </Link>
        </div>
      </section>
      <footer className="border-t border-black-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
          <p>
            SOM Visualizer - Learn neural networks through interactive
            visualization
          </p>
        </div>
      </footer>
    </div>
  );
}
