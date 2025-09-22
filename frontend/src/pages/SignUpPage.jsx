import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ---- validators ----
const validateAll = (values) => {
  const errs = {};
  if (!values.firstName.trim()) errs.firstName = "First name is required.";
  else if (values.firstName.trim().length < 2) errs.firstName = "First name must be at least 2 characters.";

  if (!values.lastName.trim()) errs.lastName = "Last name is required.";
  else if (values.lastName.trim().length < 2) errs.lastName = "Last name must be at least 2 characters.";

  if (!values.email.trim()) errs.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = "Enter a valid email address.";

  if (!values.password) errs.password = "Password is required.";
  else if (values.password.length < 10) errs.password = "Password must be at least 6 characters.";

  // diagnosis / cancerStage optional for now — add rules if you need them
  return errs;
};

// maps typical Express/Joi/Zod error shapes into field errors + a top message
const applyServerErrors = (data, setFieldErrors, setTopError) => {
  const fe = {};
  if (Array.isArray(data?.errors)) {
    // e.g. [{path:'password', msg:'too short'}]
    for (const e of data.errors) {
      const key = e.path || e.field || e.param;
      if (key) fe[key] = e.msg || e.message || "Invalid value.";
    }
  } else if (data?.errors && typeof data.errors === "object") {
    // e.g. { password: "too short", email: "invalid" } or Joi nested
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
    diagnosis: "",
    cancerStage: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [topError, setTopError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    // live-validate only the field being edited
    setFieldErrors((prev) => {
      const next = { ...prev };
      // re-run single-field rule quickly
      const single = validateAll({ ...formData, [name]: value });
      // keep previous errors but replace the one for this field
      if (single[name]) next[name] = single[name];
      else delete next[name];
      return next;
    });
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTopError("");

    // client-side validation first
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

      alert("Account created! Please log in.");
      window.location.href = "/login";
    } catch (err) {
      setTopError(err.message || "Sign-up failed, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldList = ["firstName","lastName","email","password","diagnosis","cancerStage"];

  return (
    <form className="card p-4" style={{ maxWidth: 480, margin: "auto" }} onSubmit={handleSubmit} noValidate>
      <h2 className="mb-3">Sign Up</h2>

      {topError && (
        <div className="alert alert-danger" role="alert">
          {topError}
          {/* summary of first few field issues */}
          <ul className="mb-0 mt-2">
            {Object.entries(fieldErrors).slice(0,3).map(([k, v]) => (
              <li key={k}><strong>{k}:</strong> {v}</li>
            ))}
          </ul>
        </div>
      )}

      {fieldList.map((field) => {
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
              required={["firstName","lastName","email","password"].includes(field)}
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

      <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
        {submitting ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
