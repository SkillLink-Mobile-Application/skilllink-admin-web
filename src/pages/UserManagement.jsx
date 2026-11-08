
import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/Management.css";
import {
  Avatar,
  EmptyState,
  Modal,
  Pagination,
  SearchInput,
  SortHeader,
  ToastStack,
  compareBy,
  nextSort,
  useToast,
} from "../components/Managementui";
import { blockUser, getUsers, unblockUser } from "../services/api";

// Supports both the new roles array and the old single role response.
function normalizeUser(user) {
  let roles = [];

  if (Array.isArray(user.roles)) {
    roles = user.roles;
  } else if (user.role) {
    roles = [user.role];
  }

  roles = [...new Set(
    roles
      .filter(Boolean)
      .map((role) => {
        const normalized = String(role).toUpperCase();

        if (normalized === "CUSTOMER") return "Customer";
        if (normalized === "PROVIDER") return "Provider";

        return role;
      })
  )];

  return {
    ...user,
    name: user.name || "Unknown user",
    email: user.email || "",
    roles,
    status: user.status || "Active",
  };
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState({ key: "id", dir: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [blockTarget, setBlockTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const { toasts, showToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await getUsers();

      setUsers(
        Array.isArray(data)
          ? data.map(normalizeUser)
          : []
      );
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setError("");
    setLoading(true);
    load();
  };

  const filtersActive =
    search || roleFilter !== "All" || statusFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
    setPage(1);
  };

  const setStatus = async (user, status) => {
    setBusy(true);

    try {
      const updated =
        status === "Blocked"
          ? await blockUser(user.id)
          : await unblockUser(user.id);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? normalizeUser(updated)
            : u
        )
      );

      showToast(
        status === "Blocked"
          ? `${user.name} was blocked.`
          : `${user.name} was unblocked.`,
        status === "Blocked" ? "danger" : "success"
      );

      return true;
    } catch (err) {
      showToast(err.message || "Something went wrong.", "danger");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleStatusClick = (user) => {
    if (user.status === "Active") {
      setBlockTarget(user);
    } else {
      setStatus(user, "Active");
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users
      .filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q);

        const matchesRole =
          roleFilter === "All" ||
          u.roles.includes(roleFilter);

        const matchesStatus =
          statusFilter === "All" ||
          u.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sort.key === "role") {
          const roleA = a.roles.join(", ");
          const roleB = b.roles.join(", ");

          return compareBy("role", sort.dir)(
            { role: roleA },
            { role: roleB }
          );
        }

        return compareBy(sort.key, sort.dir)(a, b);
      });
  }, [users, search, roleFilter, statusFilter, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize)
  );

  const safePage = Math.min(page, totalPages);

  const pagedUsers = filteredUsers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const onSort = (key) => {
    setSort((current) => nextSort(current, key));
    setPage(1);
  };

  // Count users by role. A user with both roles is counted in both.
  const customerCount = users.filter((u) =>
    u.roles.includes("Customer")
  ).length;

  const providerCount = users.filter((u) =>
    u.roles.includes("Provider")
  ).length;

  const blockedCount = users.filter(
    (u) => u.status === "Blocked"
  ).length;

  return (
    <div className="management-page">
      <div className="management-header">
        <div>
          <h1>User management</h1>
          <p>
            Review customers and service providers, and block accounts
            that break the rules.
          </p>
        </div>

        <span className="management-count">
          {users.length} users
        </span>
      </div>

      <div className="management-stats">
        <div className="management-stat-card">
          <span>Total users</span>
          <h2>{users.length}</h2>
        </div>

        <div className="management-stat-card">
          <span>Customers</span>
          <h2>{customerCount}</h2>
        </div>

        <div className="management-stat-card">
          <span>Providers</span>
          <h2>{providerCount}</h2>
        </div>

        <div className="management-stat-card danger">
          <span>Blocked users</span>
          <h2>{blockedCount}</h2>
        </div>
      </div>

      <div className="management-content">
        <div className="management-toolbar">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by name or email"
          />

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by role"
          >
            <option value="All">All roles</option>
            <option value="Customer">Customer</option>
            <option value="Provider">Provider</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>

          {filtersActive && (
            <button
              className="btn btn-ghost"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          )}
        </div>

        {loading && (
          <div className="page-state">
            Loading users...
          </div>
        )}

        {error && (
          <div className="page-state error">
            {error}
            <br />
            <button
              className="btn btn-ghost"
              onClick={retry}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="management-table-wrapper">
              <table className="management-table">
                <thead>
                  <tr>
                    <SortHeader
                      label="ID"
                      field="id"
                      sort={sort}
                      onSort={onSort}
                    />

                    <SortHeader
                      label="User"
                      field="name"
                      sort={sort}
                      onSort={onSort}
                    />

                    <SortHeader
                      label="Email"
                      field="email"
                      sort={sort}
                      onSort={onSort}
                    />

                    <SortHeader
                      label="Role"
                      field="role"
                      sort={sort}
                      onSort={onSort}
                    />

                    <SortHeader
                      label="Status"
                      field="status"
                      sort={sort}
                      onSort={onSort}
                    />

                    <th className="col-actions">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedUsers.map((user) => {
                    const active = user.status === "Active";

                    return (
                      <tr
                        key={user.id}
                        className={active ? "" : "row-blocked"}
                      >
                        <td className="muted">
                          #{user.id}
                        </td>

                        <td>
                          <div className="person">
                            <Avatar name={user.name} />
                            <span className="management-name">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        <td>{user.email}</td>

                        <td>
                          <div className="user-role-list">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <span
                                  key={role}
                                  className={`role-badge ${role.toLowerCase()}`}
                                >
                                  {role}
                                </span>
                              ))
                            ) : (
                              <span className="muted">
                                No role
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${user.status.toLowerCase()}`}
                          >
                            <i aria-hidden="true" />
                            {user.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className={`action-btn ${
                              active ? "block-btn" : "unblock-btn"
                            }`}
                            onClick={() => handleStatusClick(user)}
                            disabled={busy}
                            aria-label={`${
                              active ? "Block" : "Unblock"
                            } ${user.name}`}
                          >
                            {active ? "Block" : "Unblock"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <EmptyState
                  title="No users found"
                  text="No one matches the current search and filters. Try removing a filter or searching by a different name."
                  action={
                    <button
                      className="btn btn-ghost"
                      onClick={resetFilters}
                    >
                      Reset filters
                    </button>
                  }
                />
              )}
            </div>

            {filteredUsers.length > 0 && (
              <Pagination
                page={safePage}
                pageSize={pageSize}
                total={filteredUsers.length}
                onPage={setPage}
                onPageSize={(n) => {
                  setPageSize(n);
                  setPage(1);
                }}
              />
            )}
          </>
        )}
      </div>

      {blockTarget && (
        <Modal
          size="sm"
          title={`Block ${blockTarget.name}?`}
          description="They won't be able to log in until you unblock them."
          onClose={() => setBlockTarget(null)}
          footer={
            <>
              <button
                className="btn btn-ghost"
                onClick={() => setBlockTarget(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                disabled={busy}
                onClick={async () => {
                  const ok = await setStatus(
                    blockTarget,
                    "Blocked"
                  );

                  if (ok) setBlockTarget(null);
                }}
              >
                {busy ? "Blocking..." : "Block user"}
              </button>
            </>
          }
        />
      )}

      <ToastStack
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </div>
  );
}

export default UserManagement;
