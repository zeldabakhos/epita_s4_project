// src/components/FooterComp.jsx
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FooterComp() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    // also handle changes within the same tab
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
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
              <NavLink to="/mood-check" className="nav-link px-2">Mood Check</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/chat" className="nav-link px-2">Chat</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/resources">Resources</NavLink>
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
