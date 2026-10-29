import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";



const initialForm = {
  name: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  applicableProducts: [],
  applicableCategories: [],
  startDate: "",
  endDate: "",
  isActive: true,
};

function OfferManagement() {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("adminToken");

  const getErrorMessage = (err) =>
    err.response?.data?.message || "Something went wrong. Please try again.";

  const config = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/offers", {
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

      setOffers(response.data.offers || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductsAndCategories = useCallback(async () => {
    try {
      const tokenConfig = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };

      const [productResponse, categoryResponse] = await Promise.all([
  api.get("/admin/products", tokenConfig),
  api.get("/admin/categories", tokenConfig),
]);

      const productData = productResponse.data.products || productResponse.data;

      const categoryData =
        categoryResponse.data.categories || categoryResponse.data;

      setProducts(Array.isArray(productData) ? productData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (err) {
      console.error("Product/category loading error:", err);
      setError(
        "Unable to load products or categories. Check your existing admin API routes.",
      );
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    fetchProductsAndCategories();
  }, [fetchOffers, fetchProductsAndCategories]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelection = (event) => {
    const { name, options } = event.target;
    const selectedValues = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    setForm((previous) => ({
      ...previous,
      [name]: selectedValues,
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
      !form.endDate ||
      new Date(form.endDate) <= new Date(form.startDate)
    ) {
      setError("End date must be after the start date.");
      return;
    }

    if (
      form.applicableProducts.length === 0 &&
      form.applicableCategories.length === 0
    ) {
      setError("Select at least one product or category.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      applicableProducts: form.applicableProducts,
      applicableCategories: form.applicableCategories,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      isActive: form.isActive,
    };

    try {
      setSaving(true);

      const tokenConfig = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };

   if (editingId) {
  await api.patch(`/admin/offers/${editingId}`, payload, tokenConfig);
  setMessage("Offer updated successfully.");
} else {
  await api.post("/admin/offers", payload, tokenConfig);
  setMessage("Offer created successfully.");
}

      resetForm();
      await fetchOffers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (offer) => {
    const toDateTimeLocal = (date) => {
      const parsed = new Date(date);
      const offset = parsed.getTimezoneOffset() * 60000;
      return new Date(parsed.getTime() - offset).toISOString().slice(0, 16);
    };

    setForm({
      name: offer.name || "",
      description: offer.description || "",
      discountType: offer.discountType || "PERCENTAGE",
      discountValue: String(offer.discountValue ?? ""),
      applicableProducts: (offer.applicableProducts || []).map((item) =>
        typeof item === "string" ? item : item._id,
      ),
      applicableCategories: (offer.applicableCategories || []).map((item) =>
        typeof item === "string" ? item : item._id,
      ),
      startDate: toDateTimeLocal(offer.startDate),
      endDate: toDateTimeLocal(offer.endDate),
      isActive: offer.isActive,
    });

    setEditingId(offer._id);
    setError("");
    setMessage("");

    document
      .getElementById("offer-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    const { type, offer } = confirmAction;
    setConfirmAction(null);
    setError("");
    setMessage("");

    try {
      const tokenConfig = {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      };

      if (type === "delete") {
  await api.delete(`/admin/offers/${offer._id}`, tokenConfig);
  setMessage("Offer deleted successfully.");

  if (editingId === offer._id) resetForm();
} else {
  await api.patch(
    `/admin/offers/${offer._id}`,
    { isActive: !offer.isActive },
    tokenConfig,
  );

  setMessage(
    `Offer ${offer.isActive ? "deactivated" : "activated"} successfully.`,
  );
}

await fetchOffers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const formatDiscount = (offer) =>
    offer.discountType === "PERCENTAGE"
      ? `${offer.discountValue}%`
      : `₹${Number(offer.discountValue).toLocaleString("en-IN")}`;

  const getOfferStatus = (offer) => {
    const now = new Date();

    if (!offer.isActive) return "Inactive";
    if (now < new Date(offer.startDate)) return "Scheduled";
    if (now > new Date(offer.endDate)) return "Expired";

    return "Active";
  };

  return (
    <>
    <AdminNavbar />
    <div className="admin-layout">
      

      <main className="admin-main-content coupon-management-page">
        <div className="coupon-page-header">
          <div>
            <p className="coupon-eyebrow">ESSENZA / ADMIN</p>
            <h1>Offer Management</h1>
            <p>Create product and category discounts for your store.</p>
          </div>
          <span className="coupon-total-count">{offers.length} OFFERS</span>
        </div>

        {message && (
          <div className="coupon-feedback coupon-feedback-success">
            {message}
            <button type="button" onClick={() => setMessage("")}>
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="coupon-feedback coupon-feedback-error">
            {error}
            <button type="button" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        <section className="coupon-form-card" id="offer-form">
          <div className="coupon-section-heading">
            <div>
              <h2>{editingId ? "Edit Offer" : "Create New Offer"}</h2>
              <p>Select the products or categories where the offer applies.</p>
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
                <label htmlFor="offer-name">Offer Name *</label>
                <input
                  id="offer-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Summer Fragrance Sale"
                />
              </div>

              <div className="coupon-field">
                <label htmlFor="offer-description">Description</label>
                <input
                  id="offer-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Special summer discount"
                />
              </div>

              <div className="coupon-field">
                <label htmlFor="offer-discount-type">Discount Type *</label>
                <select
                  id="offer-discount-type"
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  required
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="coupon-field">
                <label htmlFor="offer-discount-value">Discount Value *</label>
                <input
                  id="offer-discount-value"
                  name="discountValue"
                  type="number"
                  min="0.01"
                  max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                  step="0.01"
                  value={form.discountValue}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="coupon-field">
                <label htmlFor="offer-products">Specific Products</label>
                <select
                  id="offer-products"
                  name="applicableProducts"
                  multiple
                  value={form.applicableProducts}
                  onChange={handleSelection}
                >
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <small>Use Ctrl (Windows) to select multiple products.</small>
              </div>

              <div className="coupon-field">
                <label htmlFor="offer-categories">Categories</label>
                <select
                  id="offer-categories"
                  name="applicableCategories"
                  multiple
                  value={form.applicableCategories}
                  onChange={handleSelection}
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <small>Select products, categories, or both.</small>
              </div>

              <div className="coupon-field">
                <label htmlFor="offer-start-date">Start Date & Time *</label>
                <input
                  id="offer-start-date"
                  name="startDate"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="coupon-field">
                <label htmlFor="offer-end-date">End Date & Time *</label>
                <input
                  id="offer-end-date"
                  name="endDate"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <label className="coupon-active-checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <span>Offer is active</span>
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
                    : "CREATE OFFER"}
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
          <div className="coupon-section-heading">
            <div>
              <h2>All Offers</h2>
              <p>Review, edit, activate, or remove offers.</p>
            </div>
          </div>

          {loading ? (
            <div className="coupon-empty-state">Loading offers...</div>
          ) : offers.length === 0 ? (
            <div className="coupon-empty-state">
              <h3>No offers found</h3>
              <p>Create an offer using the form above.</p>
            </div>
          ) : (
            <div className="coupon-table-wrapper">
              <table className="coupon-table">
                <thead>
                  <tr>
                    <th>OFFER</th>
                    <th>DISCOUNT</th>
                    <th>APPLIES TO</th>
                    <th>VALIDITY</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {offers.map((offer) => {
                    const status = getOfferStatus(offer);
                    const productNames = (offer.applicableProducts || [])
                      .map((item) =>
                        typeof item === "string" ? item : item.name,
                      )
                      .filter(Boolean);
                    const categoryNames = (offer.applicableCategories || [])
                      .map((item) =>
                        typeof item === "string" ? item : item.name,
                      )
                      .filter(Boolean);

                    return (
                      <tr key={offer._id}>
                        <td>
                          <strong>{offer.name}</strong>
                          <span className="coupon-description-text">
                            {offer.description || "No description"}
                          </span>
                        </td>
                        <td>
                          <strong>{formatDiscount(offer)}</strong>
                        </td>
                        <td>
                          {[...productNames, ...categoryNames].join(", ") ||
                            "Selected items"}
                        </td>
                        <td>
                          <span>
                            {new Date(offer.startDate).toLocaleDateString(
                              "en-IN",
                            )}
                          </span>
                          <span className="coupon-description-text">
                            to{" "}
                            {new Date(offer.endDate).toLocaleDateString(
                              "en-IN",
                            )}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`coupon-status coupon-status-${status.toLowerCase()}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td>
                          <div className="coupon-row-actions">
                            <button
                              type="button"
                              onClick={() => handleEdit(offer)}
                            >
                              EDIT
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: "status", offer })
                              }
                            >
                              {offer.isActive ? "DEACTIVATE" : "ACTIVATE"}
                            </button>
                            <button
                              type="button"
                              className="coupon-delete-action"
                              onClick={() =>
                                setConfirmAction({ type: "delete", offer })
                              }
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
            aria-labelledby="offer-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="coupon-confirm-icon">
              {confirmAction.type === "delete" ? "!" : "?"}
            </div>
            <h2 id="offer-confirm-title">
              {confirmAction.type === "delete"
                ? "Delete Offer?"
                : confirmAction.offer.isActive
                  ? "Deactivate Offer?"
                  : "Activate Offer?"}
            </h2>
            <p>
              {confirmAction.type === "delete"
                ? `Are you sure you want to delete "${confirmAction.offer.name}"?`
                : `Are you sure you want to ${confirmAction.offer.isActive ? "deactivate" : "activate"} "${confirmAction.offer.name}"?`}
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
                  ? "DELETE OFFER"
                  : confirmAction.offer.isActive
                    ? "DEACTIVATE"
                    : "ACTIVATE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <AdminFooter/>
    </>
  );
}

export default OfferManagement;
