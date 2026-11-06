import "../App.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="login-container">
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

      <div className="login-right">
        <div className="login-card">
          <h2>{title}</h2>
          <p>{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;