import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    diagnosis: "",
    cancerStage: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Sign-up failed");
      alert("Account created! Please log in.");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card p-4" style={{ maxWidth: 480, margin: "auto" }} onSubmit={handleSubmit}>
      <h2 className="mb-3">Sign Up</h2>
      {["firstName","lastName","email","password","diagnosis","cancerStage"].map((field) => (
        <div className="mb-3" key={field}>
          <input
            type={field === "password" ? "password" : "text"}
            name={field}
            className="form-control"
            placeholder={field}
            value={formData[field]}
            onChange={handleChange}
            required={["firstName","lastName","email","password"].includes(field)}
          />
        </div>
      ))}
      {error && <div className="alert alert-danger">{error}</div>}
      <button type="submit" className="btn btn-primary w-100">Sign up</button>
    </form>
  );
}
