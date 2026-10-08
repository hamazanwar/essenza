import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";


function Wishlist() {
  const navigate = useNavigate();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const PRODUCTS_PER_PAGE = 12;
const [currentPage, setCurrentPage] = useState(1);

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
        const response = await axios.get(
          "http://localhost:5000/api/wishlist",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const products =
          response.data.wishlist?.products || [];

        setWishlistProducts(products);
      } catch (error) {
        console.error(
          "Fetch wishlist error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load wishlist"
        );
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
      await axios.delete(
        `http://localhost:5000/api/wishlist/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWishlistProducts((previous) =>
        previous.filter(
          (item) =>
            (item.productId?._id ||
              item.productId) !== productId
        )
      );
    } catch (error) {
      console.error(
        "Remove wishlist error:",
        error
      );
    }
  };

  // ==========================================
// PAGINATION
// ==========================================

const totalPages = Math.ceil(
  wishlistProducts.length / PRODUCTS_PER_PAGE
);

const startIndex =
  (currentPage - 1) * PRODUCTS_PER_PAGE;

const currentProducts =
  wishlistProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
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
          <div className="wishlist-loading">
            Loading wishlist...
          </div>
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
          <div className="wishlist-error">
            {error}
          </div>
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

          <p>
            Your favourite ESSENZA fragrances.
          </p>
        </section>

        {/* ==========================================
            EMPTY WISHLIST
        ========================================== */}

        {wishlistProducts.length === 0 ? (
  <section className="wishlist-empty">

    <div className="wishlist-empty-icon">
      ♡
    </div>

    <h2>
      YOUR WISHLIST IS EMPTY
    </h2>

    <p>
      Save your favourite fragrances
      and find them here.
    </p>

    <button
      type="button"
      onClick={() => navigate("/shop")}
    >
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

        const image =
          product.productImage?.[0];

        return (
          <article
            className="wishlist-card"
            key={productId}
          >

            {/* PRODUCT IMAGE */}

            <div
              className="wishlist-image-container"
              onClick={() =>
                handleProductClick(productId)
              }
            >

              {image ? (
                <img
                  src={`http://localhost:5000${image}`}
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
                ♥
              </button>

            </div>

            {/* PRODUCT DETAILS */}

            <div className="wishlist-product-info">

              {product.categoryId?.name && (
                <span className="wishlist-category">
                  {product.categoryId.name.toUpperCase()}
                </span>
              )}

              <h2>
                {product.name}
              </h2>

              <button
                type="button"
                className="wishlist-view-button"
                onClick={() =>
                  handleProductClick(productId)
                }
              >
                VIEW PRODUCT
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
          onClick={() =>
            setCurrentPage((previous) =>
              previous - 1
            )
          }
        >
          ‹
        </button>

        {/* PAGE NUMBERS */}

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <button
            type="button"
            key={page}
            className={`wishlist-pagination-button ${
              currentPage === page
                ? "wishlist-pagination-active"
                : ""
            }`}
            onClick={() =>
              setCurrentPage(page)
            }
          >
            {page}
          </button>
        ))}

        {/* NEXT */}

        <button
          type="button"
          className="wishlist-pagination-button"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((previous) =>
              previous + 1
            )
          }
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