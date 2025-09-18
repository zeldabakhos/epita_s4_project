import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function hasValidToken() {
  const t = localStorage.getItem("token");
  return !!(t && t !== "null" && t !== "undefined");
}

export default function NavBar() {
  const [isAuthed, setIsAuthed] = useState(() => hasValidToken());
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => setIsAuthed(hasValidToken());
    // When other tabs change localStorage
    window.addEventListener("storage", update);
    // When THIS tab logs in/out (we dispatch this event)
    window.addEventListener("auth-change", update);
    // Also refresh when tab regains focus (after redirects)
    document.addEventListener("visibilitychange", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("auth-change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const handleLogout = () => {
    // remove only what we set
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    // notify app (Footer/Nav listen to this)
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-primary navbar-dark py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">OncoBuddy</Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAuthed && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/mood-check">Mood Check</NavLink>
                </li>
                {/* add more links here later */}
              </>
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
