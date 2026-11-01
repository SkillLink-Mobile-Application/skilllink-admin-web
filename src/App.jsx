
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ProviderApplications from "./pages/ProviderApplications";
import Login from "./pages/Login";

function AdminLayout() {
  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <img
          src="/images/logo.png"
          alt="SkillLink Logo"
          className="dashboard-logo"
        />

        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/applications">Provider Applications</NavLink>
          <NavLink to="/users">User Management</NavLink>
          <NavLink to="/admins">Admin Management</NavLink>
        </nav>
      </aside>

      <main className="dashboard-main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<ProviderApplications />} />
          <Route path="/users" element={<h1>User Management</h1>} />
          <Route path="/admins" element={<h1>Admin Management</h1>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AdminLayout />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
