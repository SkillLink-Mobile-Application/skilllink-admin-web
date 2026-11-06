// import { useMemo, useState } from "react";
// import "../styles/Management.css";
// import {
//   Avatar,
//   EmptyState,
//   Modal,
//   Pagination,
//   SearchInput,
//   SortHeader,
//   ToastStack,
//   compareBy,
//   nextSort,
//   useToast,
// } from "../components/Managementui";

// const initialUsers = [
//   { id: 1, name: "Kasun Perera", email: "kasun@gmail.com", role: "Customer", status: "Active" },
//   { id: 2, name: "Nimal Fernando", email: "nimal@gmail.com", role: "Provider", status: "Active" },
//   { id: 3, name: "Amali Silva", email: "amali@gmail.com", role: "Customer", status: "Blocked" },
//   { id: 4, name: "Saman Kumara", email: "saman@gmail.com", role: "Provider", status: "Active" },
//   { id: 5, name: "Tharushi Perera", email: "tharushi@gmail.com", role: "Customer", status: "Active" },
// ];

// function UserManagement() {
//   const [users, setUsers] = useState(initialUsers);
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("All");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [sort, setSort] = useState({ key: "id", dir: "asc" });
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [blockTarget, setBlockTarget] = useState(null);
//   const { toasts, showToast, dismissToast } = useToast();

//   const filtersActive = search || roleFilter !== "All" || statusFilter !== "All";

//   const resetFilters = () => {
//     setSearch("");
//     setRoleFilter("All");
//     setStatusFilter("All");
//     setPage(1);
//   };

//   const setStatus = (user, status) => {
//     setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status } : u)));
//     showToast(
//       status === "Blocked" ? `${user.name} was blocked.` : `${user.name} was unblocked.`,
//       status === "Blocked" ? "danger" : "success"
//     );
//   };

//   const handleStatusClick = (user) => {
//     // Blocking is disruptive, so confirm first. Unblocking is safe, so do it right away.
//     if (user.status === "Active") setBlockTarget(user);
//     else setStatus(user, "Active");
//   };

//   const filteredUsers = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return users
//       .filter((u) => {
//         const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
//         const matchesRole = roleFilter === "All" || u.role === roleFilter;
//         const matchesStatus = statusFilter === "All" || u.status === statusFilter;
//         return matchesSearch && matchesRole && matchesStatus;
//       })
//       .sort(compareBy(sort.key, sort.dir));
//   }, [users, search, roleFilter, statusFilter, sort]);

//   const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
//   const safePage = Math.min(page, totalPages);
//   const pagedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

//   const onSort = (key) => {
//     setSort((current) => nextSort(current, key));
//     setPage(1);
//   };

//   return (
//     <div className="management-page">
//       <div className="management-header">
//         <div>
//           <h1>User management</h1>
//           <p>Review customers and service providers, and block accounts that break the rules.</p>
//         </div>
//         <span className="management-count">{users.length} users</span>
//       </div>

//       <div className="management-stats">
//         <div className="management-stat-card">
//           <span>Total users</span>
//           <h2>{users.length}</h2>
//         </div>
//         <div className="management-stat-card">
//           <span>Customers</span>
//           <h2>{users.filter((u) => u.role === "Customer").length}</h2>
//         </div>
//         <div className="management-stat-card">
//           <span>Providers</span>
//           <h2>{users.filter((u) => u.role === "Provider").length}</h2>
//         </div>
//         <div className="management-stat-card danger">
//           <span>Blocked users</span>
//           <h2>{users.filter((u) => u.status === "Blocked").length}</h2>
//         </div>
//       </div>

//       <div className="management-content">
//         <div className="management-toolbar">
//           <SearchInput
//             value={search}
//             onChange={(v) => {
//               setSearch(v);
//               setPage(1);
//             }}
//             placeholder="Search by name or email"
//           />

//           <select
//             value={roleFilter}
//             onChange={(e) => {
//               setRoleFilter(e.target.value);
//               setPage(1);
//             }}
//             aria-label="Filter by role"
//           >
//             <option value="All">All roles</option>
//             <option value="Customer">Customer</option>
//             <option value="Provider">Provider</option>
//           </select>

//           <select
//             value={statusFilter}
//             onChange={(e) => {
//               setStatusFilter(e.target.value);
//               setPage(1);
//             }}
//             aria-label="Filter by status"
//           >
//             <option value="All">All statuses</option>
//             <option value="Active">Active</option>
//             <option value="Blocked">Blocked</option>
//           </select>

//           {filtersActive && (
//             <button className="btn btn-ghost" onClick={resetFilters}>
//               Reset filters
//             </button>
//           )}
//         </div>

