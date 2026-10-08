import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SearchOverlay({ onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus search input when overlay opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close search with Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      const trimmedSearch = searchTerm.trim();

      if (!trimmedSearch) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:5000/api/products?search=${encodeURIComponent(
            trimmedSearch
          )}`
        );

        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Search products error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleProductClick = (productId) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  return (
    <div
      className="search-overlay"
      onClick={onClose}
    >
      <div
        className="search-window"
        onClick={(event) => event.stopPropagation()}
      >
        {/* SEARCH HEADER */}

        <div className="search-window-header">

          <div className="search-input-wrapper">

            <svg
              className="search-input-icon"
              viewBox="0 0 24 24"
              width="21"
              height="21"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="M20 20l-4-4" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search fragrances..."
            />

          </div>

          <button
            type="button"
            className="search-close-button"
            onClick={onClose}
            aria-label="Close search"
          >
            ×
          </button>

        </div>

        {/* SEARCH CONTENT */}

        <div className="search-results">

          {!searchTerm.trim() && (
            <div className="search-empty-state">
              <h3>SEARCH ESSENZA</h3>
              <p>
                Find your signature fragrance.
              </p>
            </div>
          )}

          {loading && (
            <div className="search-message">
              Searching...
            </div>
          )}

          {!loading &&
            searchTerm.trim() &&
            products.length === 0 && (
              <div className="search-empty-state">
                <h3>NO PRODUCTS FOUND</h3>
                <p>
                  Try searching for another fragrance.
                </p>
              </div>
            )}

          {!loading && products.length > 0 && (
            <div className="search-product-list">

              {products.slice(0, 8).map((product) => {

                const image =
                  product.productImage?.[0];

                const startingPrice =
                  product.variants?.[0]?.price;

                return (
                  <button
                    type="button"
                    className="search-product-item"
                    key={product._id}
                    onClick={() =>
                      handleProductClick(product._id)
                    }
                  >

                    <div className="search-product-image">

                      {image ? (
                        <img
                          src={`http://localhost:5000${image}`}
                          alt={product.name}
                        />
                      ) : (
                        <span>
                          No Image
                        </span>
                      )}

                    </div>

                    <div className="search-product-info">

                      <p className="search-product-category">
                        {product.categoryId?.name}
                      </p>

                      <h3>
                        {product.name}
                      </h3>

                      {startingPrice ? (
                        <p className="search-product-price">
                          From ₹{startingPrice}
                        </p>
                      ) : (
                        <p className="search-product-price">
                          Price unavailable
                        </p>
                      )}

                    </div>

                  </button>
                );
              })}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default SearchOverlay;