import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function hasValidToken() {
  const t = localStorage.getItem("token");
  return !!(t && t !== "null" && t !== "undefined");
}

export default function NavBar() {
  const [isAuthed, setIsAuthed] = useState(() => hasValidToken());
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      setIsAuthed(hasValidToken());
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", update);
    window.addEventListener("auth-change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("auth-change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-primary navbar-dark py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">OncoBuddy</Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAuthed && role === "patient" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/mood-check">Mood Check</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/chat">Chat</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/resources">Resources</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/caregiver">Caregiver</NavLink>
                </li>
              </>
            )}

            {isAuthed && role === "caregiver" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/caregiver-dash">Caregiver Dashboard</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex gap-2">
            {!isAuthed ? (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm">Log in</Link>
                <Link to="/signup" className="btn btn-light btn-sm">Sign up</Link>
              </>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
