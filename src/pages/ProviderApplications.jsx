
import { useState } from "react";
import "../styles/ProviderApplications.css";

const sampleApplications = [
  {
    id: 1,
    name: "Kasun Perera",
    email: "kasun@example.com",
    category: "Electrician",
    date: "2026-10-20",
    status: "Pending",
  },
  {
    id: 2,
    name: "Nimal Fernando",
    email: "nimal@example.com",
    category: "Plumber",
    date: "2026-10-21",
    status: "Pending",
  },
  {
    id: 3,
    name: "Amali Silva",
    email: "amali@example.com",
    category: "AC Technician",
    date: "2026-10-22",
    status: "Pending",
  },
  {
    id: 4,
    name: "Saman Kumara",
    email: "saman@example.com",
    category: "Carpenter",
    date: "2026-10-19",
    status: "Approved",
  },
];

function ProviderApplications() {
  const [applications, setApplications] = useState(sampleApplications);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredApplications = applications.filter((application) => {
    const matchesSearch =
      application.name.toLowerCase().includes(search.toLowerCase()) ||
      application.email.toLowerCase().includes(search.toLowerCase()) ||
      application.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || application.status === filter;

    return matchesSearch && matchesFilter;
  });

  const updateStatus = (id, newStatus) => {
    setApplications((previous) =>
      previous.map((application) =>
        application.id === id
          ? { ...application, status: newStatus }
          : application
      )
    );
  };

  const pendingCount = applications.filter(
    (application) => application.status === "Pending"
  ).length;

  return (
    <div className="applications-page">

      {/* Page Header */}
      <header className="applications-header">
        <div>
          <h1>Provider Applications</h1>
          <p>Review and manage service provider applications.</p>
        </div>

        <span className="applications-admin-badge">
          Administrator
        </span>
      </header>

      {/* Summary Card */}
      <section className="application-summary">
        <div className="application-summary-icon">📋</div>

        <div>
          <p>Pending Applications</p>
          <h2>{pendingCount}</h2>
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

        {/* Applications Table */}
        <div className="applications-table-wrapper">
          <table className="applications-table">

            <thead>
              <tr>
                <th>Provider</th>
                <th>Service Category</th>
                <th>Applied Date</th>
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
                        {application.name.charAt(0)}
                      </div>

                      <div className="provider-info">
                        <strong>{application.name}</strong>
                        <span>{application.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>{application.category}</td>

                  <td>{application.date}</td>

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
                        onClick={() =>
                          window.alert(
                            `Provider: ${application.name}\nEmail: ${application.email}\nCategory: ${application.category}\nStatus: ${application.status}`
                          )
                        }
                      >
                        View
                      </button>

                      {application.status === "Pending" && (
                        <>
                          <button
                            className="application-approve-btn"
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Approve ${application.name}'s application?`
                                )
                              ) {
                                updateStatus(application.id, "Approved");
                              }
                            }}
                          >
                            Approve
                          </button>

                          <button
                            className="application-reject-btn"
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Reject ${application.name}'s application?`
                                )
                              ) {
                                updateStatus(application.id, "Rejected");
                              }
                            }}
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
      </section>
    </div>
  );
}

export default ProviderApplications;
