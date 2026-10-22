import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import SearchOverlay from "../search/SearchOverlay";
import {
  Search,
  Heart,
  ShoppingCart,
  ClipboardList,
  Wallet,
  UserRound,
} from "lucide-react";

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
        const response = await api.get("/categories");

        const activeCategories = response.data.categories.filter(
          (category) => category.isActive,
        );

        setCategories(activeCategories);
      } catch (error) {
        console.error("Category fetch error:", error);
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
       const response = await api.get("/cart", config);

        const cart = response.data.cart;
        const items = cart?.items || response.data.items || [];

        const count = items.reduce(
          (total, item) => total + Number(item.quantity || 1),
          0,
        );

        setCartCount(count);
      } catch (error) {
        console.error("Navbar cart count error:", error);
      }

      try {
       const response = await api.get("/wishlist", config);

        const wishlist = response.data.wishlist || response.data;

        const items = Array.isArray(wishlist)
          ? wishlist
          : wishlist?.products || wishlist?.items || [];

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
      <div className="navbar-brand">
        <Link to="/">ESSENZA</Link>
      </div>

      <div className="navbar-menu">
        <Link to="/">HOME</Link>

        <Link to="/shop">SHOP</Link>

        {/* CATEGORIES DROPDOWN */}

        <div className="category-dropdown">
          <button
            type="button"
            className="category-button"
            onClick={() => setCategoryOpen(!categoryOpen)}
          >
            CATEGORIES
          </button>

          {categoryOpen && (
            <div className="category-menu">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  onClick={() => setCategoryOpen(false)}
                >
                  {category.name.toUpperCase()}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ABOUT */}

        <Link to="/about">ABOUT</Link>

        {/* CONTACT */}

        <Link to="/contact">CONTACT</Link>
      </div>

      <div className="navbar-actions">
        {/* SEARCH */}

        <button
          type="button"
          className="navbar-icon navbar-icon-button"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search size={20} strokeWidth={1.7} />
        </button>

        {/* WISHLIST */}

        <button
          type="button"
          className="navbar-icon navbar-icon-button"
          aria-label="Wishlist"
          onClick={handleWishlistClick}
        >
          <Heart size={21} strokeWidth={1.7} />
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
          <ShoppingCart size={21} strokeWidth={1.7} />
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
          <ClipboardList size={21} strokeWidth={1.7} />
        </button>

        {/* WALLET */}

        <button
          type="button"
          className="navbar-icon navbar-icon-button"
          aria-label="My Wallet"
          title="My Wallet"
          onClick={handleWalletClick}
        >
          <Wallet size={21} strokeWidth={1.7} />
        </button>

        {/* PROFILE */}

        <button
          type="button"
          className="navbar-icon navbar-icon-button"
          aria-label="Profile"
          onClick={handleProfileClick}
        >
          <UserRound size={21} strokeWidth={1.7} />
        </button>
      </div>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </nav>
  );
}

export default Navbar;
