import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function LogInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id || data.user._id); // keep compatibility
      localStorage.setItem("role", data.user.role); // NEW
      if (data.user.linkedPatient) {
        localStorage.setItem("linkedPatient", data.user.linkedPatient); // NEW
      }

      // notify the app so Nav/Footer update immediately
      window.dispatchEvent(new Event("auth-change"));

      if (data.user.role === "caregiver") {
        navigate("/caregiver-dash");
      } else {
        navigate("/"); 
      }
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card p-4" style={{ maxWidth: 480, margin: "auto" }} onSubmit={handleSubmit}>
      <h2 className="mb-3">Log In</h2>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <button type="submit" className="btn btn-primary w-100">Log in</button>
    </form>
  );
}