//         <div className="management-table-wrapper">
//           <table className="management-table">
//             <thead>
//               <tr>
//                 <SortHeader label="ID" field="id" sort={sort} onSort={onSort} />
//                 <SortHeader label="User" field="name" sort={sort} onSort={onSort} />
//                 <SortHeader label="Email" field="email" sort={sort} onSort={onSort} />
//                 <SortHeader label="Role" field="role" sort={sort} onSort={onSort} />
//                 <SortHeader label="Status" field="status" sort={sort} onSort={onSort} />
//                 <th className="col-actions">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pagedUsers.map((user) => {
//                 const active = user.status === "Active";
//                 return (
//                   <tr key={user.id} className={active ? "" : "row-blocked"}>
//                     <td className="muted">#{user.id}</td>
//                     <td>
//                       <div className="person">
//                         <Avatar name={user.name} />
//                         <span className="management-name">{user.name}</span>
//                       </div>
//                     </td>
//                     <td>{user.email}</td>
//                     <td>
//                       <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
//                     </td>
//                     <td>
//                       <span className={`status-badge ${user.status.toLowerCase()}`}>
//                         <i aria-hidden="true" />
//                         {user.status}
//                       </span>
//                     </td>
//                     <td>
//                       <button
//                         className={`action-btn ${active ? "block-btn" : "unblock-btn"}`}
//                         onClick={() => handleStatusClick(user)}
//                         aria-label={`${active ? "Block" : "Unblock"} ${user.name}`}
//                       >
//                         {active ? "Block" : "Unblock"}
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {filteredUsers.length === 0 && (
//             <EmptyState
//               title="No users found"
//               text="No one matches the current search and filters. Try removing a filter or searching by a different name."
//               action={
//                 <button className="btn btn-ghost" onClick={resetFilters}>
//                   Reset filters
//                 </button>
//               }
//             />
//           )}
//         </div>

//         {filteredUsers.length > 0 && (
//           <Pagination
//             page={safePage}
//             pageSize={pageSize}
//             total={filteredUsers.length}
//             onPage={setPage}
//             onPageSize={(n) => {
//               setPageSize(n);
//               setPage(1);
//             }}
//           />
//         )}
//       </div>

//       {blockTarget && (
//         <Modal
//           size="sm"
//           title={`Block ${blockTarget.name}?`}
//           description="They won't be able to log in, book services or receive requests until you unblock them."
//           onClose={() => setBlockTarget(null)}
//           footer={
//             <>
//               <button className="btn btn-ghost" onClick={() => setBlockTarget(null)}>
//                 Cancel
//               </button>
//               <button
//                 className="btn btn-danger"
//                 onClick={() => {
//                   setStatus(blockTarget, "Blocked");
//                   setBlockTarget(null);
//                 }}
//               >
//                 Block user
//               </button>
//             </>
//           }
//         />
//       )}

//       <ToastStack toasts={toasts} onDismiss={dismissToast} />
//     </div>
//   );
// }

// export default UserManagement;


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
} from "../components/ManagementUI";
import { blockUser, getUsers, unblockUser } from "../services/api";

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
      setUsers(await getUsers());
    } catch (err) {
      setError(err.message);
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

  const filtersActive = search || roleFilter !== "All" || statusFilter !== "All";

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
        status === "Blocked" ? await blockUser(user.id) : await unblockUser(user.id);

      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      showToast(
        status === "Blocked" ? `${user.name} was blocked.` : `${user.name} was unblocked.`,
        status === "Blocked" ? "danger" : "success"
      );
      return true;
    } catch (err) {
      showToast(err.message, "danger");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleStatusClick = (user) => {
    // Blocking is disruptive, so confirm first. Unblocking is safe, so do it right away.
    if (user.status === "Active") setBlockTarget(user);
    else setStatus(user, "Active");
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        const matchesRole = roleFilter === "All" || u.role === roleFilter;
        const matchesStatus = statusFilter === "All" || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort(compareBy(sort.key, sort.dir));
  }, [users, search, roleFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const onSort = (key) => {
    setSort((current) => nextSort(current, key));
    setPage(1);
  };

  return (
    <div className="management-page">
      <div className="management-header">
        <div>
          <h1>User management</h1>
          <p>Review customers and service providers, and block accounts that break the rules.</p>
        </div>
        <span className="management-count">{users.length} users</span>
      </div>

      <div className="management-stats">
        <div className="management-stat-card">
          <span>Total users</span>
          <h2>{users.length}</h2>
        </div>
        <div className="management-stat-card">
          <span>Customers</span>
          <h2>{users.filter((u) => u.role === "Customer").length}</h2>
        </div>
        <div className="management-stat-card">
          <span>Providers</span>
          <h2>{users.filter((u) => u.role === "Provider").length}</h2>
        </div>
        <div className="management-stat-card danger">
          <span>Blocked users</span>
          <h2>{users.filter((u) => u.status === "Blocked").length}</h2>
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
            <button className="btn btn-ghost" onClick={resetFilters}>
              Reset filters
            </button>
          )}
        </div>

        {loading && <div className="page-state">Loading users...</div>}

        {error && (
          <div className="page-state error">
            {error}
            <br />
            <button className="btn btn-ghost" onClick={retry}>
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
                    <SortHeader label="ID" field="id" sort={sort} onSort={onSort} />
                    <SortHeader label="User" field="name" sort={sort} onSort={onSort} />
                    <SortHeader label="Email" field="email" sort={sort} onSort={onSort} />
                    <SortHeader label="Role" field="role" sort={sort} onSort={onSort} />
                    <SortHeader label="Status" field="status" sort={sort} onSort={onSort} />
                    <th className="col-actions">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((user) => {
                    const active = user.status === "Active";
                    return (
                      <tr key={user.id} className={active ? "" : "row-blocked"}>
                        <td className="muted">#{user.id}</td>
                        <td>
                          <div className="person">
                            <Avatar name={user.name} />
                            <span className="management-name">{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status.toLowerCase()}`}>
                            <i aria-hidden="true" />
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`action-btn ${active ? "block-btn" : "unblock-btn"}`}
                            onClick={() => handleStatusClick(user)}
                            disabled={busy}
                            aria-label={`${active ? "Block" : "Unblock"} ${user.name}`}
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
                    <button className="btn btn-ghost" onClick={resetFilters}>
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
              <button className="btn btn-ghost" onClick={() => setBlockTarget(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={busy}
                onClick={async () => {
                  const ok = await setStatus(blockTarget, "Blocked");
                  if (ok) setBlockTarget(null);
                }}
              >
                {busy ? "Blocking..." : "Block user"}
              </button>
            </>
          }
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default UserManagement;