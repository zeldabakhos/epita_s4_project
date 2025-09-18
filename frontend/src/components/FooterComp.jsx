// src/components/FooterComp.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FooterComp() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // keep footer in sync if token changes (logout/login)
  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <footer className="py-3 border-top mt-auto">
      <ul className="nav justify-content-center">
        {!token ? (
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
            {/* add more authenticated links later, e.g. /chat */}
          </>
        )}
      </ul>
      <p className="text-center text-muted mt-2">
        © {new Date().getFullYear()} OncoBuddy – AI Cancer Support
      </p>
    </footer>
  );
}
