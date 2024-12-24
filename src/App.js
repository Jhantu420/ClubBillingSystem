import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Update from "./Update";
import "./App.css"; // Ensure to import the CSS file for styling
import DawnloadPDF from "./DawnloadPDF";

function App() {
  return (
    <>
      <h1 className="title">
        Bhatora Golap Sangha <span className="rose-icon">🌹</span>
      </h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/update" element={<Update />} />
        <Route path="/dawnload-pdf" element={<DawnloadPDF />} />
      </Routes>
    </>
  );
}

export default App;
