import { NavLink } from "react-router-dom";

function AdminNavbar() {
  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      label: "Products",
      path: "/admin/products",
    },
    {
      label: "Orders",
      path: "/admin/orders",
    },
    {
      label: "Categories",
      path: "/admin/categories",
    },
    {
      label: "Coupons",
      path: "/admin/coupons",
    },
    {
      label: "Offers",
      path: "/admin/offers",
    },
    {
      label: "Reviews",
      path: "/admin/reviews",
    },
    {
      label: "Sales Report",
      path: "/admin/sales-report",
    },
    {
      label: "Customers",
      path: "/admin/customers",
    },
  ];

  return (
    <aside className="admin-sidebar">
      {/* LOGO */}
      <div className="admin-sidebar-logo">
        <NavLink to="/admin/dashboard">
          ESSENZA
        </NavLink>

        <span>ADMIN PANEL</span>
      </div>

      {/* NAVIGATION */}
      <nav className="admin-sidebar-navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `admin-sidebar-link ${
                isActive ? "admin-sidebar-link-active" : ""
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* PROFILE */}
      <div className="admin-sidebar-bottom">
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `admin-sidebar-profile ${
              isActive ? "admin-sidebar-profile-active" : ""
            }`
          }
        >
          <span className="admin-sidebar-profile-icon">
            👤
          </span>

          <span>Admin Profile</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default AdminNavbar;