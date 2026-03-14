import "./App.css";
import { Route, Routes } from "react-router-dom";
import NotFoundPage from "./pages/404/NotFound.Page";
import TestPage from "./pages/404/test.page";

function App() {
  return (
    <div className="min-h-screen w-full">
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;