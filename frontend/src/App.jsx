import "./styles/pastel.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import FooterComp from "./components/FooterComp";
import HomePage from "./pages/HomePage";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import MoodCheck from "./pages/MoodCheck";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="pastel-app">
      <Router>
        <NavBar />
        <main className="pastel-main">
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
    </div>
  );
}
