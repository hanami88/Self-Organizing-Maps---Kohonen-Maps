import { Routes, Route } from "react-router-dom";
import Index from "../page/Index";
import Upload from "../page/Upload";

function Router() {
  return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
  );
}

export default Router;
