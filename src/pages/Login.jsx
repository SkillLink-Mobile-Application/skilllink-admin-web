import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import { login } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Set by the reset-password page after a successful reset
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await login(email, password);
      navigate(data.mustChangePassword ? "/change-password" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side */}
      <div className="login-left">
        <img
          src="/images/logo.png"
          alt="SkillLink Logo"
          className="skilllink-logo"
        />

        <h2>Admin Portal</h2>

        <p>
          Manage users, review provider applications,
          and keep your SkillLink platform running smoothly.
        </p>
      </div>

      {/* Right Side */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back!</h2>
          <p>Sign in to your administrator account</p>

          {successMessage && (
            <div className="login-success" role="status">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>

            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

            <div className="auth-links">
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="login-button" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="login-footer">
            Secure access for SkillLink administrators
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;