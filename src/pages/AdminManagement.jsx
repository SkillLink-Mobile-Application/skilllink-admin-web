// import { useMemo, useState } from "react";
// import "../styles/Management.css";
// import {
//   Avatar,
//   EmptyState,
//   Modal,
//   SearchInput,
//   SortHeader,
//   ToastStack,
//   compareBy,
//   nextSort,
//   useToast,
// } from "../components/Managementui";

// const initialAdmins = [
//   { id: 1, name: "System Admin", email: "admin@skilllink.com", role: "Super Admin" },
//   { id: 2, name: "Support Admin", email: "support@skilllink.com", role: "Admin" },
//   { id: 3, name: "Manager", email: "manager@skilllink.com", role: "Admin" },
// ];

// const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// /* ---------- Add / Edit form ---------- */
// function AdminFormModal({ admin, admins, onSave, onClose }) {
//   const isEdit = Boolean(admin);
//   const [form, setForm] = useState({ name: admin?.name ?? "", email: admin?.email ?? "" });
//   const [errors, setErrors] = useState({});

//   const update = (field) => (e) => {
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));
//     setErrors((prev) => ({ ...prev, [field]: undefined }));
//   };

//   const validate = () => {
//     const next = {};
//     const name = form.name.trim();
//     const email = form.email.trim().toLowerCase();

//     if (!name) next.name = "Enter the admin's full name.";
//     else if (name.length < 2) next.name = "Name must be at least 2 characters.";

//     if (!email) next.email = "Enter an email address.";
//     else if (!EMAIL_PATTERN.test(email)) next.email = "Enter a valid email, like name@skilllink.com.";
//     else if (admins.some((a) => a.id !== admin?.id && a.email.toLowerCase() === email))
//       next.email = "An admin with this email already exists.";

//     setErrors(next);
//     return Object.keys(next).length === 0;
//   };

//   const submit = (e) => {
//     e.preventDefault();
//     if (validate()) onSave({ name: form.name.trim(), email: form.email.trim() });
//   };

//   return (
//     <Modal
//       title={isEdit ? "Edit admin" : "Add new admin"}
//       description={
//         isEdit
//           ? "Update this administrator's details."
//           : "New admins can manage users, bookings and reports."
//       }
//       onClose={onClose}
//       footer={
//         <>
//           <button type="button" className="btn btn-ghost" onClick={onClose}>
//             Cancel
//           </button>
//           <button type="submit" form="admin-form" className="btn btn-primary">
//             {isEdit ? "Save changes" : "Add admin"}
//           </button>
//         </>
//       }
//     >
//       <form id="admin-form" onSubmit={submit} noValidate>
//         <div className={`field ${errors.name ? "has-error" : ""}`}>
//           <label htmlFor="admin-name">Full name</label>
//           <input
//             id="admin-name"
//             type="text"
//             value={form.name}
//             onChange={update("name")}
//             placeholder="e.g. Nadeesha Jayawardena"
//             aria-invalid={Boolean(errors.name)}
//             aria-describedby={errors.name ? "admin-name-error" : undefined}
//           />
//           {errors.name && (
//             <span className="field-error" id="admin-name-error">
//               {errors.name}
//             </span>
//           )}
//         </div>

//         <div className={`field ${errors.email ? "has-error" : ""}`}>
//           <label htmlFor="admin-email">Email address</label>
//           <input
//             id="admin-email"
//             type="email"
//             value={form.email}
//             onChange={update("email")}
//             placeholder="name@skilllink.com"
//             aria-invalid={Boolean(errors.email)}
//             aria-describedby={errors.email ? "admin-email-error" : undefined}
//           />
//           {errors.email && (
//             <span className="field-error" id="admin-email-error">
//               {errors.email}
//             </span>
//           )}
//         </div>

//         {!isEdit && (
//           <p className="form-hint">New accounts are created with the Admin role.</p>
//         )}
//       </form>
//     </Modal>
//   );
// }

// /* ---------- Page ---------- */
// function AdminManagement() {
//   const [admins, setAdmins] = useState(initialAdmins);
//   const [search, setSearch] = useState("");
//   const [sort, setSort] = useState({ key: "id", dir: "asc" });
//   const [modal, setModal] = useState(null); // { type: "add" | "edit" | "delete", admin? }
//   const { toasts, showToast, dismissToast } = useToast();

