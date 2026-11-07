import { useCallback, useEffect, useState } from "react";
import "../styles/Management.css";
import "../styles/ProviderApplications.css";
import { Modal, ToastStack, useToast } from "../components/ManagementUI";
import {
  API_BASE_URL,
  approveApplication,
  getApplications,
  rejectApplication,
} from "../services/api";

function ProviderApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState(null); // { application, action: "approve" | "reject" }
  const [busy, setBusy] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await getApplications();
      setApplications(data);
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

  const runAction = async () => {
    const { application, action } = confirm;
    setBusy(true);
    try {
      const updated =
        action === "approve"
          ? await approveApplication(application.id)
          : await rejectApplication(application.id);

      setApplications((previous) =>
        previous.map((a) => (a.id === application.id ? updated : a))
      );
      showToast(
        action === "approve"
          ? `${application.name} was approved.`
          : `${application.name} was rejected.`,
        action === "approve" ? "success" : "danger"
      );
      setConfirm(null);
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      setBusy(false);
    }
  };

  const filteredApplications = applications.filter((application) => {
    const q = search.toLowerCase();
    const matchesSearch =
      application.name.toLowerCase().includes(q) ||
      application.email.toLowerCase().includes(q) ||
      (application.category || "").toLowerCase().includes(q);

    const matchesFilter = filter === "All" || application.status === filter;

    return matchesSearch && matchesFilter;
  });

  const pendingCount = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  return (
    <div className="applications-page management-page">

      {/* Page Header */}
      <header className="applications-header">
        <div>
          <h1>Provider Applications</h1>
          <p>Review and manage service provider applications.</p>
        </div>

        <span className="applications-admin-badge">Administrator</span>
      </header>

      {/* Summary Card */}
      <section className="application-summary">
        <div className="application-summary-icon">📋</div>

        <div>
          <p>Pending Applications</p>
          <h2>{loading ? "–" : pendingCount}</h2>
        </div>
      </section>

      {/* Applications Content */}
      <section className="applications-content">

        <div className="applications-toolbar">
          <div>
            <h2>Applications List</h2>
            <p>Review submitted provider applications below.</p>
          </div>

          <span className="application-total">
            {filteredApplications.length} applications
          </span>
        </div>

        {/* Search and Filter */}
        <div className="applications-filters">
          <input
            type="search"
            placeholder="Search name, email or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search applications"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter by application status"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading && <div className="page-state">Loading applications...</div>}

        {error && (
          <div className="page-state error">
            {error}
            <br />
            <button className="btn btn-ghost" onClick={retry}>
              Try again
            </button>
          </div>
        )}

        {/* Applications Table */}
        {!loading && !error && (
          <div className="applications-table-wrapper">
            <table className="applications-table">

              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Service Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id}>

                    <td>
                      <div className="provider-cell">
                        <div className="provider-avatar">
                          {application.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="provider-info">
                          <strong>{application.name}</strong>
                          <span>{application.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{application.category || "—"}</td>

                    <td>{application.location || "—"}</td>

                    <td>
                      <span
                        className={`application-status ${application.status.toLowerCase()}`}
                      >
                        {application.status}
                      </span>
                    </td>

                    <td>
                      <div className="application-actions">

                        <button
                          className="application-view-btn"
                          type="button"
                          onClick={() => setViewing(application)}
                        >
                          View
                        </button>

                        {application.status === "Pending" && (
                          <>
                            <button
                              className="application-approve-btn"
                              type="button"
                              onClick={() => setConfirm({ application, action: "approve" })}
                            >
                              Approve
                            </button>

                            <button
                              className="application-reject-btn"
                              type="button"
                              onClick={() => setConfirm({ application, action: "reject" })}
                            >
                              Reject
                            </button>
                          </>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}

                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan="5" className="applications-empty">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}
      </section>

      {/* View details */}
      {viewing && (
        <Modal
          title={viewing.name}
          description="Provider application details"
          onClose={() => setViewing(null)}
          footer={
            <button className="btn btn-ghost" onClick={() => setViewing(null)}>
              Close
            </button>
          }
        >
          <dl className="detail-list">
            <dt>Email</dt>
            <dd>{viewing.email}</dd>
            <dt>Phone</dt>
            <dd>{viewing.phone || "—"}</dd>
            <dt>Service category</dt>
            <dd>{viewing.category || "—"}</dd>
            <dt>NIC number</dt>
            <dd>{viewing.nicNumber || "—"}</dd>
            <dt>Location</dt>
            <dd>{viewing.location || "—"}</dd>
            <dt>Experience</dt>
            <dd>{viewing.experience != null ? `${viewing.experience} years` : "—"}</dd>
            <dt>Description</dt>
            <dd>{viewing.description || "—"}</dd>
            <dt>Certificate</dt>
            <dd>
              {viewing.certificateFile ? (
                <a
                  href={`${API_BASE_URL}${viewing.certificateFile}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open certificate
                </a>
              ) : (
                "Not uploaded"
              )}
            </dd>
            <dt>Status</dt>
            <dd>{viewing.status}</dd>
          </dl>
        </Modal>
      )}

      {/* Approve / reject confirmation */}
      {confirm && (
        <Modal
          size="sm"
          title={`${confirm.action === "approve" ? "Approve" : "Reject"} ${confirm.application.name}?`}
          description={
            confirm.action === "approve"
              ? "The provider will be marked as approved."
              : "The provider's application will be marked as rejected."
          }
          onClose={() => !busy && setConfirm(null)}
          footer={
            <>
              <button
                className="btn btn-ghost"
                onClick={() => setConfirm(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className={`btn ${confirm.action === "approve" ? "btn-primary" : "btn-danger"}`}
                onClick={runAction}
                disabled={busy}
              >
                {busy ? "Saving..." : confirm.action === "approve" ? "Approve" : "Reject"}
              </button>
            </>
          }
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default ProviderApplications;