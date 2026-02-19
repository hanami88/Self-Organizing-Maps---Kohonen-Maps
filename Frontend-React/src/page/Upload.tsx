import { ButtonBlack, ButtonBlue } from "../components/Button";
import { ArrowLeft, Upload as UploadIcon, FileUp } from "lucide-react";
export default function Upload() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Upload Training Data
        </h2>
        <p className="text-muted-foreground">
          Prepare your dataset and configure normalization parameters
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 ">
        <div className="space-y-6 ">
          <div className="p-6 bg-white rounded-lg border-[0.1rem] border-black/20">
            <h3 className="font-semibold text-lg mb-6 text-foreground">
              Data Configuration
            </h3>
            <div className="space-y-4 mb-6 pb-6 border-b border-blue-100">
              <div>
                <div className="text-sm font-medium text-foreground block mb-3">
                  Select Data File
                </div>
                <div className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-black/20 rounded-lg cursor-pointer hover:border-black transition-colors ">
                  <div className="text-center">
                    <FileUp className="w-10 h-10 mx-auto " />
                    <span className="text-sm font-medium text-foreground">
                      {/* {fileName || "Click to select CSV file"} */}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      CSV format with comma-separated values
                    </span>
                  </div>
                  <input type="file" accept=".csv" className="hidden" />
                </div>
                <ButtonBlack className="w-full mt-3 text-center">
                  Download Template
                </ButtonBlack>
              </div>
            </div>
            <div className="space-y-2 mb-6 flex flex-col  ">
              <label htmlFor="dimensions" className="text-sm font-medium">
                Input Vector Dimensions
              </label>
              <input
                id="dimensions"
                type="number"
                min="1"
                className="border-black border-[0.1rem] rounded-md h-[40px] px-[12px] py-[8px]"
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
                className="border-black border-[0.1rem] cursor-not-allowed bg-[rgb(220, 231, 233)] rounded-md h-[40px] px-[12px] py-[8px]"
              />
              {/* <p className="text-xs text-muted-foreground">
                {dataQuantity > 0
                  ? `${dataQuantity} samples detected`
                  : "Upload data to see quantity"}
              </p> */}
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
                  // value={normalizeMax}
                  // onChange={(e) =>
                  //   setNormalizeMax(parseFloat(e.target.value) || 1)
                  // }
                  className="border-black border-[0.1rem] rounded-md h-[40px] px-[12px] py-[8px]"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {/* Data will be normalized to [{normalizeMin}, {normalizeMax}] */}
                range
              </p>
            </div>
          </div>
          <ButtonBlue
            // onClick={handleProceedToTraining}
            // disabled={dataPoints.length === 0}
            className="w-full h-12 flex justify-center items-center"
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
            {/* {dataPoints.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Showing {Math.min(10, dataPoints.length)} of{" "}
                  {dataPoints.length} samples */}
          </div>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-blue-50 border-b border-blue-200">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-foreground">
                    #
                  </th>
                  {/* {Array.from({ length: inputDimensions }).map((_, i) => (
                          <th
                            key={i}
                            className="text-right px-3 py-2 font-medium text-foreground"
                          >
                            F{i + 1}
                          </th>
                        ))} */}
                </tr>
              </thead>
              <tbody>
                {/* {dataPoints.slice(0, 10).map((point, idx) => (
                        <tr
                          key={point.id}
                          className="border-b border-blue-100 hover:bg-blue-50/50"
                        >
                          <td className="px-3 py-2 text-muted-foreground font-medium">
                            {idx + 1} */}
                {/* </td> */}
                {/* {point.values
                            .slice(0, inputDimensions)
                            .map((val, i) => (
                              <td
                                key={i}
                                className="text-right px-3 py-2 text-foreground"
                              >
                                {val.toFixed(4)}
                              </td>
                            ))} */}
                {/* </tr>
                      ))} */}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              ✓ Data loaded successfully
            </p>
            {/* <p className="text-xs text-green-700 mt-1"> */}
            {/* {dataQuantity} data points with {inputDimensions} dimensions
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <p>Upload a CSV file to preview your data</p>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </main>
  );
}
