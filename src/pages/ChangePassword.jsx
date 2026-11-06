import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Management.css";
import { changePassword, mustChangePassword } from "../services/api";

function ChangePassword() {
  const navigate = useNavigate();
  const forced = mustChangePassword();

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError("");
    setSuccess("");
  };

  const validate = () => {
    const next = {};
    if (!form.current) next.current = "Enter your current password.";
    if (!form.next) next.next = "Enter a new password.";
    else if (form.next.length < 8) next.next = "Password must be at least 8 characters.";
    else if (form.next === form.current) next.next = "Choose a password different from the current one.";
    if (form.confirm !== form.next) next.confirm = "The two passwords don't match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError("");
    try {
      await changePassword(form.current, form.next);
      setForm({ current: "", next: "", confirm: "" });

      if (forced) {
        navigate("/dashboard", { replace: true });
      } else {
        setSuccess("Your password was changed.");
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="management-page">
      <div className="management-header">
        <div>
          <h1>Change password</h1>
          <p>Use a strong password that you don't use anywhere else.</p>
        </div>
      </div>

      {forced && (
        <div className="force-banner" role="status">
          You're using a temporary password. Please choose a new one to continue.
        </div>
      )}

      <div className="management-content change-password-card">
        <form onSubmit={submit} noValidate>
          <div className={`field ${errors.current ? "has-error" : ""}`}>
            <label htmlFor="cp-current">
              {forced ? "Temporary password (from your email)" : "Current password"}
            </label>
            <input
              id="cp-current"
              type="password"
              value={form.current}
              onChange={update("current")}
              autoComplete="current-password"
            />
            {errors.current && <span className="field-error">{errors.current}</span>}
          </div>

          <div className={`field ${errors.next ? "has-error" : ""}`}>
            <label htmlFor="cp-new">New password</label>
            <input
              id="cp-new"
              type="password"
              value={form.next}
              onChange={update("next")}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            {errors.next && <span className="field-error">{errors.next}</span>}
          </div>

          <div className={`field ${errors.confirm ? "has-error" : ""}`}>
            <label htmlFor="cp-confirm">Confirm new password</label>
            <input
              id="cp-confirm"
              type="password"
              value={form.confirm}
              onChange={update("confirm")}
              autoComplete="new-password"
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>

          {formError && (
            <p className="field-error" role="alert">
              {formError}
            </p>
          )}
          {success && <p className="inline-success">{success}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;