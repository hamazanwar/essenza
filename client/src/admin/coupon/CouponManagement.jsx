
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../bars/AdminNavbar";

const API_URL = "http://localhost:5000/api/admin/coupons";

const initialForm = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscount: "",
  startDate: "",
  expiryDate: "",
  usageLimit: "",
  isActive: true,
};

function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("adminToken");

  const getErrorMessage = (err) =>
    err.response?.data?.message ||
    err.response?.data?.error ||
    "Something went wrong. Please try again.";

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        params: {
          page,
          limit: 10,
          search: search.trim(),
        },
      });

      setCoupons(response.data.coupons || []);
      setPagination(
        response.data.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      form.discountType === "PERCENTAGE" &&
      Number(form.discountValue) > 100
    ) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (
      !form.startDate ||
      !form.expiryDate ||
      new Date(form.expiryDate) <= new Date(form.startDate)
    ) {
      setError("Expiry date must be after the start date.");
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount || 0),
      maxDiscount:
        form.discountType === "PERCENTAGE" && form.maxDiscount !== ""
          ? Number(form.maxDiscount)
          : null,
      startDate: new Date(form.startDate).toISOString(),
      expiryDate: new Date(form.expiryDate).toISOString(),
      usageLimit:
        form.usageLimit !== "" ? Number(form.usageLimit) : null,
      isActive: form.isActive,
    };

    try {
      setSaving(true);

      const token = getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingId) {
        await axios.patch(`${API_URL}/${editingId}`, payload, config);
        setMessage("Coupon updated successfully.");
      } else {
        await axios.post(API_URL, payload, config);
        setMessage("Coupon created successfully.");
      }

      resetForm();
      setPage(1);
      await fetchCoupons();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon) => {
    const toDateTimeLocal = (date) => {
      const parsed = new Date(date);
      const offset = parsed.getTimezoneOffset() * 60000;

      return new Date(parsed.getTime() - offset)
        .toISOString()
        .slice(0, 16);
    };

    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: String(coupon.discountValue ?? ""),
      minOrderAmount: String(coupon.minOrderAmount ?? 0),
      maxDiscount:
        coupon.maxDiscount == null ? "" : String(coupon.maxDiscount),
      startDate: toDateTimeLocal(coupon.startDate),
      expiryDate: toDateTimeLocal(coupon.expiryDate),
      usageLimit:
        coupon.usageLimit == null ? "" : String(coupon.usageLimit),
      isActive: coupon.isActive,
    });

    setEditingId(coupon._id);
    setError("");
    setMessage("");

    document
      .getElementById("coupon-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  
const handleToggleStatus = async (coupon) => {
  setConfirmAction({
    type: "status",
    coupon,
  });
};


  
const handleDelete = async (coupon) => {
  setConfirmAction({
    type: "delete",
    coupon,
  });
};



const handleConfirmAction = async () => {
  if (!confirmAction) return;

  const { type, coupon } = confirmAction;

  setConfirmAction(null);
  setError("");
  setMessage("");

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    };

    if (type === "delete") {
      await axios.delete(`${API_URL}/${coupon._id}`, config);

      setMessage("Coupon deleted successfully.");

      if (coupons.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await fetchCoupons();
      }

      if (editingId === coupon._id) {
        resetForm();
      }
    } else if (type === "status") {
      const action = coupon.isActive ? "deactivate" : "activate";

      await axios.patch(
        `${API_URL}/${coupon._id}/status`,
        {},
        config
      );

      setMessage(`Coupon ${action}d successfully.`);
      await fetchCoupons();
    }
  } catch (err) {
    setError(getErrorMessage(err));
  }
};


  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const formatDiscount = (coupon) =>
    coupon.discountType === "PERCENTAGE"
      ? `${coupon.discountValue}%`
      : `₹${Number(coupon.discountValue).toLocaleString("en-IN")}`;

  const getCouponStatus = (coupon) => {
    const now = new Date();

    if (!coupon.isActive) return "Inactive";
    if (now < new Date(coupon.startDate)) return "Scheduled";
    if (now > new Date(coupon.expiryDate)) return "Expired";

    if (
      coupon.usageLimit != null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return "Limit reached";
    }

    return "Active";
  };

  return (
    <div className="admin-layout">
      <AdminNavbar />

      <main className="admin-main-content coupon-management-page">
        <div className="coupon-page-header">
          <div>
            <p className="coupon-eyebrow">ESSENZA / ADMIN</p>
            <h1>Coupon Management</h1>
            <p>Create and manage discount coupons for your store.</p>
          </div>

          <span className="coupon-total-count">
            {pagination.total} COUPONS
          </span>
        </div>

        {message && (
          <div className="coupon-feedback coupon-feedback-success">
            {message}
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="coupon-feedback coupon-feedback-error">
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error message"
            >
              ×
            </button>
          </div>
        )}

        <section className="coupon-form-card" id="coupon-form">
          <div className="coupon-section-heading">
            <div>
              <h2>{editingId ? "Edit Coupon" : "Create New Coupon"}</h2>
              <p>
                {editingId
                  ? "Update the selected coupon details."
                  : "Configure the discount and validity period."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="coupon-secondary-button"
                onClick={resetForm}
              >
                CANCEL EDIT
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="coupon-form-grid">
              <div className="coupon-field">
                <label htmlFor="coupon-code">Coupon Code *</label>
                <input
                  id="coupon-code"
                  name="code"
                  value={form.code}
                  onChange={handleInputChange}
                  placeholder="e.g. ESSENZA10"
                  required
                  maxLength={40}
                />
              </div>

              <div className="coupon-field">
                <label htmlFor="coupon-description">Description</label>
                <input
                  id="coupon-description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Festive discount"
                />
              </div>

              <div className="coupon-field">
                <label htmlFor="coupon-discount-type">
                  Discount Type *
                </label>
                <select
                  id="coupon-discount-type"
                  name="discountType"
                  value={form.discountType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="coupon-field">
                <label htmlFor="coupon-discount-value">
                  Discount Value *
                </label>
                <input
                  id="coupon-discount-value"
                  name="discountValue"
                  type="number"
                  min="0.01"
                  max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                  step="0.01"
                  value={form.discountValue}
                  onChange={handleInputChange}
                  placeholder={
                    form.discountType === "PERCENTAGE" ? "10" : "100"
                  }
                  required
                />
              </div>

              <div className="coupon-field">
                <label htmlFor="coupon-minimum">
                  Minimum Order Amount (₹)
                </label>
                <input
                  id="coupon-minimum"
                  name="minOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={handleInputChange}
                />
              </div>

              {form.discountType === "PERCENTAGE" && (
                <div className="coupon-field">
                  <label htmlFor="coupon-max-discount">
                    Maximum Discount (₹)
                  </label>
                  <input
                    id="coupon-max-discount"
                    name="maxDiscount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.maxDiscount}
                    onChange={handleInputChange}
                    placeholder="Leave blank for no cap"
                  />
                </div>
              )}

              <div className="coupon-field">
                <label htmlFor="coupon-start-date">Start Date & Time *</label>
                <input
                  id="coupon-start-date"
                  name="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="coupon-field">
                <label htmlFor="coupon-expiry-date">
                  Expiry Date & Time *
                </label>
                <input
                  id="coupon-expiry-date"
                  name="expiryDate"
                  type="datetime-local"
                  value={form.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="coupon-field">
                <label htmlFor="coupon-usage-limit">
                  Usage Limit
                </label>
                <input
                  id="coupon-usage-limit"
                  name="usageLimit"
                  type="number"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={handleInputChange}
                  placeholder="Leave blank for unlimited"
                />
              </div>

              <label className="coupon-active-checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleInputChange}
                />
                <span>Coupon is active</span>
              </label>
            </div>

            <div className="coupon-form-actions">
              <button
                type="submit"
                className="coupon-primary-button"
                disabled={saving}
              >
                {saving
                  ? "SAVING..."
                  : editingId
                    ? "SAVE CHANGES"
                    : "CREATE COUPON"}
              </button>

              {!editingId && (
                <button
                  type="button"
                  className="coupon-secondary-button"
                  onClick={resetForm}
                >
                  CLEAR FORM
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="coupon-table-card">
          <div className="coupon-section-heading coupon-list-heading">
            <div>
              <h2>All Coupons</h2>
              <p>Search, edit, activate, or remove coupons.</p>
            </div>

            <input
              className="coupon-search-input"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search coupon code..."
              aria-label="Search coupons"
            />
          </div>

          {loading ? (
            <div className="coupon-empty-state">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="coupon-empty-state">
              <h3>No coupons found</h3>
              <p>Create a coupon or try another search.</p>
            </div>
          ) : (
            <>
              <div className="coupon-table-wrapper">
                <table className="coupon-table">
                  <thead>
                    <tr>
                      <th>COUPON</th>
                      <th>DISCOUNT</th>
                      <th>MIN. ORDER</th>
                      <th>VALIDITY</th>
                      <th>USAGE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {coupons.map((coupon) => {
                      const status = getCouponStatus(coupon);

                      return (
                        <tr key={coupon._id}>
                          <td>
                            <strong className="coupon-code-text">
                              {coupon.code}
                            </strong>
                            <span className="coupon-description-text">
                              {coupon.description || "No description"}
                            </span>
                          </td>

                          <td>
                            <strong>{formatDiscount(coupon)}</strong>
                            {coupon.discountType === "PERCENTAGE" &&
                              coupon.maxDiscount != null && (
                                <span className="coupon-description-text">
                                  Up to ₹{coupon.maxDiscount}
                                </span>
                              )}
                          </td>

                          <td>
                            ₹
                            {Number(
                              coupon.minOrderAmount || 0
                            ).toLocaleString("en-IN")}
                          </td>

                          <td>
                            <span>{formatDate(coupon.startDate)}</span>
                            <span className="coupon-description-text">
                              to {formatDate(coupon.expiryDate)}
                            </span>
                          </td>

                          <td>
                            {coupon.usedCount || 0} /{" "}
                            {coupon.usageLimit ?? "∞"}
                          </td>

                          <td>
                            <span
                              className={`coupon-status coupon-status-${status
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td>
                            <div className="coupon-row-actions">
                              <button
                                type="button"
                                onClick={() => handleEdit(coupon)}
                              >
                                EDIT
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(coupon)}
                              >
                                {coupon.isActive ? "DEACTIVATE" : "ACTIVATE"}
                              </button>

                              <button
                                type="button"
                                className="coupon-delete-action"
                                onClick={() => handleDelete(coupon)}
                              >
                                DELETE
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="coupon-pagination">
                <span>
                  {pagination.total} coupon
                  {pagination.total === 1 ? "" : "s"} found
                </span>

                <div>
                  <button
                    type="button"
                    onClick={() => setPage((previous) => previous - 1)}
                    disabled={page <= 1}
                  >
                    PREVIOUS
                  </button>

                  <span>
                    Page {page} of {Math.max(1, pagination.totalPages)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPage((previous) => previous + 1)}
                    disabled={
                      page >= Math.max(1, pagination.totalPages)
                    }
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      
      </main>

      {confirmAction && (
        <div
          className="coupon-confirm-overlay"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="coupon-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="coupon-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="coupon-confirm-icon">
              {confirmAction.type === "delete" ? "!" : "?"}
            </div>

            <h2 id="coupon-confirm-title">
              {confirmAction.type === "delete"
                ? "Delete Coupon?"
                : confirmAction.coupon.isActive
                  ? "Deactivate Coupon?"
                  : "Activate Coupon?"}
            </h2>

            <p>
              {confirmAction.type === "delete"
                ? `Are you sure you want to delete "${confirmAction.coupon.code}"? This action cannot be undone.`
                : `Are you sure you want to ${
                    confirmAction.coupon.isActive
                      ? "deactivate"
                      : "activate"
                  } "${confirmAction.coupon.code}"?`}
            </p>

            <div className="coupon-confirm-actions">
              <button
                type="button"
                className="coupon-confirm-cancel"
                onClick={() => setConfirmAction(null)}
              >
                CANCEL
              </button>

              <button
                type="button"
                className="coupon-confirm-submit"
                onClick={handleConfirmAction}
              >
                {confirmAction.type === "delete"
                  ? "DELETE COUPON"
                  : confirmAction.coupon.isActive
                    ? "DEACTIVATE"
                    : "ACTIVATE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default CouponManagement;
