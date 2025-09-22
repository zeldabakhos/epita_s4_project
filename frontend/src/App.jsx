import "./styles/pastel.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import FooterComp from "./components/FooterComp";
import HomePage from "./pages/HomePage";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import MoodCheck from "./pages/MoodCheck";
import NotFoundPage from "./pages/NotFoundPage";
import ChatPage from "./pages/ChatPage.jsx";
import ResourcesPage from "./pages/ResourcesPage";
import InviteCaregiverPage from "./pages/InviteCaregiverPage.jsx";
import CaregiverDashboard from "./pages/CaregiverDashboard.jsx";

const hasToken = () => {
  const t = localStorage.getItem("token");
  return !!(t && t !== "null" && t !== "undefined");
};
const RequireAuth = ({ children }) => (hasToken() ? children : <Navigate to="/login" replace />);

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
            <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/caregiver" element={<InviteCaregiverPage />} />
            <Route path="/caregiver-dash" element={<CaregiverDashboard />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <FooterComp />
      </Router>
    </div>
  );
}
