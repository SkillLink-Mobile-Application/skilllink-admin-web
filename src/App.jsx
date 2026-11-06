
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   NavLink,
//   Navigate,
// } from "react-router-dom";

// import Dashboard from "./pages/Dashboard";
// import ProviderApplications from "./pages/ProviderApplications";
// import UserManagement from "./pages/UserManagement";
// import AdminManagement from "./pages/AdminManagement";
// import Login from "./pages/Login";

// function AdminLayout() {
//   return (
//     <div className="dashboard-container">
//       <aside className="dashboard-sidebar">
//         <img
//           src="/images/logo.png"
//           alt="SkillLink Logo"
//           className="dashboard-logo"
//         />

//         <nav>
//           <NavLink to="/dashboard">
//             Dashboard
//           </NavLink>

//           <NavLink to="/applications">
//             Provider Applications
//           </NavLink>

//           <NavLink to="/users">
//             User Management
//           </NavLink>

//           <NavLink to="/admins">
//             Admin Management
//           </NavLink>
//         </nav>
//       </aside>

//       <main className="dashboard-main">
//         <Routes>
//           <Route path="/dashboard" element={<Dashboard />} />

//           <Route
//             path="/applications"
//             element={<ProviderApplications />}
//           />

//           <Route
//             path="/users"
//             element={<UserManagement />}
//           />

//           <Route
//             path="/admins"
//             element={<AdminManagement />}
//           />

//           <Route
//             path="*"
//             element={<Navigate to="/dashboard" replace />}
//           />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />

//         <Route path="/*" element={<AdminLayout />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ProviderApplications from "./pages/ProviderApplications";
import UserManagement from "./pages/UserManagement";
import AdminManagement from "./pages/AdminManagement";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import {
  clearSession,
  getAdminName,
  isSuperAdmin,
} from "./services/api";
import "./styles/Extras.css";

function AdminLayout() {
  const navigate = useNavigate();
  const superAdmin = isSuperAdmin();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

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
          {superAdmin && <NavLink to="/admins">Admin Management</NavLink>}
          <NavLink to="/change-password">Change Password</NavLink>
        </nav>

        <p className="sidebar-user">
          {getAdminName()}
          <small>{superAdmin ? "Super Admin" : "Admin"}</small>
        </p>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <main className="dashboard-main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<ProviderApplications />} />
          <Route path="/users" element={<UserManagement />} />
          <Route
            path="/admins"
            element={superAdmin ? <AdminManagement /> : <Navigate to="/dashboard" replace />}
          />
          <Route path="/change-password" element={<ChangePassword />} />
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
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <ResetPassword />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;