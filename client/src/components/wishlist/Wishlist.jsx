import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Heart } from "lucide-react";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

// Handle Cloudinary URLs and legacy local image paths
const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${api.defaults.baseURL.replace(/\/api\/?$/, "")}${image.startsWith("/") ? image : `/${image}`}`;
};

function Wishlist() {
  const navigate = useNavigate();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const PRODUCTS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [cartLoading, setCartLoading] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  // ==========================================
  // FETCH WISHLIST
  // ==========================================

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
       const response = await api.get("/wishlist", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        const products = response.data.wishlist?.products || [];

        setWishlistProducts(products);
      } catch (error) {
        console.error("Fetch wishlist error:", error);

        setError(error.response?.data?.message || "Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  // ==========================================
  // REMOVE FROM WISHLIST
  // ==========================================

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await api.delete(`/wishlist/${productId}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      setWishlistProducts((previous) =>
        previous.filter(
          (item) => (item.productId?._id || item.productId) !== productId,
        ),
      );
    } catch (error) {
      console.error("Remove wishlist error:", error);
    }
  };

  const addWishlistProductToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const productId = product._id;
    const variants = product.variants || [];

    console.log("Product:", product);
    console.log("Product variants:", variants);

    // Get the selected variant or the first available variant
    const selectedVariantId = selectedVariants[productId];

    const selectedVariant =
      variants.find(
        (variant) => String(variant._id) === String(selectedVariantId),
      ) || variants.find((variant) => Number(variant.stock) > 0);

    // Check variant availability
    if (!selectedVariant) {
      setCartMessage(
        "No available size found. Please select a size or open the product page.",
      );
      return;
    }

    try {
      setCartLoading(productId);
      setCartMessage("");

    const response = await api.post(
  "/cart",
  {
    productId: productId,
    variantId: selectedVariant._id,
    quantity: 1,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

      console.log("Cart response:", response.data);

      setCartMessage(`${product.name} added to cart successfully.`);
    } catch (error) {
      console.error(
        "Add to cart error:",
        error.response?.data || error.message,
      );

      setCartMessage(
        error.response?.data?.message ||
          "Unable to add this product to your cart.",
      );
    } finally {
      setCartLoading(null);
    }
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(wishlistProducts.length / PRODUCTS_PER_PAGE);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const currentProducts = wishlistProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  // ==========================================
  // PRODUCT CLICK
  // ==========================================

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="wishlist-page">
          <div className="wishlist-loading">Loading wishlist...</div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <>
        <Navbar />

        <main className="wishlist-page">
          <div className="wishlist-error">{error}</div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="wishlist-page">
        {/* ==========================================
            WISHLIST HEADER
        ========================================== */}

        <section className="wishlist-header">
          <h1>MY WISHLIST</h1>

          <p>Your favourite ESSENZA fragrances.</p>
        </section>

        {/* ==========================================
            EMPTY WISHLIST
        ========================================== */}

        {wishlistProducts.length === 0 ? (
          <section className="wishlist-empty">
            <div className="wishlist-empty-icon">♡</div>

            <h2>YOUR WISHLIST IS EMPTY</h2>

            <p>Save your favourite fragrances and find them here.</p>

            <button type="button" onClick={() => navigate("/shop")}>
              EXPLORE COLLECTION
            </button>
          </section>
        ) : (
          <>
            {/* ==========================================
        WISHLIST PRODUCTS
    ========================================== */}

            <section className="wishlist-grid">
              {currentProducts.map((item) => {
                const product = item.productId;

                if (!product) {
                  return null;
                }

                const productId = product._id;

                const image = product.productImage?.[0];

                return (
                  <article className="wishlist-card" key={productId}>
                    {/* PRODUCT IMAGE */}

                    <div
                      className="wishlist-image-container"
                      onClick={() => handleProductClick(productId)}
                    >
                      {image ? (
                        <img
  src={getImageUrl(image)}
  alt={product.name}
  className="wishlist-image"
/>
                      ) : (
                        <div className="wishlist-image-placeholder">
                          NO IMAGE
                        </div>
                      )}

                      {/* REMOVE BUTTON */}

                      <button
                        type="button"
                        className="wishlist-remove-button"
                        aria-label="Remove from wishlist"
                        onClick={(event) => {
                          event.stopPropagation();

                          removeFromWishlist(productId);
                        }}
                    
>
  <Heart size={20} strokeWidth={1.8} fill="currentColor" />
</button>

                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="wishlist-product-info">
                      {product.categoryId?.name && (
                        <span className="wishlist-category">
                          {product.categoryId.name.toUpperCase()}
                        </span>
                      )}

                      <h2>{product.name}</h2>

                      {/* SELECT SIZE */}

                      {product.variants?.length > 0 && (
                        <select
                          className="wishlist-variant-select"
                          value={selectedVariants[productId] || ""}
                          onChange={(event) =>
                            setSelectedVariants((previous) => ({
                              ...previous,
                              [productId]: event.target.value,
                            }))
                          }
                          aria-label={`Select size for ${product.name}`}
                        >
                          <option value="">Select size</option>

                          {product.variants.map((variant) => (
                            <option
                              key={variant._id}
                              value={variant._id}
                              disabled={variant.stock <= 0}
                            >
                              {variant.size}
                              {variant.stock <= 0 ? " - Out of stock" : ""}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* ADD TO CART */}

                      <button
                        type="button"
                        className="wishlist-add-cart-button"
                        onClick={() => addWishlistProductToCart(product)}
                        disabled={cartLoading === productId}
                      >
                        {cartLoading === productId
                          ? "ADDING..."
                          : "ADD TO CART"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* ==========================================
        PAGINATION
    ========================================== */}

            {totalPages > 1 && (
              <div className="wishlist-pagination">
                {/* PREVIOUS */}

                <button
                  type="button"
                  className="wishlist-pagination-button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((previous) => previous - 1)}
                >
                  ‹
                </button>

                {/* PAGE NUMBERS */}

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={`wishlist-pagination-button ${
                      currentPage === page ? "wishlist-pagination-active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                {/* NEXT */}

                <button
                  type="button"
                  className="wishlist-pagination-button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((previous) => previous + 1)}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Wishlist;
