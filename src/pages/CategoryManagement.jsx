
import { useEffect, useMemo, useState } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  uploadCategoryImage,
} from "../services/api";

import {
  Modal,
  ToastStack,
  useToast,
  SearchInput,
  EmptyState,
} from "../components/Managementui";

import "../styles/Management.css";
import "../styles/CategoryManagement.css";

const ICON_OPTIONS = [
  { value: "🔧", label: "Tools" },
  { value: "⚡", label: "Electrical" },
  { value: "🚰", label: "Plumbing" },
  { value: "🪚", label: "Carpentry" },
  { value: "🧱", label: "Masonry" },
  { value: "🚗", label: "Vehicle" },
  { value: "❄️", label: "Air conditioning" },
  { value: "💻", label: "Computer" },
  { value: "📱", label: "Mobile phone" },
  { value: "🎨", label: "Painting" },
  { value: "🏠", label: "Home" },
  { value: "🧹", label: "Cleaning" },
  { value: "🌳", label: "Garden" },
  { value: "🔒", label: "Security" },
  { value: "🛠️", label: "Repair" },
  { value: "🪟", label: "Windows" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  icon: "🔧",
  imageUrl: "",
  displayType: "icon",
};

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState("");

  const { toasts, showToast, dismissToast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(error.message || "Failed to load categories", "danger");
    } finally {
      setLoading(false);
    }
  }

  const activeCount = categories.filter((item) => item.active).length;
  const inactiveCount = categories.length - activeCount;

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name?.toLowerCase().includes(search.toLowerCase()) ||
        category.description?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.active) ||
        (statusFilter === "inactive" && !category.active);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  function openAddModal() {
    setEditingCategory(null);
    setForm({ ...EMPTY_FORM });
    setImagePreview("");
    setModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);

    const hasImage = Boolean(category.imageUrl);

    setForm({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "🔧",
      imageUrl: category.imageUrl || "",
      displayType: hasImage ? "image" : "icon",
    });

    setImagePreview(category.imageUrl || "");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving || uploading) return;

    setModalOpen(false);
    setEditingCategory(null);
    setForm({ ...EMPTY_FORM });
    setImagePreview("");
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function selectIcon(icon) {
    setForm((previous) => ({
      ...previous,
      displayType: "icon",
      icon,
      imageUrl: "",
    }));

    setImagePreview("");
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      showToast("Only JPG, JPEG and PNG images are allowed", "danger");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5 MB", "danger");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    try {
      setUploading(true);

      const result = await uploadCategoryImage(file);

      if (!result?.imageUrl) {
        throw new Error("Image URL was not returned by the server");
      }

      setForm((previous) => ({
        ...previous,
        displayType: "image",
        imageUrl: result.imageUrl,
        icon: "",
      }));

      setImagePreview(result.imageUrl);
      showToast("Image uploaded successfully");
    } catch (error) {
      setImagePreview(form.imageUrl || "");
      showToast(error.message || "Image upload failed", "danger");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      showToast("Category name is required", "danger");
      return;
    }

    if (uploading) {
      showToast("Please wait until the image upload finishes", "danger");
      return;
    }

    const payload = {
      name,
      description: form.description.trim(),
      icon: form.displayType === "icon" ? form.icon : null,
      imageUrl: form.displayType === "image" ? form.imageUrl : null,
    };

    if (form.displayType === "image" && !form.imageUrl) {
      showToast("Please upload an image first", "danger");
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        showToast("Category updated successfully");
      } else {
        await createCategory(payload);
        showToast("Category added successfully");
      }

      setModalOpen(false);
      setEditingCategory(null);
      setForm({ ...EMPTY_FORM });
      setImagePreview("");

      await loadCategories();
    } catch (error) {
      showToast(error.message || "Failed to save category", "danger");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(category) {
    const nextStatus = !category.active;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      await updateCategoryStatus(category.id, nextStatus);

      setCategories((previous) =>
        previous.map((item) =>
          item.id === category.id
            ? { ...item, active: nextStatus }
            : item
        )
      );

      showToast(
        `Category ${nextStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      showToast(error.message || "Failed to update category status", "danger");
    }
  }

  return (
    <div className="management-page category-page">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="management-header">
        <div>
          <h1>Category Management</h1>
          <p>
            Manage service categories, descriptions and category appearances.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openAddModal}
        >
          + Add Category
        </button>
      </div>

      {/* Statistics */}
      <div className="management-stats">
        <div className="management-stat-card">
          <span>Total Categories</span>
          <h2>{categories.length}</h2>
        </div>

        <div className="management-stat-card">
          <span>Active Categories</span>
          <h2>{activeCount}</h2>
        </div>

        <div className="management-stat-card danger">
          <span>Inactive Categories</span>
          <h2>{inactiveCount}</h2>
        </div>
      </div>

      {/* Category list */}
      <div className="management-content">
        <div className="management-toolbar">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search categories..."
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter categories by status"
          >
            <option value="all">All Categories</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="category-loading">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            title="No categories found"
            text={
              search || statusFilter !== "all"
                ? "Try changing your search or filter."
                : "Add your first service category to get started."
            }
            action={
              !search && statusFilter === "all" ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openAddModal}
                >
                  + Add Category
                </button>
              ) : null
            }
          />
        ) : (
          <div className="category-grid">
            {filteredCategories.map((category) => (
              <div className="category-card" key={category.id}>
                <div className="category-card-top">
                  <div className="category-visual">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                      />
                    ) : (
                      <span>{category.icon || "🔧"}</span>
                    )}
                  </div>

                  <span
                    className={`status-badge ${
                      category.active ? "active" : "blocked"
                    }`}
                  >
                    <i />
                    {category.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="category-card-info">
                  <h3>{category.name}</h3>

                  <p>
                    {category.description ||
                      "No description added yet."}
                  </p>
                </div>

                <div className="category-card-actions">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() => openEditModal(category)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className={`action-btn ${
                      category.active ? "block-btn" : "unblock-btn"
                    }`}
                    onClick={() => handleStatusChange(category)}
                  >
                    {category.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <Modal
          title={editingCategory ? "Edit Category" : "Add New Category"}
          description={
            editingCategory
              ? "Update the category details and appearance."
              : "Create a new service category for SkillLink."
          }
          onClose={closeModal}
          size="lg"
          footer={
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeModal}
                disabled={saving || uploading}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="category-form"
                className="btn btn-primary"
                disabled={saving || uploading}
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                    ? "Save Changes"
                    : "Add Category"}
              </button>
            </>
          }
        >
          <form id="category-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="category-name">Category Name *</label>
              <input
                id="category-name"
                name="name"
                type="text"
                placeholder="e.g. Electrician"
                value={form.name}
                onChange={handleFieldChange}
                maxLength={100}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="category-description">
                Description
              </label>
              <textarea
                id="category-description"
                name="description"
                placeholder="Write a short description about this service..."
                value={form.description}
                onChange={handleFieldChange}
                maxLength={500}
                rows={3}
              />
              <small className="category-hint">
                {form.description.length}/500 characters
              </small>
            </div>

            <div className="category-display-section">
              <label className="category-section-label">
                Category Appearance
              </label>

              <div className="category-display-options">
                <button
                  type="button"
                  className={`category-display-option ${
                    form.displayType === "icon" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setForm((previous) => ({
                      ...previous,
                      displayType: "icon",
                      imageUrl: "",
                      icon: previous.icon || "🔧",
                    }));
                    setImagePreview("");
                  }}
                >
                  <span>🔧</span>
                  <strong>Use Icon</strong>
                  <small>Choose a predefined icon</small>
                </button>

                <button
                  type="button"
                  className={`category-display-option ${
                    form.displayType === "image" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      displayType: "image",
                      icon: "",
                    }))
                  }
                >
                  <span>🖼️</span>
                  <strong>Upload Image</strong>
                  <small>JPG or PNG, max 5 MB</small>
                </button>
              </div>

              {form.displayType === "icon" ? (
                <div className="category-icon-picker">
                  <label className="category-section-label">
                    Select an Icon
                  </label>

                  <div className="category-icon-grid">
                    {ICON_OPTIONS.map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        title={item.label}
                        aria-label={item.label}
                        className={`category-icon-choice ${
                          form.icon === item.value ? "selected" : ""
                        }`}
                        onClick={() => selectIcon(item.value)}
                      >
                        {item.value}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="category-upload-section">
                  <label
                    htmlFor="category-image"
                    className="category-upload-label"
                  >
                    {uploading ? "Uploading image..." : "Choose Image"}
                  </label>

                  <input
                    id="category-image"
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />

                  <small className="category-hint">
                    Supported formats: JPG, JPEG and PNG. Maximum size: 5 MB.
                  </small>

                  {imagePreview && (
                    <div className="category-image-preview">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                      />
                      <span>Image preview</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default CategoryManagement;
