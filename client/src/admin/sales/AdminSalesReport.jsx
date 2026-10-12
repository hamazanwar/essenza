import { useEffect, useState } from "react";
import axios from "axios";

import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";

function AdminSalesReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchReport = async (startDate = from, endDate = to) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        "http://localhost:5000/api/admin/sales-report",
        {
          params: {
            ...(startDate && { from: startDate }),
            ...(endDate && { to: endDate }),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReport(response.data.report);
    } catch (err) {
      console.error("Fetch sales report error:", err);

      setError(
        err.response?.data?.message || "Failed to load the sales report.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport("", "");
  }, []);

  const handleFilter = (event) => {
    event.preventDefault();
    fetchReport(from, to);
  };

  const handleClearFilter = () => {
    setFrom("");
    setTo("");
    fetchReport("", "");
  };

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const downloadCSV = () => {
    if (!report?.orders?.length) {
      setError("There are no orders to export.");
      return;
    }

    const escapeCSV = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = [
      [
        "Order ID",
        "Customer",
        "Email",
        "Order Date",
        "Payment Method",
        "Payment Status",
        "Order Status",
        "Total Amount",
      ],
      ...report.orders.map((order) => [
        order._id,
        order.userId?.name || "Unknown",
        order.userId?.email || "",
        order.createdAt
          ? new Date(order.createdAt).toLocaleDateString("en-IN")
          : "",
        order.paymentMethod || "",
        order.paymentStatus || "",
        order.orderStatus || "",
        order.totalAmount ?? 0,
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "essenza-sales-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-sales-report-page">
      <AdminNavbar />

      <main className="admin-sales-report-content">
        <header className="admin-sales-report-header">
          <div>
            <h1>SALES REPORT</h1>
            <p>Track revenue and review customer orders</p>
          </div>

          <button
            type="button"
            className="admin-sales-export-button"
            onClick={downloadCSV}
          >
            EXPORT CSV
          </button>
        </header>

        <form className="admin-sales-filters" onSubmit={handleFilter}>
          <div className="admin-sales-date-field">
            <label htmlFor="sales-from">FROM DATE</label>
            <input
              id="sales-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>

          <div className="admin-sales-date-field">
            <label htmlFor="sales-to">TO DATE</label>
            <input
              id="sales-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="admin-sales-filter-button"
            disabled={loading}
          >
            APPLY FILTER
          </button>

          <button
            type="button"
            className="admin-sales-clear-button"
            onClick={handleClearFilter}
            disabled={loading}
          >
            CLEAR
          </button>
        </form>

        {error && <p className="admin-sales-error">{error}</p>}

        {loading ? (
          <p className="admin-sales-message">Loading sales report...</p>
        ) : report ? (
          <>
            <section className="admin-sales-summary">
              <article className="admin-sales-summary-card">
                <span>TOTAL SALES</span>
                <strong>{formatCurrency(report.summary.totalSales)}</strong>
                <small>Delivered orders only</small>
              </article>

              <article className="admin-sales-summary-card">
                <span>TOTAL ORDERS</span>
                <strong>{report.summary.totalOrders}</strong>
                <small>Orders in selected period</small>
              </article>

              <article className="admin-sales-summary-card">
                <span>DELIVERED ORDERS</span>
                <strong>{report.summary.deliveredOrders}</strong>
                <small>Successfully delivered</small>
              </article>

              <article className="admin-sales-summary-card">
                <span>AVERAGE ORDER VALUE</span>
                <strong>
                  {formatCurrency(report.summary.averageOrderValue)}
                </strong>
                <small>Delivered orders only</small>
              </article>
            </section>

            <section className="admin-sales-daily-section">
              <div className="admin-sales-section-heading">
                <div>
                  <h2>DAILY SALES</h2>
                  <p>Revenue grouped by order creation date</p>
                </div>
              </div>

              {report.dailySales.length === 0 ? (
                <p className="admin-sales-message">
                  No delivered sales found for this period.
                </p>
              ) : (
                <div className="admin-sales-table-wrapper">
                  <table className="admin-sales-table">
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>DELIVERED ORDERS</th>
                        <th>SALES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.dailySales.map((day) => (
                        <tr key={day.date}>
                          <td>
                            {new Date(
                              `${day.date}T00:00:00`,
                            ).toLocaleDateString("en-IN")}
                          </td>
                          <td>{day.orders}</td>
                          <td>{formatCurrency(day.sales)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-sales-orders-section">
              <div className="admin-sales-section-heading">
                <div>
                  <h2>ORDER DETAILS</h2>
                  <p>All orders within the selected date range</p>
                </div>

                <span>{report.orders.length} orders</span>
              </div>

              {report.orders.length === 0 ? (
                <p className="admin-sales-message">
                  No orders found for this period.
                </p>
              ) : (
                <div className="admin-sales-table-wrapper">
                  <table className="admin-sales-table">
                    <thead>
                      <tr>
                        <th>ORDER ID</th>
                        <th>CUSTOMER</th>
                        <th>DATE</th>
                        <th>PAYMENT</th>
                        <th>STATUS</th>
                        <th>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.orders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-6).toUpperCase()}</td>
                          <td>
                            <strong>{order.userId?.name || "Unknown"}</strong>
                            <small>{order.userId?.email || ""}</small>
                          </td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </td>
                          <td>
                            {order.paymentMethod}
                            <small>{order.paymentStatus}</small>
                          </td>
                          <td>
                            <span
                              className={`admin-sales-status admin-sales-status-${String(
                                order.orderStatus,
                              ).toLowerCase()}`}
                            >
                              {String(order.orderStatus).replaceAll("_", " ")}
                            </span>
                          </td>
                          <td>{formatCurrency(order.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>

      <AdminFooter />
    </div>
  );
}

export default AdminSalesReport;
