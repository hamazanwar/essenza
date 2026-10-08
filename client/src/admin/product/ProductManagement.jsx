import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";

function ProductManagement() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;

  const [editVariants, setEditVariants] = useState([]);
  const [success, setSuccess] = useState("");
  const [editProductId, setEditProductId] = useState(null);
  const [editProductName, setEditProductName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFragranceNotes, setEditFragranceNotes] = useState("");
  const [editIngredients, setEditIngredients] = useState("");
  const [editHowToUse, setEditHowToUse] = useState("");
  const [editShippingAndReturns, setEditShippingAndReturns] = useState("");
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [editProductImages, setEditProductImages] = useState([]);
  const [newProductImages, setNewProductImages] = useState([]);

  const totalPages = Math.ceil(
  products.length / PRODUCTS_PER_PAGE
);

const startIndex =
  (currentPage - 1) * PRODUCTS_PER_PAGE;

const currentProducts = products.slice(
  startIndex,
  startIndex + PRODUCTS_PER_PAGE
);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        "http://localhost:5000/api/admin/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProducts(response.data.products);
    } catch (error) {
      console.error("Product fetch error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        "http://localhost:5000/api/admin/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCategories(response.data.categories);
    } catch (error) {
      console.error("Category fetch error:", error);

      setError(error.response?.data?.message || "Unable to load categories.");
    }
  };

  const handleEditProduct = async (productId) => {
    if (!editProductName.trim()) {
      setError("Product name is required.");
      setSuccess("");
      return;
    }

    if (!editCategoryId) {
      setError("Please select a category.");
      setSuccess("");
      return;
    }

    if (!editDescription.trim()) {
      setError("Product description is required.");
      setSuccess("");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      const formData = new FormData();

      formData.append("categoryId", editCategoryId);

      formData.append("name", editProductName);

      formData.append("description", editDescription);

      formData.append("fragranceNotes", editFragranceNotes);

      formData.append("ingredients", editIngredients);

      formData.append("howToUse", editHowToUse);

      formData.append("shippingAndReturns", editShippingAndReturns);

      formData.append("existingImages", JSON.stringify(editProductImages));

      newProductImages.forEach((image) => {
        formData.append("productImages", image);
      });

      const response = await axios.patch(
        `http://localhost:5000/api/admin/products/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // SAVE PRODUCT VARIANTS
      for (const variant of editVariants) {
        if (variant.id) {
          // UPDATE EXISTING VARIANT
          await axios.patch(
            `http://localhost:5000/api/admin/variants/${variant.id}`,
            {
              size: variant.size,
              price: Number(variant.price),
              stock: Number(variant.stock),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        } else {
          // ADD NEW VARIANT
          await axios.post(
            "http://localhost:5000/api/admin/variants",
            {
              productId,
              size: variant.size,
              price: Number(variant.price),
              stock: Number(variant.stock),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        }
      }

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product._id === productId ? response.data.product : product,
        ),
      );

      setEditProductId(null);
      setEditProductName("");
      setEditCategoryId("");
      setEditDescription("");
      setEditFragranceNotes("");
      setEditIngredients("");
      setEditHowToUse("");
      setEditShippingAndReturns("");
      setEditProductImages([]);
      setNewProductImages([]);
      setEditVariants([]);

      setSuccess("Product updated successfully.");
    } catch (error) {
      console.error("Edit product error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  const handleToggleProductStatus = async (productId) => {
    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.patch(
        `http://localhost:5000/api/admin/products/${productId}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product._id === productId ? response.data.product : product,
        ),
      );

      setSuccess(response.data.message);
    } catch (error) {
      console.error("Toggle product status error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.delete(
        `http://localhost:5000/api/admin/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProducts((previousProducts) =>
        previousProducts.filter((product) => product._id !== productId),
      );

      setDeleteProductId(null);

      setSuccess(response.data.message);
    } catch (error) {
      console.error("Delete product error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );

      setDeleteProductId(null);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
  if (totalPages > 0 && currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
}, [currentPage, totalPages]);

  return (
    <div className="admin-product-page">
      <AdminNavbar />

      <main className="admin-product-content">

  <div className="product-management-header">
    <h1>PRODUCT MANAGEMENT</h1>

    <button
      type="button"
      className="add-product-button"
      onClick={() => navigate("/admin/products/add")}
    >
      ADD PRODUCT
    </button>
  </div>

        

        {loading && <p>Loading products...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p>No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <>
          <div className="product-list">
            {currentProducts.map((product) => (
              <div
                key={product._id}
                className={`product-item ${
                  editProductId === product._id ? "product-item-editing" : ""
                }`}
              >
                {editProductId === product._id ? (
                  <>
                    <input
                      type="text"
                      value={editProductName}
                      onChange={(event) =>
                        setEditProductName(event.target.value)
                      }
                      placeholder="Product name"
                      autoFocus
                    />

                    <select
                      value={editCategoryId}
                      onChange={(event) =>
                        setEditCategoryId(event.target.value)
                      }
                    >
                      <option value="">Select category</option>

                      {categories
                        .filter((category) => category.isActive)
                        .map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                    </select>

                    <textarea
                      value={editDescription}
                      onChange={(event) =>
                        setEditDescription(event.target.value)
                      }
                      placeholder="Product description"
                    />
                    <textarea
                      value={editFragranceNotes}
                      onChange={(event) =>
                        setEditFragranceNotes(event.target.value)
                      }
                      placeholder="Fragrance notes"
                    />

                    <textarea
                      value={editIngredients}
                      onChange={(event) =>
                        setEditIngredients(event.target.value)
                      }
                      placeholder="Ingredients"
                    />

                    <textarea
                      value={editHowToUse}
                      onChange={(event) => setEditHowToUse(event.target.value)}
                      placeholder="How to use"
                    />

                    <textarea
                      value={editShippingAndReturns}
                      onChange={(event) =>
                        setEditShippingAndReturns(event.target.value)
                      }
                      placeholder="Shipping & returns"
                    />
                    <div className="product-variants">
                      <div className="product-variants-header">
                        <h3>PRODUCT VARIANTS</h3>

                        <button
                          type="button"
                          className="product-variant-add"
                          onClick={() => {
                            setEditVariants((previousVariants) => [
                              ...previousVariants,
                              {
                                size: "",
                                price: "",
                                stock: "",
                              },
                            ]);
                          }}
                        >
                          + ADD VARIANT
                        </button>
                      </div>

                      {editVariants.map((variant, index) => (
                        <div
                          key={variant.id || index}
                          className="product-variant-row"
                        >
                          <input
                            type="text"
                            placeholder="Size (e.g. 50ml)"
                            value={variant.size}
                            onChange={(event) => {
                              const updatedVariants = [...editVariants];

                              updatedVariants[index].size = event.target.value;

                              setEditVariants(updatedVariants);
                            }}
                          />

                          <input
                            type="number"
                            placeholder="Price"
                            min="0"
                            value={variant.price}
                            onChange={(event) => {
                              const updatedVariants = [...editVariants];

                              updatedVariants[index].price = event.target.value;

                              setEditVariants(updatedVariants);
                            }}
                          />

                          <input
                            type="number"
                            placeholder="Stock"
                            min="0"
                            value={variant.stock}
                            onChange={(event) => {
                              const updatedVariants = [...editVariants];

                              updatedVariants[index].stock = event.target.value;

                              setEditVariants(updatedVariants);
                            }}
                          />

                          <button
                            type="button"
                            className="product-variant-remove"
                            onClick={async () => {
                              const variant = editVariants[index];

                              try {
                                setError("");
                                setSuccess("");

                                // Existing variant → delete from database
                                if (variant.id) {
                                  const token =
                                    localStorage.getItem("adminToken");

                                  await axios.delete(
                                    `http://localhost:5000/api/admin/variants/${variant.id}`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    },
                                  );
                                }

                                // Remove from React state
                                setEditVariants((previousVariants) =>
                                  previousVariants.filter(
                                    (_, variantIndex) => variantIndex !== index,
                                  ),
                                );

                                setSuccess("Variant removed successfully.");
                              } catch (error) {
                                console.error("Delete variant error:", error);

                                setError(
                                  error.response?.data?.message ||
                                    "Unable to remove variant.",
                                );
                              }
                            }}
                          >
                            REMOVE
                          </button>
                        </div>
                      ))}
                    </div>
                    {editProductImages.length > 0 && (
                      <div className="edit-product-images">
                        {editProductImages.map((image, index) => (
                          <div key={index} className="edit-product-image-item">
                            <img
                              src={`http://localhost:5000${image}`}
                              alt={`${editProductName} ${index + 1}`}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setEditProductImages((previousImages) =>
                                  previousImages.filter(
                                    (_, imageIndex) => imageIndex !== index,
                                  ),
                                );
                              }}
                            >
                              REMOVE
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {newProductImages.length > 0 && (
                      <div className="new-product-images">
                        {newProductImages.map((image, index) => (
                          <div key={index} className="new-product-image-item">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={image.name}
                            />

                            <span>{image.name}</span>

                            <button
                              type="button"
                              onClick={() => {
                                setNewProductImages((previousImages) =>
                                  previousImages.filter(
                                    (_, imageIndex) => imageIndex !== index,
                                  ),
                                );
                              }}
                            >
                              REMOVE
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(event) => {
                        const selectedImages = Array.from(event.target.files);

                        setNewProductImages((previousImages) => [
                          ...previousImages,
                          ...selectedImages,
                        ]);
                      }}
                    />
                  </>
                ) : (
                  <h3>{product.name}</h3>
                )}

                {editProductId !== product._id &&
                  product.productImage?.length > 0 && (
                    <div className="product-images">
                      {product.productImage.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000${image}`}
                          alt={`${product.name} ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                <p>Category: {product.categoryId?.name}</p>

                <p>{product.description}</p>

                <p>Status: {product.isActive ? "Active" : "Inactive"}</p>
                <div className="product-item-actions">
                  {editProductId === product._id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product._id)}
                      >
                        SAVE
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditProductId(null);
                          setEditProductName("");
                          setEditCategoryId("");
                          setEditDescription("");
                          setEditFragranceNotes("");
                          setEditIngredients("");
                          setEditHowToUse("");
                          setEditShippingAndReturns("");
                          setEditProductImages([]);
                          setNewProductImages([]);
                          setEditVariants([]);
                        }}
                      >
                        CANCEL
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          setEditProductId(product._id);

                          setEditProductName(product.name);

                          setEditCategoryId(
                            typeof product.categoryId === "object"
                              ? product.categoryId._id
                              : product.categoryId,
                          );

                          setEditDescription(product.description);

                          setEditFragranceNotes(product.fragranceNotes || "");

                          setEditIngredients(product.ingredients || "");

                          setEditHowToUse(product.howToUse || "");

                          setEditShippingAndReturns(
                            product.shippingAndReturns || "",
                          );

                          setEditProductImages(product.productImage || []);
                          setNewProductImages([]);
                          setEditVariants([]);

                          setError("");
                          setSuccess("");

                          const token = localStorage.getItem("adminToken");

                          try {
                            const response = await axios.get(
                              `http://localhost:5000/api/admin/variants/product/${product._id}`,
                              {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              },
                            );

                            setEditVariants(
                              response.data.variants.map((variant) => ({
                                id: variant._id,
                                size: variant.size,
                                price: variant.price,
                                stock: variant.stock,
                              })),
                            );
                          } catch (error) {
                            console.error("Get product variants error:", error);

                            setError(
                              error.response?.data?.message ||
                                "Unable to load product variants.",
                            );
                          }
                        }}
                      >
                        EDIT
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleProductStatus(product._id)}
                      >
                        {product.isActive ? "DEACTIVATE" : "ACTIVATE"}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteProductId(product._id)}
                  >
                    DELETE
                  </button>
                </div>
                {deleteProductId === product._id && (
                  <div className="product-delete-modal">
                    <div className="product-delete-modal-content">
                      <h2>DELETE PRODUCT</h2>

                      <p>Are you sure you want to delete this product?</p>

                      <div className="product-delete-modal-actions">
                        <button
                          type="button"
                          onClick={() => setDeleteProductId(null)}
                        >
                          CANCEL
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(deleteProductId)}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                            </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="product-pagination">

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    (previousPage) => previousPage - 1
                  )
                }
              >
                PREVIOUS
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage(
                    (previousPage) => previousPage + 1
                  )
                }
              >
                NEXT
              </button>

            </div>
          )}
          </>
        )}
      </main>

      <AdminFooter />
    </div>
  );
}

export default ProductManagement;
