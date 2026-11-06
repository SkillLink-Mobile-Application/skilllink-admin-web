import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { forgotPassword, verifyOtp } from "../services/api";

const RESEND_SECONDS = 60;

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      await forgotPassword(email);
      setStep("otp");
      setOtp("");
      setCooldown(RESEND_SECONDS);
      setInfo("If this email belongs to an administrator, a 5-digit code has been sent to it.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      const { resetToken } = await verifyOtp(email, otp);
      navigate("/reset-password", {
        replace: true,
        state: { email: email.trim().toLowerCase(), resetToken },
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (step === "email") {
    return (
      <AuthLayout
        title="Forgot password?"
        subtitle="Enter your admin email and we'll send you a 5-digit code."
      >
        <form onSubmit={sendCode}>
          <label htmlFor="fp-email">Email Address</label>
          <input
            id="fp-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={submitting}>
            {submitting ? "Sending..." : "Send code"}
          </button>

          <div className="auth-links">
            <Link to="/login" className="auth-link">
              ← Back to sign in
            </Link>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Enter your code"
      subtitle={`We sent a 5-digit code to ${email.trim().toLowerCase()}. It expires in 10 minutes.`}
    >
      <form onSubmit={submitOtp}>
        {info && (
          <div className="login-success" role="status">
            {info}
          </div>
        )}

        <label htmlFor="fp-otp">Verification code</label>
        <input
          id="fp-otp"
          className="otp-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={5}
          placeholder="•••••"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))}
          required
        />

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="login-button"
          disabled={submitting || otp.length !== 5}
        >
          {submitting ? "Checking..." : "Verify code"}
        </button>

        <div className="auth-links">
          <button
            type="button"
            className="auth-link"
            onClick={() => sendCode()}
            disabled={cooldown > 0 || submitting}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>

          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setStep("email");
              setError("");
              setInfo("");
            }}
          >
            Change email
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;