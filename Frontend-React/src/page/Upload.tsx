import { useState } from "react";
import { ButtonBlack, ButtonBlue } from "../components/Button";
import { ArrowLeft, Upload as UploadIcon, FileUp } from "lucide-react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [inputVector, setInputVector] = useState<number>(1);
  const [numberOfData, setNumberOfData] = useState<number | null>(null);
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentFile = e.target.files?.[0] || null;
    setFile(currentFile);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Upload Training Data
        </h2>
        <p className="text-muted-foreground">
          Prepare your dataset and configure normalization parameters
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg border-[0.1rem] border-black/20">
            <h3 className="font-semibold text-lg mb-6 text-foreground">
              Data Configuration
            </h3>

            <div className="space-y-4 mb-6 pb-6 border-b border-blue-100">
              <div>
                <div className="text-sm font-medium text-foreground block mb-3">
                  Select Data File
                </div>
                <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-black/20 rounded-lg cursor-pointer hover:border-black transition-colors">
                  <div className="text-center">
                    <FileUp className="w-10 h-10 mx-auto" />
                    <span className="text-sm font-medium text-foreground text-black">
                      {file ? file.name : "Click to select CSV file"}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      CSV format with comma-separated values
                    </span>
                  </div>
                  <input
                    onChange={handleChangeFile}
                    type="file"
                    accept=".csv"
                    className="hidden"
                  />
                </label>
                <ButtonBlack className="w-full mt-3 text-center">
                  Download Template
                </ButtonBlack>
              </div>
            </div>

            <div className="space-y-2 mb-6 flex flex-col">
              <label htmlFor="dimensions" className="text-sm font-medium">
                Input Vector Dimensions
              </label>
              <input
                id="dimensions"
                type="number"
                min="1"
                value={inputVector}
                className="border-black border-[0.1rem] rounded-md h-[40px] px-[12px] py-[8px]"
                onChange={(e) => {
                  setInputVector(e.target.valueAsNumber);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Number of features per data point
              </p>
            </div>

            <div className="space-y-2 mb-6 flex flex-col">
              <label htmlFor="quantity" className="text-sm font-medium">
                Number of Data Points
              </label>
              <input
                id="quantity"
                type="number"
                disabled
                value={numberOfData || ""}
                onChange={(e) => {
                  setNumberOfData(e.target.valueAsNumber);
                }}
                className="border-black border-[0.1rem] cursor-not-allowed bg-[rgb(220, 231, 233)] rounded-md h-[40px] px-[12px] py-[8px]"
              />
              <p className="text-xs text-muted-foreground">
                {numberOfData && numberOfData > 0
                  ? `${numberOfData} samples detected`
                  : "Upload data to see number of Data Points"}
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-blue-100">
              <h4 className="font-medium text-foreground text-sm">
                Normalization Range
              </h4>
              <div className="space-y-2 flex flex-col">
                <label htmlFor="minval" className="text-sm">
                  Minimum Value
                </label>
                <input
                  id="minval"
                  type="number"
                  step="0.01"
                  value={minValue}
                  onChange={(e) => {
                    setMinValue(e.target.valueAsNumber);
                  }}
                  className="border-black border-[0.1rem] rounded-md h-[40px] px-[12px] py-[8px]"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label htmlFor="maxval" className="text-sm">
                  Maximum Value
                </label>
                <input
                  id="maxval"
                  type="number"
                  step="0.01"
                  value={maxValue}
                  onChange={(e) => {
                    setMaxValue(e.target.valueAsNumber);
                  }}
                  className="border-black border-[0.1rem] rounded-md h-[40px] px-[12px] py-[8px]"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Data will be normalized to [{minValue}, {maxValue}] range
              </p>
            </div>
          </div>

          <ButtonBlue className="w-full h-12 flex justify-center items-center">
            <UploadIcon className="w-5 h-5 mr-2" />
            Proceed to Training
          </ButtonBlue>
        </div>
        <div>
          <div className="p-6 bg-white h-full rounded-lg border-[0.1rem] border-black/20">
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              Data Preview
            </h3>
            {(!numberOfData || numberOfData < 0) && (
              <div className="h-80 flex items-center justify-center text-center">
                <div>
                  <UploadIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    No data uploaded yet
                  </p>
                  <p className="text-sm text-muted-foreground/75 mt-2">
                    Upload a CSV file to see preview
                  </p>
                </div>
              </div>
            )}
            {numberOfData && numberOfData > 0 && (
              <>
                <div className="overflow-y-auto max-h-96">
                  {/* Table preview sẽ ở đây */}
                </div>

                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Data loaded successfully
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
