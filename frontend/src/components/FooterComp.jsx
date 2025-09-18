// src/components/FooterComp.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function hasValidToken() {
  const raw = localStorage.getItem("token");
  // treat missing, "null", and "undefined" as logged-out
  if (!raw || raw === "null" || raw === "undefined") return false;
  return true;
}

export default function FooterComp() {
  const [isAuthed, setIsAuthed] = useState(() => hasValidToken());

  useEffect(() => {
    const update = () => setIsAuthed(hasValidToken());
    // Fires when other tabs change localStorage
    window.addEventListener("storage", update);
    // Fires in THIS tab when you dispatch it on login/logout
    window.addEventListener("auth-change", update);
    // Also refresh when tab regains focus (helps after redirects)
    document.addEventListener("visibilitychange", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("auth-change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <footer className="py-3 border-top mt-auto">
      <ul className="nav justify-content-center">
        {!isAuthed ? (
          <>
            <li className="nav-item">
              <Link to="/" className="nav-link px-2">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/login" className="nav-link px-2">Login</Link>
            </li>
            <li className="nav-item">
              <Link to="/signup" className="nav-link px-2">Sign-up</Link>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link to="/" className="nav-link px-2">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/mood-check" className="nav-link px-2">Mood Check</Link>
            </li>
          </>
        )}
      </ul>
      <p className="text-center text-muted mt-2">
        © {new Date().getFullYear()} OncoBuddy – AI Cancer Support
      </p>
    </footer>
  );
}
