import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- Avatar (initials) ---------- */
export function Avatar({ name }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  return (
    <span className="avatar" aria-hidden="true">
      {initials}
    </span>
  );
}

/* ---------- Modal ---------- */
export function Modal({ title, description, onClose, children, footer, size = "md" }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Always call the latest onClose without re-running the effect below.
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first field once, otherwise the dialog itself
    const firstField = dialogRef.current?.querySelector("input, select, textarea");
    (firstField || dialogRef.current)?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Toasts ---------- */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

export function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------- Sortable table header ---------- */
export function SortHeader({ label, field, sort, onSort }) {
  const active = sort.key === field;
  const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";
  return (
    <th aria-sort={ariaSort}>
      <button className={`sort-btn ${active ? "active" : ""}`} onClick={() => onSort(field)}>
        {label}
        <span className="sort-icon" aria-hidden="true">
          {active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function nextSort(sort, key) {
  return sort.key === key
    ? { key, dir: sort.dir === "asc" ? "desc" : "asc" }
    : { key, dir: "asc" };
}

export function compareBy(key, dir) {
  return (a, b) => {
    const result = String(a[key]).localeCompare(String(b[key]), undefined, {
      numeric: true,
      sensitivity: "base",
    });
    return dir === "asc" ? result : -result;
  };
}

/* ---------- Search box with clear button ---------- */
export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="search-box">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange("")} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({ page, pageSize, total, onPage, onPageSize }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {from}–{to} of {total}
      </span>
      <div className="pagination-controls">
        <label>
          Rows
          <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
            {[5, 10, 25].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
          ‹
        </button>
        <span className="pagination-page">
          {page} / {totalPages}
        </span>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          ›
        </button>
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">∅</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}