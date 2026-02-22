import { Routes, Route } from "react-router-dom";
import Index from "../page/Index";
import Upload from "../page/Upload";
import Training from "../page/Training";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/training" element={<Training />} />
    </Routes>
  );
}

export default Router;
