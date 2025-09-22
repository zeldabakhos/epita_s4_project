// pages/InviteCaregiverPage.jsx
import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function InviteCaregiverPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/caregivers/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ caregiverEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to invite caregiver");
      setMessage("Caregiver invited successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="card p-4" style={{ maxWidth: 480, margin: "auto" }}>
      <h2 className="mb-3">Invite a Caregiver</h2>
      <form onSubmit={handleInvite}>
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Caregiver's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-100">Send Invite</button>
      </form>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}
