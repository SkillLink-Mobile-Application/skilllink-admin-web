const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const TOKEN_KEY = "skilllink_admin_token";
const EMAIL_KEY = "skilllink_admin_email";
const NAME_KEY = "skilllink_admin_name";
const ROLES_KEY = "skilllink_admin_roles";
const MUST_CHANGE_KEY = "skilllink_admin_must_change";

export { API_BASE_URL };

/* ---------- Session helpers ---------- */

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminEmail() {
  return localStorage.getItem(EMAIL_KEY) || "";
}

export function getAdminName() {
  return localStorage.getItem(NAME_KEY) || "";
}

export function getRoles() {
  try {
    const roles = JSON.parse(localStorage.getItem(ROLES_KEY) || "[]");
    return Array.isArray(roles) ? roles : [];
  } catch {
    return [];
  }
}

// UI only: the server re-checks this on every admin-management request.
export function isSuperAdmin() {
  return getRoles().includes("SUPER_ADMIN");
}

export function mustChangePassword() {
  return localStorage.getItem(MUST_CHANGE_KEY) === "true";
}

function saveSession(data, email) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(EMAIL_KEY, email);
  localStorage.setItem(NAME_KEY, data.name || email);
  localStorage.setItem(ROLES_KEY, JSON.stringify(data.roles || []));
  localStorage.setItem(MUST_CHANGE_KEY, data.mustChangePassword ? "true" : "false");
}

export function clearSession() {
  [TOKEN_KEY, EMAIL_KEY, NAME_KEY, ROLES_KEY, MUST_CHANGE_KEY].forEach((key) =>
    localStorage.removeItem(key)
  );
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 <= Date.now() : false;
  } catch {
    return true;
  }
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearSession();
    return false;
  }
  return true;
}

/* ---------- Core request ---------- */

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check that the backend is running.", 0);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text; // backend sometimes returns plain-text errors
    }
  }

  if (!response.ok) {
    // Expired or invalid token on a protected call -> back to login.
    if (auth && response.status === 401) {
      clearSession();
      window.location.assign("/login");
    }

    let message;
    if (typeof data === "string" && data) message = data;
    else if (data && data.message) message = data.message;
    else if (response.status === 403) message = "You don't have permission to do that.";
    else message = `Request failed (${response.status}).`;

    throw new ApiError(message, response.status);
  }

  return data;
}

/* ---------- Auth ---------- */

export async function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const data = await request("/api/admin-auth/login", {
    method: "POST",
    body: { email: normalizedEmail, password },
    auth: false,
  });

  if (!data || !data.token) {
    throw new ApiError("Sign in failed. Please try again.", 500);
  }

  saveSession(data, normalizedEmail);
  return data;
}

export const forgotPassword = (email) =>
  request("/api/admin-auth/forgot-password", {
    method: "POST",
    body: { email: email.trim().toLowerCase() },
    auth: false,
  });

export const verifyOtp = (email, otp) =>
  request("/api/admin-auth/verify-otp", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), otp },
    auth: false,
  });

export const resetPassword = (email, resetToken, newPassword) =>
  request("/api/admin-auth/reset-password", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), resetToken, newPassword },
    auth: false,
  });

export async function changePassword(currentPassword, newPassword) {
  const result = await request("/api/admin-auth/change-password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
  localStorage.setItem(MUST_CHANGE_KEY, "false");
  return result;
}

/* ---------- Admin endpoints ---------- */

export const getStats = () => request("/api/admin/stats");

export const getUsers = () => request("/api/admin/users");
export const blockUser = (id) => request(`/api/admin/users/${id}/block`, { method: "PUT" });
export const unblockUser = (id) => request(`/api/admin/users/${id}/unblock`, { method: "PUT" });

export const getAdmins = () => request("/api/admin/admins");
export const createAdmin = (payload) =>
  request("/api/admin/admins", { method: "POST", body: payload });
export const updateAdmin = (id, payload) =>
  request(`/api/admin/admins/${id}`, { method: "PUT", body: payload });
export const deleteAdmin = (id) => request(`/api/admin/admins/${id}`, { method: "DELETE" });

export const getApplications = () => request("/api/admin/provider-applications");
export const approveApplication = (id) =>
  request(`/api/admin/provider-applications/${id}/approve`, { method: "PUT" });
export const rejectApplication = (id) =>
  request(`/api/admin/provider-applications/${id}/reject`, { method: "PUT" });