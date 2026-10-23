
import { useState } from "react";
import "../App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Login UI ready! Backend connection is pending.");
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

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            <button type="submit" className="login-button">
              Sign In
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
