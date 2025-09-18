import { Link, NavLink, useNavigate } from "react-router-dom";

export default function NavBar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-primary navbar-dark py-3">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">OncoBuddy</Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {token && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/mood-check">Mood Check</NavLink>
                </li>
                {/* add more links here later */}
              </>
            )}
          </ul>
          <div className="d-flex gap-2">
            {!token ? (
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
