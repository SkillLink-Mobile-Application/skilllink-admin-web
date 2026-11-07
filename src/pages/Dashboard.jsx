import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";
import { getStats } from "../services/api";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const [greeting, setGreeting] = useState(getGreeting());
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = (key) => (stats ? stats[key] : "–");

  return (
    <div className="dashboard-page">

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Manage your SkillLink platform</p>
        </div>

        <span className="admin-badge">Administrator</span>
      </header>

      {/* Time-based Greeting */}
      <section className="dashboard-greeting">
        <div>
          <h2>{greeting}, Admin! 👋</h2>
          <p>
            Welcome to the SkillLink Admin Portal.
            Here's what's happening with your platform.
          </p>
        </div>

        <span className="greeting-icon">🟡</span>
      </section>

      {error && <div className="page-state error">Couldn't load statistics: {error}</div>}

      {/* Summary Cards */}
      <section className="dashboard-cards">

        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <h3>Total Users</h3>
          <p>{value("totalUsers")}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🔧</div>
          <h3>Service Providers</h3>
          <p>{value("serviceProviders")}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">⏳</div>
          <h3>Pending Applications</h3>
          <p>{value("pendingApplications")}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🛡️</div>
          <h3>Total Administrators</h3>
          <p>{value("totalAdmins")}</p>
        </div>

      </section>

      {/* Quick Actions */}
      <section className="dashboard-welcome">
        <h2>Quick Actions</h2>
        <p>Choose a task to manage your platform.</p>

        <div className="quick-actions">
          <Link to="/applications" className="quick-action-button">
            Review Applications →
          </Link>

          <Link to="/users" className="quick-action-button secondary">
            Manage Users →
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Dashboard;