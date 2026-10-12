import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import SearchOverlay from "../search/SearchOverlay";

function Navbar() {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

const [cartCount, setCartCount] = useState(0);
const [wishlistCount, setWishlistCount] = useState(0);

  // ==========================================
  // CHECK LOGIN STATUS
  // ==========================================

  const isLoggedIn = !!localStorage.getItem("token");

  // ==========================================
  // FETCH ACTIVE CATEGORIES
  // ==========================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
    "http://localhost:5000/api/categories"
);

        const activeCategories =
          response.data.categories.filter(
            (category) => category.isActive
          );

        setCategories(activeCategories);
      } catch (error) {
        console.error(
          "Category fetch error:",
          error
        );
      }
    };

    fetchCategories();
  }, []);

  
useEffect(() => {
  const fetchNavbarCounts = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(
        "http://localhost:5000/api/cart",
        config
      );

      const cart = response.data.cart;
      const items = cart?.items || response.data.items || [];

      const count = items.reduce(
        (total, item) => total + Number(item.quantity || 1),
        0
      );

      setCartCount(count);
    } catch (error) {
      console.error("Navbar cart count error:", error);
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/api/wishlist",
        config
      );

      const wishlist =
        response.data.wishlist ||
        response.data;

      const items = Array.isArray(wishlist)
        ? wishlist
        : wishlist?.products ||
          wishlist?.items ||
          [];

      setWishlistCount(items.length);
    } catch (error) {
      console.error("Navbar wishlist count error:", error);
    }
  };

  fetchNavbarCounts();
}, [location.pathname]);


  // ==========================================
  // PROFILE CLICK
  // ==========================================

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/register");
    }
  };

  // ==========================================
  // WISHLIST CLICK
  // ==========================================

  const handleWishlistClick = () => {
    if (isLoggedIn) {
      navigate("/wishlist");
    } else {
      navigate("/register");
    }
  };

  // ==========================================
  // CART CLICK
  // ==========================================

  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate("/cart");
    } else {
      navigate("/register");
    }
  };

  // ==========================================
// MY ORDERS CLICK
// ==========================================

const handleMyOrdersClick = () => {
  if (isLoggedIn) {
    navigate("/my-orders");
  } else {
    navigate("/register");
  }
};

// ==========================================
// WALLET CLICK
// ==========================================

const handleWalletClick = () => {
  if (isLoggedIn) {
    navigate("/wallet");
  } else {
    navigate("/register");
  }
};

  return (
    <nav className="navbar">

      {/* ==========================================
          LEFT - BRAND
      ========================================== */}

      <div className="navbar-brand">
        <Link to="/">ESSENZA</Link>
      </div>

      {/* ==========================================
          CENTER - NAVIGATION
      ========================================== */}

      <div className="navbar-menu">

        <Link to="/">
          HOME
        </Link>

        <Link to="/shop">
          SHOP
        </Link>

        {/* CATEGORIES DROPDOWN */}

        <div className="category-dropdown">

          <button
            type="button"
            className="category-button"
            onClick={() =>
              setCategoryOpen(!categoryOpen)
            }
          >
            CATEGORIES
          </button>

          {categoryOpen && (
            <div className="category-menu">

              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/shop?category=${encodeURIComponent(
                    category.name
                  )}`}
                  onClick={() =>
                    setCategoryOpen(false)
                  }
                >
                  {category.name.toUpperCase()}
                </Link>
              ))}

            </div>
          )}

        </div>

        {/* ABOUT */}

        <Link to="/about">
          ABOUT
        </Link>

        {/* CONTACT */}

        <Link to="/contact">
          CONTACT
        </Link>

      </div>

      {/* ==========================================
          RIGHT - ICONS
      ========================================== */}

      <div className="navbar-actions">

        {/* SEARCH */}

<button
  type="button"
  className="navbar-icon navbar-icon-button"
  aria-label="Search"
  onClick={() => setSearchOpen(true)}
>
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
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
</button>

        {/* WISHLIST */}

        <button
          type="button"
          className="navbar-icon navbar-icon-button"
          aria-label="Wishlist"
          onClick={handleWishlistClick}
        >
          <svg
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {isLoggedIn && wishlistCount > 0 && (
  <span className="navbar-count-badge">
    {wishlistCount > 99 ? "99+" : wishlistCount}
  </span>
)}
        </button>

        {/* CART */}

        <button
          type="button"
          className="navbar-icon navbar-icon-button"
          aria-label="Cart"
          onClick={handleCartClick}
        >
          <svg
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 6h15l-1.5 9h-12z" />

            <path d="M6 6L5 3H2" />

            <circle
              cx="9"
              cy="20"
              r="1"
            />

            <circle
              cx="18"
              cy="20"
              r="1"
            />
          </svg>
          {isLoggedIn && cartCount > 0 && (
  <span className="navbar-count-badge">
    {cartCount > 99 ? "99+" : cartCount}
  </span>
)}
        </button>

        {/* MY ORDERS */}

<button
  type="button"
  className="navbar-icon navbar-icon-button"
  aria-label="My Orders"
  onClick={handleMyOrdersClick}
>
  <svg
    viewBox="0 0 24 24"
    width="21"
    height="21"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3h12v18H6z" />
    <path d="M9 7h6" />
    <path d="M9 11h6" />
    <path d="M9 15h4" />
  </svg>
</button>


        {/* WALLET */}

        <button
          type="button"
          className="navbar-icon navbar-icon-button"
          aria-label="My Wallet"
          title="My Wallet"
          onClick={handleWalletClick}
        >
          <svg
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="15" rx="2" />
            <path d="M3 9h18" />
            <path d="M16 15h.01" />
            <path d="M7 5V3h10v2" />
          </svg>
        </button>



        {/* PROFILE */}

        <button
          type="button"
          className="navbar-icon navbar-icon-button"
          aria-label="Profile"
          onClick={handleProfileClick}
        >
          <svg
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
              cx="12"
              cy="8"
              r="4"
            />

            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
        </button>

      </div>
      {searchOpen && (
  <SearchOverlay
    onClose={() => setSearchOpen(false)}
  />
)}

    </nav>
  );
}

export default Navbar;
