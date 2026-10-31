import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import MeetingPage from "./pages/MeetingPage.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/m/:id" element={<MeetingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
