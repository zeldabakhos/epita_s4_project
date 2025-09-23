// src/pages/SignUpPage.jsx
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ---------------- Tiny Toast component (inline) ---------------- */
function Toast({ open, title = "Success", message, onClose, variant = "success", duration = 1600 }) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(id);
  }, [open, onClose, duration]);

  if (!open) return null;

  const palette = {
    success: { bg: "#0ea5e9", text: "#fff" },       // blue-ish
    info:    { bg: "#6366f1", text: "#fff" },
    warning: { bg: "#f59e0b", text: "#111827" },
    danger:  { bg: "#ef4444", text: "#fff" },
  };
  const { bg, text } = palette[variant] || palette.success;

  return (
    <div style={{
      position: "fixed",
      right: 16, bottom: 16, zIndex: 1060,
      display: "flex", gap: 12, alignItems: "flex-start",
      minWidth: 280, maxWidth: 420,
      background: "#ffffff",
      border: "1px solid rgba(0,0,0,.06)",
      borderRadius: 14,
      boxShadow: "0 10px 30px rgba(0,0,0,.12)",
      padding: 14
    }}>
      <div style={{
        width: 10, borderRadius: 9999, alignSelf: "stretch", background: bg
      }} />
      <div style={{ flex: 1, color: "#111827" }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, color: bg }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.35 }}>{message}</div>
      </div>
      <button
        aria-label="Close toast"
        onClick={onClose}
        style={{
          border: "none", background: "transparent",
          color: "#6b7280", cursor: "pointer", fontSize: 18, lineHeight: 1
        }}
      >
        ×
      </button>
    </div>
  );
}

/* ---------------- Your page (unchanged logic, prettier notif) ---------------- */
const validateAll = (values) => {
  const errs = {};
  if (!values.firstName.trim()) errs.firstName = "First name is required.";
  else if (values.firstName.trim().length < 2) errs.firstName = "First name must be at least 2 characters.";

  if (!values.lastName.trim()) errs.lastName = "Last name is required.";
  else if (values.lastName.trim().length < 2) errs.lastName = "Last name must be at least 2 characters.";

  if (!values.email.trim()) errs.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = "Enter a valid email address.";

  if (!values.password) errs.password = "Password is required.";
  else if (values.password.length < 12) errs.password = "Password must be at least 12 characters.";

  if (values.role === "patient" && !values.diagnosis.trim()) {
    errs.diagnosis = "Diagnosis is required for patients.";
  }
  return errs;
};

const applyServerErrors = (data, setFieldErrors, setTopError) => {
  const fe = {};
  if (Array.isArray(data?.errors)) {
    for (const e of data.errors) {
      const key = e.path || e.field || e.param;
      if (key) fe[key] = e.msg || e.message || "Invalid value.";
    }
  } else if (data?.errors && typeof data.errors === "object") {
    for (const [k, v] of Object.entries(data.errors)) {
      fe[k] = typeof v === "string" ? v : v?.message || "Invalid value.";
    }
  }
  if (Object.keys(fe).length) setFieldErrors((prev) => ({ ...prev, ...fe }));
  setTopError(data?.message || "Please fix the highlighted fields.");
};

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "patient",
    diagnosis: "",
    cancerStage: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [topError, setTopError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTopError("");

    const errs = validateAll(formData);
    setFieldErrors(errs);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      diagnosis: true,
      cancerStage: true,
    });
    if (Object.keys(errs).length) {
      setTopError("Please correct the errors below.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        applyServerErrors(data, setFieldErrors, setTopError);
        return;
      }

      // 🎉 Pretty toast instead of window.alert
      setToastMsg("Account created successfully. Taking you to Log in…");
      setToastOpen(true);

      // Redirect after the toast (matches Toast duration)
      setTimeout(() => {
        window.location.href = "/login";
      }, 1600);
    } catch (err) {
      setTopError(err.message || "Sign-up failed, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldList = ["firstName","lastName","email","password","diagnosis","cancerStage"];

  return (
    <>
      <form className="card p-4" style={{ maxWidth: 480, margin: "auto" }} onSubmit={handleSubmit} noValidate>
        <h2 className="mb-3">Sign Up</h2>

        <div className="mb-3">
          <label className="form-label">I am a...</label>
          <select
            name="role"
            className="form-select"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="patient">Patient</option>
            <option value="caregiver">Caregiver</option>
          </select>
        </div>

        {topError && (
          <div className="alert alert-danger" role="alert">
            {topError}
            <ul className="mb-0 mt-2">
              {Object.entries(fieldErrors).slice(0,3).map(([k, v]) => (
                <li key={k}><strong>{k}:</strong> {v}</li>
              ))}
            </ul>
          </div>
        )}

        {["firstName","lastName","email","password"].map((field) => {
          const isPwd = field === "password";
          const showError = touched[field] && !!fieldErrors[field];
          return (
            <div className="mb-3" key={field}>
              <input
                type={isPwd ? "password" : field === "email" ? "email" : "text"}
                name={field}
                className={`form-control ${showError ? "is-invalid" : ""}`}
                placeholder={field}
                value={formData[field]}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                minLength={isPwd ? 6 : undefined}
                aria-invalid={showError ? "true" : "false"}
                aria-describedby={showError ? `${field}-error` : undefined}
              />
              {showError && (
                <div id={`${field}-error`} className="invalid-feedback">
                  {fieldErrors[field]}
                </div>
              )}
            </div>
          );
        })}

        {formData.role === "patient" && fieldList.slice(4).map((field) => {
          const showError = touched[field] && !!fieldErrors[field];
          return (
            <div className="mb-3" key={field}>
              <input
                type="text"
                name={field}
                className={`form-control ${showError ? "is-invalid" : ""}`}
                placeholder={field}
                value={formData[field]}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={showError ? "true" : "false"}
                aria-describedby={showError ? `${field}-error` : undefined}
                required={field === "diagnosis"}
              />
              {showError && (
                <div id={`${field}-error`} className="invalid-feedback">
                  {fieldErrors[field]}
                </div>
              )}
            </div>
          );
        })}

        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      {/* Toast lives outside the form so it can overlay the page */}
      <Toast
        open={toastOpen}
        message={toastMsg}
        onClose={() => setToastOpen(false)}
        variant="success"
      />
    </>
  );
}
