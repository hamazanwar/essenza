import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);
const [editCategoryName, setEditCategoryName] = useState("");

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        "http://localhost:5000/api/admin/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCategories(response.data.categories);
    } catch (error) {
      console.error("Category fetch error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (event) => {
    event.preventDefault();

    if (!categoryName.trim()) {
      setError("Category name is required.");
      setSuccess("");
      return;
    }

    try {
      setAdding(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.post(
        "http://localhost:5000/api/admin/categories",
        {
          name: categoryName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCategories((previousCategories) => [
        response.data.category,
        ...previousCategories,
      ]);

      setCategoryName("");

      setSuccess("Category added successfully.");
    } catch (error) {
      console.error("Add category error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleEditCategory = async (categoryId) => {
    if (!editCategoryName.trim()) {
        setError("Category name is required.");
        setSuccess("");
        return;
    }

    try {
        setError("");
        setSuccess("");

        const token = localStorage.getItem("adminToken");

        const response = await axios.patch(
            `http://localhost:5000/api/admin/categories/${categoryId}`,
            {
                name: editCategoryName,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setCategories((previousCategories) =>
            previousCategories.map((category) =>
                category._id === categoryId
                    ? response.data.category
                    : category
            )
        );

        setEditCategoryId(null);
        setEditCategoryName("");

        setSuccess("Category updated successfully.");

    } catch (error) {
        console.error(
            "Edit category error:",
            error
        );

        setError(
            error.response?.data?.message ||
                "Something went wrong. Please try again."
        );
    }
};

const handleToggleCategoryStatus = async (categoryId) => {
    try {
        setError("");
        setSuccess("");

        const token = localStorage.getItem("adminToken");

        const response = await axios.patch(
            `http://localhost:5000/api/admin/categories/${categoryId}/status`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setCategories((previousCategories) =>
            previousCategories.map((category) =>
                category._id === categoryId
                    ? response.data.category
                    : category
            )
        );

        setSuccess(response.data.message);

    } catch (error) {
        console.error(
            "Toggle category status error:",
            error
        );

        setError(
            error.response?.data?.message ||
                "Something went wrong. Please try again."
        );
    }
};

  const handleDeleteCategory = async (categoryId) => {
    try {
        setError("");
        setSuccess("");

        const token = localStorage.getItem("adminToken");

        const response = await axios.delete(
            `http://localhost:5000/api/admin/categories/${categoryId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setCategories((previousCategories) =>
            previousCategories.filter(
                (category) =>
                    category._id !== categoryId
            )
        );

        setDeleteCategoryId(null);

        setSuccess(response.data.message);

    } catch (error) {
        console.error(
            "Delete category error:",
            error
        );

        setDeleteCategoryId(null);

        setError(
            error.response?.data?.message ||
                "Something went wrong. Please try again."
        );
    }
};

  return (
    <div className="admin-category-page">
      <AdminNavbar />

      <main className="admin-category-content">
        <h1>CATEGORY MANAGEMENT</h1>

        <form
          className="category-add-form"
          onSubmit={handleAddCategory}
        >
          <input
            type="text"
            placeholder="Enter category name"
            value={categoryName}
            onChange={(event) =>
              setCategoryName(event.target.value)
            }
          />

          <button type="submit" disabled={adding}>
            {adding ? "ADDING..." : "ADD CATEGORY"}
          </button>
        </form>

        {success && (
          <p className="category-success">
            {success}
          </p>
        )}

        {error && (
          <p className="category-error">
            {error}
          </p>
        )}

        {loading && <p>Loading categories...</p>}

        {!loading && !error && (
          <div className="category-list">
            {categories.map((category) => (
              <div
                className="category-item"
                key={category._id}
              >
               <div className="category-item-info">
    {editCategoryId === category._id ? (
        <input
            type="text"
            value={editCategoryName}
            onChange={(event) =>
                setEditCategoryName(
                    event.target.value
                )
            }
            autoFocus
        />
    ) : (
        <>
            <h3>{category.name}</h3>

            <p>
                {category.isActive
                    ? "Active"
                    : "Inactive"}
            </p>
        </>
    )}
</div>

<div className="category-item-actions">
    {editCategoryId === category._id ? (
        <>
            <button
                type="button"
                onClick={() =>
                    handleEditCategory(
                        category._id
                    )
                }
            >
                SAVE
            </button>

            <button
                type="button"
                onClick={() => {
                    setEditCategoryId(null);
                    setEditCategoryName("");
                }}
            >
                CANCEL
            </button>
        </>
    ) : (
        <>
    <button
        type="button"
        onClick={() => {
            setEditCategoryId(
                category._id
            );
            setEditCategoryName(
                category.name
            );
            setError("");
            setSuccess("");
        }}
    >
        EDIT
    </button>

    <button
        type="button"
        onClick={() =>
            handleToggleCategoryStatus(
                category._id
            )
        }
    >
        {category.isActive
            ? "DEACTIVATE"
            : "ACTIVATE"}
    </button>

    <button
        type="button"
        onClick={() =>
            setDeleteCategoryId(
                category._id
            )
        }
    >
        DELETE
    </button>
</>
    )}
</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteCategoryId && (
    <div className="delete-modal-overlay">
        <div className="delete-modal">
            <h2>DELETE CATEGORY</h2>

            <p>
                Are you sure you want to delete this
                category?
            </p>

            <div className="delete-modal-actions">
                <button
                    type="button"
                    onClick={() =>
                        setDeleteCategoryId(null)
                    }
                >
                    CANCEL
                </button>

                <button
                    type="button"
                    onClick={() =>
                        handleDeleteCategory(
                            deleteCategoryId
                        )
                    }
                >
                    DELETE
                </button>
            </div>
        </div>
    </div>
)}

      <AdminFooter />
    </div>
  );
}

export default CategoryManagement;