//   const closeModal = () => setModal(null);

//   const addAdmin = ({ name, email }) => {
//     setAdmins((prev) => [
//       ...prev,
//       { id: Math.max(0, ...prev.map((a) => a.id)) + 1, name, email, role: "Admin" },
//     ]);
//     closeModal();
//     showToast(`${name} was added as an admin.`);
//   };

//   const editAdmin = ({ name, email }) => {
//     setAdmins((prev) =>
//       prev.map((a) => (a.id === modal.admin.id ? { ...a, name, email } : a))
//     );
//     closeModal();
//     showToast(`${name}'s details were updated.`);
//   };

//   const deleteAdmin = () => {
//     const { admin } = modal;
//     setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
//     closeModal();
//     showToast(`${admin.name} was deleted.`, "danger");
//   };

//   const visibleAdmins = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     return admins
//       .filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
//       .sort(compareBy(sort.key, sort.dir));
//   }, [admins, search, sort]);

//   return (
//     <div className="management-page">
//       <div className="management-header">
//         <div>
//           <h1>Admin management</h1>
//           <p>Add, edit and remove SkillLink administrator accounts.</p>
//         </div>
//         <button className="btn btn-primary" onClick={() => setModal({ type: "add" })}>
//           + Add new admin
//         </button>
//       </div>

//       <div className="management-stats">
//         <div className="management-stat-card">
//           <span>Total admins</span>
//           <h2>{admins.length}</h2>
//         </div>
//         <div className="management-stat-card">
//           <span>Super admins</span>
//           <h2>{admins.filter((a) => a.role === "Super Admin").length}</h2>
//         </div>
//         <div className="management-stat-card">
//           <span>Regular admins</span>
//           <h2>{admins.filter((a) => a.role === "Admin").length}</h2>
//         </div>
//       </div>

//       <div className="management-content">
//         <div className="management-toolbar">
//           <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email" />
//         </div>

//         <div className="management-table-wrapper">
//           <table className="management-table">
//             <thead>
//               <tr>
//                 <SortHeader label="ID" field="id" sort={sort} onSort={(k) => setSort(nextSort(sort, k))} />
//                 <SortHeader label="Admin" field="name" sort={sort} onSort={(k) => setSort(nextSort(sort, k))} />
//                 <SortHeader label="Email" field="email" sort={sort} onSort={(k) => setSort(nextSort(sort, k))} />
//                 <SortHeader label="Role" field="role" sort={sort} onSort={(k) => setSort(nextSort(sort, k))} />
//                 <th className="col-actions">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {visibleAdmins.map((admin) => {
//                 const isSuper = admin.role === "Super Admin";
//                 return (
//                   <tr key={admin.id}>
//                     <td className="muted">#{admin.id}</td>
//                     <td>
//                       <div className="person">
//                         <Avatar name={admin.name} />
//                         <span className="management-name">{admin.name}</span>
//                       </div>
//                     </td>
//                     <td>{admin.email}</td>
//                     <td>
//                       <span className={`role-badge ${isSuper ? "super-admin" : "admin"}`}>
//                         {admin.role}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="table-actions">
//                         <button
//                           className="action-btn edit-btn"
//                           onClick={() => setModal({ type: "edit", admin })}
//                         >
//                           Edit
//                         </button>
//                         <button
//                           className="action-btn block-btn"
//                           disabled={isSuper}
//                           title={isSuper ? "The Super Admin can't be deleted" : undefined}
//                           onClick={() => setModal({ type: "delete", admin })}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {visibleAdmins.length === 0 && (
//             <EmptyState
//               title={search ? "No admins match your search" : "No admins yet"}
//               text={
//                 search
//                   ? `Nothing found for “${search}”. Check the spelling or try a different term.`
//                   : "Add your first administrator to get started."
//               }
//               action={
//                 search ? (
//                   <button className="btn btn-ghost" onClick={() => setSearch("")}>
//                     Clear search
//                   </button>
//                 ) : (
//                   <button className="btn btn-primary" onClick={() => setModal({ type: "add" })}>
//                     + Add new admin
//                   </button>
//                 )
//               }
//             />
//           )}
//         </div>
//       </div>

//       {modal?.type === "add" && (
//         <AdminFormModal admins={admins} onSave={addAdmin} onClose={closeModal} />
//       )}

