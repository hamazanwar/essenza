import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

const PRODUCTS_PER_PAGE = 8;

function Shop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [priceFilter, setPriceFilter] = useState("all");

  // Stores current image index for each product
  const [imageIndexes, setImageIndexes] = useState({});
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  // ================================
  // FETCH PRODUCTS
  // ================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        let url = "http://localhost:5000/api/products";

        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
        }

        const response = await axios.get(url);

        setProducts(response.data.products || []);

        // Reset pagination when category changes
        setCurrentPage(1);

        // Reset image positions
        setImageIndexes({});
      } catch (error) {
        console.error("Fetch products error:", error);

        setError(error.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // ================================
  // FETCH WISHLIST
  // ================================

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setWishlistProducts([]);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const wishlist = response.data.wishlist?.products || [];

        setWishlistProducts(
          wishlist.map((item) => item.productId?._id || item.productId),
        );
      } catch (error) {
        console.error("Fetch wishlist error:", error);

        setWishlistProducts([]);
      }
    };

    fetchWishlist();
  }, []);

  // ================================
// FILTER PRODUCTS BY PRICE
// ================================

const filteredProducts = products.filter((product) => {
  const price = product.variants?.[0]?.price || 0;

  if (priceFilter === "under-500") {
    return price < 500;
  }

  if (priceFilter === "500-1000") {
    return price >= 500 && price <= 1000;
  }

  if (priceFilter === "1000-2000") {
    return price > 1000 && price <= 2000;
  }

  if (priceFilter === "2000-3000") {
    return price > 2000 && price <= 3000;
  }

  if (priceFilter === "3000-4000") {
    return price > 3000 && price <= 4000;
  }

  if (priceFilter === "above-4000") {
    return price > 4000;
  }

  return true;
});

  // ================================
  // SORT PRODUCTS
  // ================================

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "price-low-high") {
      const priceA = a.variants?.[0]?.price || 0;
      const priceB = b.variants?.[0]?.price || 0;

      return priceA - priceB;
    }

    if (sortOption === "price-high-low") {
      const priceA = a.variants?.[0]?.price || 0;
      const priceB = b.variants?.[0]?.price || 0;

      return priceB - priceA;
    }

    if (sortOption === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return 0;
  });

  // ================================
  // PAGINATION
  // ================================

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const currentProducts = sortedProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  // ================================
  // TOGGLE WISHLIST
  // ================================

  const toggleWishlist = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const isWishlisted = wishlistProducts.includes(productId);

    try {
      if (isWishlisted) {
        await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWishlistProducts((previous) =>
          previous.filter((id) => id !== productId),
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/wishlist",
          {
            productId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setWishlistProducts((previous) => [...previous, productId]);
      }
    } catch (error) {
      console.error("Toggle wishlist error:", error);
    }
  };

  // ================================
  // NEXT IMAGE
  // ================================

  const nextImage = (productId, imageCount) => {
    setImageIndexes((previous) => {
      const currentIndex = previous[productId] || 0;

      return {
        ...previous,
        [productId]: (currentIndex + 1) % imageCount,
      };
    });
  };

  // ================================
  // PREVIOUS IMAGE
  // ================================

  const previousImage = (productId, imageCount) => {
    setImageIndexes((previous) => {
      const currentIndex = previous[productId] || 0;

      return {
        ...previous,
        [productId]: (currentIndex - 1 + imageCount) % imageCount,
      };
    });
  };

  // ================================
  // PAGE CHANGE
  // ================================

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((previous) => previous - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((previous) => previous + 1);
    }
  };

  return (
    <>
      <Navbar />

      <main className="shop-page">
        {/* ================================
            SHOP HEADER
        ================================= */}

        <section className="shop-header">
          <h1>{category ? category : "ALL PRODUCTS"}</h1>

          <p>Discover the ESSENZA fragrance collection.</p>
        </section>

        <div className="shop-controls">

  {/* PRICE FILTER */}

<div className="shop-sort">
  <label htmlFor="price-filter">
    PRICE
  </label>

  <select
    id="price-filter"
    value={priceFilter}
    onChange={(event) => {
      setPriceFilter(event.target.value);
      setCurrentPage(1);
    }}
  >
    <option value="all">
      Default
    </option>

    <option value="under-500">
      Under ₹500
    </option>

    <option value="500-1000">
      ₹500 – ₹1,000
    </option>

    <option value="1000-2000">
      ₹1,000 – ₹2,000
    </option>

    <option value="2000-3000">
      ₹2,000 – ₹3,000
    </option>

    <option value="3000-4000">
      ₹3,000 – ₹4,000
    </option>

    <option value="above-4000">
      Above ₹4,000
    </option>
  </select>
</div>

  {/* SORT */}

  <div className="shop-sort">
    <label htmlFor="sort-products">
      SORT BY
    </label>

    <select
      id="sort-products"
      value={sortOption}
      onChange={(event) => {
        setSortOption(event.target.value);
        setCurrentPage(1);
      }}
    >
      <option value="default">
        Default
      </option>

      <option value="newest">
        Newest
      </option>

      <option value="price-low-high">
        Price: Low to High
      </option>

      <option value="price-high-low">
        Price: High to Low
      </option>
    </select>
  </div>

</div>

        {/* ================================
            LOADING
        ================================= */}

        {loading && <div className="shop-message">Loading products...</div>}

        {/* ================================
            ERROR
        ================================= */}

        {!loading && error && <div className="shop-message error">{error}</div>}

        {/* ================================
            NO PRODUCTS
        ================================= */}

        {!loading && !error && sortedProducts.length === 0 && (
  <div className="shop-message">
    No products found for this price range.
  </div>
)}

        {/* ================================
            PRODUCTS
        ================================= */}

        {!loading && !error && sortedProducts.length > 0 && (
          <>
            <section className="product-grid">
              {currentProducts.map((product) => {
                const images = product.productImage || [];

                const currentImageIndex = imageIndexes[product._id] || 0;

                return (
                  <article className="product-card" key={product._id}>
                    {/* PRODUCT IMAGE */}
                    <div className="product-image-container">
                      <button
                        type="button"
                        className={`wishlist-button ${
                          wishlistProducts.includes(product._id)
                            ? "wishlist-active"
                            : ""
                        }`}
                        onClick={() => toggleWishlist(product._id)}
                        aria-label={
                          wishlistProducts.includes(product._id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        {wishlistProducts.includes(product._id) ? "♥" : "♡"}
                      </button>
                      {images.length > 0 ? (
                        <>
                          <img
                            src={`http://localhost:5000${images[currentImageIndex]}`}
                            alt={product.name}
                            className="product-image"
                            onClick={() => navigate(`/product/${product._id}`)}
                          />

                          {/* IMAGE ARROWS */}

                          {images.length > 1 && (
                            <>
                              <button
                                className="image-arrow image-arrow-left"
                                onClick={() =>
                                  previousImage(product._id, images.length)
                                }
                                aria-label="Previous image"
                              >
                                ‹
                              </button>

                              <button
                                className="image-arrow image-arrow-right"
                                onClick={() =>
                                  nextImage(product._id, images.length)
                                }
                                aria-label="Next image"
                              >
                                ›
                              </button>

                              {/* IMAGE COUNTER */}

                              <span className="image-counter">
                                {currentImageIndex + 1} / {images.length}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="product-image-placeholder">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* PRODUCT INFO */}

                    <div className="product-info">
                      <p className="product-category">
                        {product.categoryId?.name}
                      </p>

                      <h2>{product.name}</h2>

                      {product.variants?.length > 0 ? (
                        <p className="product-price">
                          From ₹{product.variants[0].price}
                        </p>
                      ) : (
                        <p className="product-price">Price unavailable</p>
                      )}

                      <button
                        className="buy-now-button"
                        onClick={() =>
                          navigate(`/checkout?productId=${product._id}`)
                        }
                      >
                        BUY NOW
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* ================================
                  PAGINATION
              ================================= */}

            {totalPages > 1 && (
              <div className="shop-pagination">
                <button
                  className="pagination-button"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="pagination-button"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
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

export default Shop;
