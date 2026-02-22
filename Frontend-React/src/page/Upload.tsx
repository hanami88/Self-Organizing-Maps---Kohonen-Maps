import { useState } from "react";
import { ButtonBlack, ButtonBlue } from "../components/Button";
import { ArrowLeft, Upload as UploadIcon, FileUp } from "lucide-react";
export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [inputVector, setInputVector] = useState<number | null>(null);
  const [numberOfData, setNumberOfData] = useState<number | null>(null);
  const [normalization, setNormalization] = useState<string>("Linear");
  const [data, setData] = useState<number[][] | null>(null);
  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentFile = e.target.files?.[0] || null;
    const text = await currentFile?.text();
    const rows = text?.trim().split("\n");
    const crData = rows?.map((row) => row.split(",").map(Number));
    setData(crData || null);
    setNumberOfData(rows?.length ? rows.length - 1 : null);
    setInputVector(crData?.[0].length ? crData?.[0].length : null);
    setFile(currentFile);
  };
  const handleProceedToTraining = () => {
    if (data?.length === 0 || !data) {
      alert("Please upload data first");
      return;
    }
    sessionStorage.setItem(
      "somData",
      JSON.stringify({
        data: data,
        inputVector: inputVector,
      }),
    );
    window.location.href = "/training";
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
                disabled
                value={inputVector || ""}
                className="border-black cursor-not-allowed border-[0.1rem] bg-[rgb(220, 231, 233)] rounded-md h-[40px] px-[12px] py-[8px]"
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
                  Data Normalization
                </label>
                <select
                  className="border-black border-[0.1rem] rounded-md h-[40px] px-[12px] py-[8px]"
                  name=""
                  id=""
                  value={normalization}
                  onChange={(e) => {
                    setNormalization(e.target.value);
                  }}
                >
                  <option value="Linear">Linear</option>
                  <option value="Sigmoid">Sigmoid</option>
                  <option value="Ln">Ln</option>
                  <option value="Log10">Log10</option>
                  <option value="Sqrt">Sqrt</option>
                  <option value="Arctan">Arctan</option>
                </select>
              </div>
            </div>
          </div>

          <ButtonBlue
            className="w-full h-12 flex justify-center items-center"
            onClick={handleProceedToTraining}
          >
            <UploadIcon className="w-5 h-5 mr-2" />
            Proceed to Training
          </ButtonBlue>
        </div>
        <div>
          <div className="p-6 bg-white h-full rounded-lg border-[0.1rem] border-black/20">
            <h3 className="font-semibold text-lg mb-4 text-foreground">
              Data Preview
            </h3>
            {!numberOfData || numberOfData < 0 ? (
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
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto border border-black">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-gray-200 z-10">
                      <tr>
                        <th className="border border-black px-3 py-2 text-center font-semibold w-12">
                          #
                        </th>
                        {data &&
                          data[0].map((header, index) => (
                            <th
                              key={index}
                              className="border border-black px-3 py-2 text-left font-semibold"
                            >
                              {header}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data &&
                        data.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            <td className="border border-black px-3 py-2 text-center font-medium">
                              {rowIndex + 1}
                            </td>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="border border-black px-3 py-2"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
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
