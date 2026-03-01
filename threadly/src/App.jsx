import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* more routes coming next steps */}
      </Routes>
    </>
  );
}