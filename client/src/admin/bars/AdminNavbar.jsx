import { Link } from "react-router-dom";

function AdminNavbar() {
  return (
    <nav className="admin-navbar">
      {/* LEFT - LOGO */}

      <div className="admin-navbar-logo">
        <Link to="/admin/dashboard">ESSENZA</Link>
      </div>

      {/* CENTER - NAVIGATION */}

      <div className="admin-navbar-links">
        <Link to="/admin/dashboard">Dashboard</Link>

        <Link to="/admin/products">Product</Link>

        <Link to="/admin/orders">Order</Link>

        <Link to="/admin/categories">Category</Link>

        <Link to="/admin/coupons">Coupon</Link>

        <Link to="/admin/offers">Offer</Link>

        <Link to="/admin/reviews">Review</Link>

        <Link to="/admin/sales-report">Sales Report</Link>

        <Link to="/admin/customers">Customer</Link>
      </div>

      {/* RIGHT - ADMIN PROFILE */}

      <div className="admin-navbar-profile">
        <Link to="/admin/profile" className="admin-profile-link">
          <span className="admin-profile-icon">👤</span>
        </Link>
      </div>
    </nav>
  );
}

export default AdminNavbar;
