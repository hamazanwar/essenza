import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";

function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("7");

  useEffect(() => {
    const fetchDashboardOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("adminToken");

        const response = await api.get("/admin/orders", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        setOrders(response.data.orders || []);
      } catch (err) {
        console.error("Dashboard orders error:", err);

        setError(
          err.response?.data?.message || "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardOrders();
  }, []);

  const validOrders = useMemo(
    () => orders.filter((order) => order.orderStatus !== "CANCELLED"),
    [orders],
  );

  const totalSales = useMemo(
    () =>
      validOrders
        .filter((order) => order.paymentStatus !== "FAILED")
        .reduce((total, order) => total + Number(order.totalAmount || 0), 0),
    [validOrders],
  );

  const customerCount = useMemo(
    () =>
      new Set(
        orders
          .map((order) => {
            const user = order.userId;
            return user?._id || user;
          })
          .filter(Boolean)
          .map(String),
      ).size,
    [orders],
  );

  const productsSold = useMemo(
    () =>
      new Set(
        orders.flatMap((order) =>
          (order.items || [])
            .map((item) => item.productId)
            .filter(Boolean)
            .map((product) => String(product._id || product)),
        ),
      ).size,
    [orders],
  );

  const statusCounts = useMemo(() => {
    const counts = {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    orders.forEach((order) => {
      if (counts[order.orderStatus] !== undefined) {
        counts[order.orderStatus] += 1;
      }
    });

    return counts;
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    [orders],
  );

  const chartData = useMemo(() => {
    const now = new Date();
    const points = [];

    if (period === "12") {
      for (let i = 11; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

        points.push({
          key: `${date.getFullYear()}-${date.getMonth()}`,
          label: date.toLocaleDateString("en-IN", {
            month: "short",
          }),
          start: new Date(date.getFullYear(), date.getMonth(), 1),
          end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
          sales: 0,
        });
      }
    } else {
      const days = Number(period);

      for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        points.push({
          key: date.toISOString().slice(0, 10),
          label:
            period === "7"
              ? date.toLocaleDateString("en-IN", {
                  weekday: "short",
                })
              : date.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                }),
          start: date,
          end: nextDate,
          sales: 0,
        });
      }
    }

    validOrders
      .filter((order) => order.paymentStatus !== "FAILED")
      .forEach((order) => {
        const orderDate = new Date(order.createdAt);

        const point = points.find(
          (item) => orderDate >= item.start && orderDate < item.end,
        );

        if (point) {
          point.sales += Number(order.totalAmount || 0);
        }
      });

    return points;
  }, [validOrders, period]);

  const maxSales = Math.max(1, ...chartData.map((item) => item.sales));

  const chartPoints = chartData
    .map((item, index) => {
      const x =
        chartData.length === 1 ? 50 : (index / (chartData.length - 1)) * 100;

      const y = 90 - (item.sales / maxSales) * 72;

      return `${x},${y}`;
    })
    .join(" ");

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const getStatusClass = (status) => {
    const classes = {
      PENDING: "pending",
      CONFIRMED: "confirmed",
      SHIPPED: "shipped",
      OUT_FOR_DELIVERY: "out",
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
    };

    return classes[status] || "pending";
  };

  const quickActions = [
    {
      icon: "↗",
      title: "Manage orders",
      description: "View and update customer orders",
      path: "/admin/orders",
    },
    {
      icon: "＋",
      title: "Manage products",
      description: "Products, variants and inventory",
      path: "/admin/products",
    },
    {
      icon: "★",
      title: "Read reviews",
      description: "Review customer feedback",
      path: "/admin/reviews",
    },
    {
      icon: "%",
      title: "Offers & coupons",
      description: "Manage store promotions",
      path: "/admin/offers",
    },
    {
      icon: "▤",
      title: "Sales report",
      description: "Open your sales report",
      path: "/admin/sales-report",
    },
  ];

  return (
    <>
    <AdminNavbar />
    <div className="admin-dashboard">
      

      <main className="admin-dashboard-content">
        <header className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">ESSENZA · STORE MANAGEMENT</p>

            <h1>Dashboard</h1>

            <p className="dashboard-subtitle">
              An overview of your fragrance store.
            </p>
          </div>

          <div className="dashboard-live">
            <span />
            ADMIN OVERVIEW
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            <span>{error}</span>

            <button type="button" onClick={() => window.location.reload()}>
              RETRY
            </button>
          </div>
        )}

        <section className="dashboard-stat-grid">
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-top">
              <span>TOTAL SALES</span>
              <span className="dashboard-stat-icon">₹</span>
            </div>

            <strong>{loading ? "—" : formatCurrency(totalSales)}</strong>

            <p>Value of non-cancelled orders</p>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-top">
              <span>TOTAL ORDERS</span>
              <span className="dashboard-stat-icon">▤</span>
            </div>

            <strong>{loading ? "—" : orders.length}</strong>

            <p>All recorded customer orders</p>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-top">
              <span>CUSTOMERS</span>
              <span className="dashboard-stat-icon">♙</span>
            </div>

            <strong>{loading ? "—" : customerCount}</strong>

            <p>Customers who placed orders</p>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-top">
              <span>PRODUCTS SOLD</span>
              <span className="dashboard-stat-icon">◇</span>
            </div>

            <strong>{loading ? "—" : productsSold}</strong>

            <p>Distinct products in orders</p>
          </article>
        </section>

        <section className="dashboard-sales-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Sales overview</h2>
              <p>Order value grouped by order date</p>
            </div>

            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              aria-label="Sales chart period"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="12">Last 12 months</option>
            </select>
          </div>

          <div className="dashboard-chart-summary">
            <span>Recorded sales in this period</span>

            <strong>
              {formatCurrency(
                chartData.reduce((total, item) => total + item.sales, 0),
              )}
            </strong>
          </div>

          <div className="dashboard-chart">
            {loading ? (
              <p className="dashboard-chart-message">Loading sales data...</p>
            ) : chartData.every((item) => item.sales === 0) ? (
              <p className="dashboard-chart-message">
                No sales recorded for this period.
              </p>
            ) : (
              <>
                <div className="dashboard-chart-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <svg
                  className="dashboard-chart-svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Sales trend chart"
                >
                  <defs>
                    <linearGradient
                      id="dashboardSalesFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#c49a51"
                        stopOpacity="0.25"
                      />
                      <stop offset="100%" stopColor="#c49a51" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <polygon
                    points={`0,100 ${chartPoints} 100,100`}
                    fill="url(#dashboardSalesFill)"
                  />

                  <polyline
                    points={chartPoints}
                    fill="none"
                    stroke="#b68a3b"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {chartData.map((item, index) => {
                    const x =
                      chartData.length === 1
                        ? 50
                        : (index / (chartData.length - 1)) * 100;

                    const y = 90 - (item.sales / maxSales) * 72;

                    return (
                      <circle
                        key={item.key}
                        cx={x}
                        cy={y}
                        r="1.4"
                        fill="#ffffff"
                        stroke="#b68a3b"
                        strokeWidth="0.7"
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}
                </svg>

                <div className="dashboard-chart-labels">
                  {chartData.map((item) => (
                    <div key={item.key}>
                      <span>{item.label}</span>
                      <strong>{formatCurrency(item.sales)}</strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="dashboard-lower-grid">
          <div className="dashboard-recent-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Recent orders</h2>
                <p>Your latest customer purchases</p>
              </div>

              <button
                type="button"
                className="dashboard-text-link"
                onClick={() => navigate("/admin/orders")}
              >
                VIEW ALL ↗
              </button>
            </div>

            {loading ? (
              <p className="dashboard-empty">Loading recent orders...</p>
            ) : recentOrders.length === 0 ? (
              <p className="dashboard-empty">No orders have been placed yet.</p>
            ) : (
              <div className="dashboard-table-wrap">
                <table className="dashboard-orders-table">
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>CUSTOMER</th>
                      <th>DATE</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <strong>
                            #{String(order._id).slice(-6).toUpperCase()}
                          </strong>
                        </td>

                        <td>{order.userId?.name || "Customer"}</td>

                        <td>{formatDate(order.createdAt)}</td>

                        <td className="dashboard-order-amount">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td>
                          <span
                            className={`dashboard-status ${getStatusClass(
                              order.orderStatus,
                            )}`}
                          >
                            {String(order.orderStatus || "PENDING").replaceAll(
                              "_",
                              " ",
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="dashboard-side-panels">
            <div className="dashboard-quick-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Quick actions</h2>
                  <p>Store management shortcuts</p>
                </div>
              </div>

              <div className="dashboard-quick-list">
                {quickActions.map((action) => (
                  <button
                    type="button"
                    className="dashboard-quick-action"
                    key={action.title}
                    onClick={() => navigate(action.path)}
                  >
                    <span className="dashboard-quick-icon">{action.icon}</span>

                    <span className="dashboard-quick-copy">
                      <strong>{action.title}</strong>
                      <small>{action.description}</small>
                    </span>

                    <span className="dashboard-quick-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="dashboard-status-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Order status</h2>
                  <p>Current order distribution</p>
                </div>
              </div>

              {[
                ["Pending", statusCounts.PENDING, "pending"],
                ["Confirmed", statusCounts.CONFIRMED, "confirmed"],
                ["Shipped", statusCounts.SHIPPED, "shipped"],
                ["Out for delivery", statusCounts.OUT_FOR_DELIVERY, "out"],
                ["Delivered", statusCounts.DELIVERED, "delivered"],
                ["Cancelled", statusCounts.CANCELLED, "cancelled"],
              ].map(([label, count, className]) => (
                <div className="dashboard-status-row" key={label}>
                  <span className={`dashboard-status-dot ${className}`} />
                  <span>{label}</span>
                  <strong>{loading ? "—" : count}</strong>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <p className="dashboard-footer-note">
          ESSENZA ADMINISTRATION · STORE OVERVIEW
        </p>
      </main>

      
    </div>
    <AdminFooter />
    </>
  );
}

export default AdminDashboard;
