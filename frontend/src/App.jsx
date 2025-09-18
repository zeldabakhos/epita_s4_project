import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import FooterComp from "./components/FooterComp";

// Pages
import HomePage from "./pages/HomePage";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import MoodCheck from "./pages/MoodCheck";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Router>
      <NavBar />
      <main className="container py-4" style={{ minHeight: "calc(100vh - 180px)" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/mood-check" element={<MoodCheck />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <FooterComp />
    </Router>
  );
}
