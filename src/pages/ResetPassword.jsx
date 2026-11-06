import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { resetPassword } from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, resetToken } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Opened directly or refreshed: there's no verified code, so start over.
  if (!email || !resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email, resetToken, password);
      navigate("/login", {
        replace: true,
        state: { message: "Password updated. Sign in with your new password." },
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a new password for your administrator account."
    >
      <form onSubmit={handleSubmit}>
        <label htmlFor="rp-password">New password</label>
        <div className="password-wrapper">
          <input
            id="rp-password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="show-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <label htmlFor="rp-confirm">Confirm new password</label>
        <input
          id="rp-confirm"
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter the new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="login-button" disabled={submitting}>
          {submitting ? "Saving..." : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;