//       {modal?.type === "edit" && (
//         <AdminFormModal admin={modal.admin} admins={admins} onSave={editAdmin} onClose={closeModal} />
//       )}

//       {modal?.type === "delete" && (
//         <Modal
//           size="sm"
//           title="Delete this admin?"
//           description={`${modal.admin.name} (${modal.admin.email}) will lose access immediately. This can't be undone.`}
//           onClose={closeModal}
//           footer={
//             <>
//               <button className="btn btn-ghost" onClick={closeModal}>
//                 Cancel
//               </button>
//               <button className="btn btn-danger" onClick={deleteAdmin}>
//                 Delete admin
//               </button>
//             </>
//           }
//         />
//       )}

//       <ToastStack toasts={toasts} onDismiss={dismissToast} />
//     </div>
//   );
// }

// export default AdminManagement;



import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/Management.css";
import {
  Avatar,
  EmptyState,
  Modal,
  SearchInput,
  SortHeader,
  ToastStack,
  compareBy,
  nextSort,
  useToast,
} from "../components/ManagementUI";
import {
  createAdmin,
  deleteAdmin,
  getAdminEmail,
  getAdmins,
  updateAdmin,
} from "../services/api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Add / Edit form ---------- */
function AdminFormModal({ admin, admins, currentEmail, onSave, onClose }) {
  const isEdit = Boolean(admin);
  const isSelf = isEdit && admin.email.toLowerCase() === currentEmail;

  const [form, setForm] = useState({
    name: admin?.name ?? "",
    email: admin?.email ?? "",
    role: admin?.roleCode ?? "ADMIN",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormError("");
  };

  const validate = () => {
    const next = {};
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) next.name = "Enter the admin's full name.";
    else if (name.length < 2) next.name = "Name must be at least 2 characters.";

    if (!email) next.email = "Enter an email address.";
    else if (!EMAIL_PATTERN.test(email)) next.email = "Enter a valid email, like name@skilllink.com.";
    else if (admins.some((a) => a.id !== admin?.id && a.email.toLowerCase() === email))
      next.email = "An admin with this email already exists.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormError("");
    try {
      await onSave({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      });
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit admin" : "Add new admin"}
      description={
        isEdit
          ? "Update this administrator's details or role."
          : "A temporary password will be generated and emailed to them."
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            form="admin-form"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting
              ? isEdit
                ? "Saving..."
                : "Sending email..."
              : isEdit
              ? "Save changes"
              : "Add admin & send email"}
          </button>
        </>
      }
    >
      <form id="admin-form" onSubmit={submit} noValidate>
        <div className={`field ${errors.name ? "has-error" : ""}`}>
          <label htmlFor="admin-name">Full name</label>
          <input
            id="admin-name"
            type="text"
            value={form.name}
            onChange={update("name")}
            placeholder="e.g. Nadeesha Jayawardena"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "admin-name-error" : undefined}
          />
          {errors.name && (
            <span className="field-error" id="admin-name-error">
              {errors.name}
            </span>
          )}
        </div>

        <div className={`field ${errors.email ? "has-error" : ""}`}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="name@skilllink.com"
            disabled={isSelf}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "admin-email-error" : undefined}
          />
          {errors.email && (
            <span className="field-error" id="admin-email-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="admin-role">Admin role</label>
          <select
            id="admin-role"
            value={form.role}
            onChange={update("role")}
            disabled={isSelf}
          >
            <option value="ADMIN">Admin: manages everything except admins</option>
            <option value="SUPER_ADMIN">Super Admin: full access, including admins</option>
          </select>
          {isSelf && (
            <span className="form-hint">You can't change your own role or email.</span>
          )}
        </div>

        {formError && (
          <p className="field-error" role="alert">
            {formError}
          </p>
        )}

        {!isEdit && (
          <p className="form-hint">
            They'll sign in with the emailed password and be asked to choose a new one.
          </p>
        )}
      </form>
    </Modal>
  );
}

