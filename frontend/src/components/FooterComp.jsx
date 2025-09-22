// src/components/FooterComp.jsx
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FooterComp() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };

    window.addEventListener("storage", handleStorageChange);
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
        ) : role === "patient" ? (
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
              <NavLink to="/resources" className="nav-link px-2">Resources</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/caregiver" className="nav-link px-2">Caregiver</NavLink>
            </li>
          </>
        ) : role === "caregiver" ? (
          <>
            <li className="nav-item">
              <Link to="/" className="nav-link px-2">Home</Link>
            </li>
            <li className="nav-item">
              <NavLink to="/caregiver-dash" className="nav-link px-2">Caregiver Dashboard</NavLink>
            </li>
          </>
        ) : null}
      </ul>
      <p className="text-center text-muted mt-2">
        © {new Date().getFullYear()} OncoBuddy – AI Cancer Support
      </p>
    </footer>
  );
}