/* ---------- Page ---------- */
function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "id", dir: "asc" });
  const [modal, setModal] = useState(null); // { type: "add" | "edit" | "delete", admin? }
  const [deleting, setDeleting] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();

  const currentEmail = getAdminEmail().toLowerCase();

  const load = useCallback(async () => {
    try {
      setAdmins(await getAdmins());
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

  const closeModal = () => setModal(null);

  // These throw on failure so the form can show the server message.
  const addAdmin = async ({ name, email, role }) => {
    const created = await createAdmin({ name, email, role });
    setAdmins((prev) => [...prev, created]);
    closeModal();
    showToast(`${created.name} was added. Login details were emailed to ${created.email}.`);
  };

  const editAdmin = async ({ name, email, role }) => {
    const updated = await updateAdmin(modal.admin.id, { name, email, role });
    setAdmins((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    closeModal();
    showToast(`${updated.name}'s details were updated.`);
  };

  const removeAdmin = async () => {
    const { admin } = modal;
    setDeleting(true);
    try {
      await deleteAdmin(admin.id);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      closeModal();
      showToast(`${admin.name} was deleted.`, "danger");
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      setDeleting(false);
    }
  };

  const visibleAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    return admins
      .filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
      .sort(compareBy(sort.key, sort.dir));
  }, [admins, search, sort]);

  const onSort = (k) => setSort((current) => nextSort(current, k));

  return (
    <div className="management-page">
      <div className="management-header">
        <div>
          <h1>Admin management</h1>
          <p>Add, edit and remove SkillLink administrator accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: "add" })}>
          + Add new admin
        </button>
      </div>

      <div className="management-stats">
        <div className="management-stat-card">
          <span>Total admins</span>
          <h2>{admins.length}</h2>
        </div>
        <div className="management-stat-card">
          <span>Super admins</span>
          <h2>{admins.filter((a) => a.roleCode === "SUPER_ADMIN").length}</h2>
        </div>
        <div className="management-stat-card">
          <span>Regular admins</span>
          <h2>{admins.filter((a) => a.roleCode === "ADMIN").length}</h2>
        </div>
      </div>

      <div className="management-content">
        <div className="management-toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email" />
        </div>

        {loading && <div className="page-state">Loading admins...</div>}

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
          <div className="management-table-wrapper">
            <table className="management-table">
              <thead>
                <tr>
                  <SortHeader label="ID" field="id" sort={sort} onSort={onSort} />
                  <SortHeader label="Admin" field="name" sort={sort} onSort={onSort} />
                  <SortHeader label="Email" field="email" sort={sort} onSort={onSort} />
                  <SortHeader label="Role" field="role" sort={sort} onSort={onSort} />
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleAdmins.map((admin) => {
                  const isSelf = admin.email.toLowerCase() === currentEmail;
                  const isSuper = admin.roleCode === "SUPER_ADMIN";
                  return (
                    <tr key={admin.id}>
                      <td className="muted">#{admin.id}</td>
                      <td>
                        <div className="person">
                          <Avatar name={admin.name} />
                          <span className="management-name">
                            {admin.name}
                            {isSelf && " (you)"}
                          </span>
                        </div>
                      </td>
                      <td>{admin.email}</td>
                      <td>
                        <span className={`role-badge ${isSuper ? "super-admin" : "admin"}`}>
                          {admin.role}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => setModal({ type: "edit", admin })}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn block-btn"
                            disabled={isSelf}
                            title={isSelf ? "You can't delete your own account" : undefined}
                            onClick={() => setModal({ type: "delete", admin })}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {visibleAdmins.length === 0 && (
              <EmptyState
                title={search ? "No admins match your search" : "No admins yet"}
                text={
                  search
                    ? `Nothing found for “${search}”. Check the spelling or try a different term.`
                    : "Add your first administrator to get started."
                }
                action={
                  search ? (
                    <button className="btn btn-ghost" onClick={() => setSearch("")}>
                      Clear search
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setModal({ type: "add" })}>
                      + Add new admin
                    </button>
                  )
                }
              />
            )}
          </div>
        )}
      </div>

      {modal?.type === "add" && (
        <AdminFormModal
          admins={admins}
          currentEmail={currentEmail}
          onSave={addAdmin}
          onClose={closeModal}
        />
      )}

      {modal?.type === "edit" && (
        <AdminFormModal
          admin={modal.admin}
          admins={admins}
          currentEmail={currentEmail}
          onSave={editAdmin}
          onClose={closeModal}
        />
      )}

      {modal?.type === "delete" && (
        <Modal
          size="sm"
          title="Delete this admin?"
          description={`${modal.admin.name} (${modal.admin.email}) will lose admin access immediately. This can't be undone.`}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={removeAdmin} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete admin"}
              </button>
            </>
          }
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default AdminManagement;