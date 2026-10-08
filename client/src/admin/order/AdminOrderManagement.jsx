import { useEffect, useState } from "react";
import AdminFooter from "../bars/AdminFooter";
import AdminNavbar from "../bars/AdminNavbar";
import axios from "axios";

function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusConfirmation, setStatusConfirmation] = useState(null);
const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        "http://localhost:5000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data.orders);
    } catch (error) {
      console.error("Order fetch error:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
  setStatusConfirmation({
    orderId,
    newStatus,
  });
};

const confirmStatusChange = async () => {
  if (!statusConfirmation) {
    return;
  }

  try {
    setUpdatingStatus(true);

    const token = localStorage.getItem("adminToken");

    const response = await axios.patch(
      `http://localhost:5000/api/admin/orders/${statusConfirmation.orderId}/status`,
      {
        orderStatus: statusConfirmation.newStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedOrder = response.data.order;

    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order._id === statusConfirmation.orderId
          ? {
              ...order,
              ...updatedOrder,
            }
          : order
      )
    );

    setStatusConfirmation(null);
  } catch (error) {
    console.error("Order status update error:", error);

    setError(
      error.response?.data?.message ||
        "Failed to update order status."
    );
  } finally {
    setUpdatingStatus(false);
  }
};

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "admin-order-status-pending";

      case "CONFIRMED":
        return "admin-order-status-confirmed";

      case "SHIPPED":
        return "admin-order-status-shipped";

      case "OUT_FOR_DELIVERY":
        return "admin-order-status-out";

      case "DELIVERED":
        return "admin-order-status-delivered";

      case "CANCELLED":
        return "admin-order-status-cancelled";

      default:
        return "";
    }
  };

  return (
    <div className="admin-order-management-page">
      <AdminNavbar />

      <main className="admin-order-management-content">
        <h1>ORDER MANAGEMENT</h1>

        <p className="admin-order-management-subtitle">
          Manage customer orders and update order status
        </p>

        {loading && (
          <p>Loading orders...</p>
        )}

        {error && (
          <p className="admin-order-error">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="admin-order-table-container">
            <table className="admin-order-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>PRODUCT</th>
                  <th>ADDRESS</th>
                  <th>PAYMENT</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="admin-no-orders"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id}>
                      {/* ORDER ID */}
                      <td>
                        <span className="admin-order-id">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>

                        <small>
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString()}
                        </small>
                      </td>

                      {/* CUSTOMER */}
                      <td>
                        <strong>
                          {order.userId?.name || "Unknown"}
                        </strong>

                        <small>
                          {order.userId?.email || ""}
                        </small>
                      </td>

                      {/* PRODUCT */}
                      <td>
                        <div className="admin-order-products">
                          {order.items.map((item) => (
                            <div
                              className="admin-order-product"
                              key={item.variantId}
                            >
                              {item.productImage && (
                                <img
                                  src={`http://localhost:5000${item.productImage}`}
                                  alt={item.productName}
                                />
                              )}

                              <div>
                                <strong>
                                  {item.productName}
                                </strong>

                                <small>
                                  {item.size} × {item.quantity}
                                </small>

                                <small>
                                  ₹{item.price}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* ADDRESS */}
                      <td>
                        {order.addressId ? (
                          <div className="admin-order-address">
                            <strong>
                              {order.addressId.fullName}
                            </strong>

                            <span>
                              {order.addressId.address}
                            </span>

                            <span>
                              {order.addressId.city},{" "}
                              {order.addressId.state}
                            </span>

                            <span>
                              {order.addressId.pincode}
                            </span>
                          </div>
                        ) : (
                          "Address unavailable"
                        )}
                      </td>

                      {/* PAYMENT */}
                      <td>
                        <strong>
                          {order.paymentMethod}
                        </strong>

                        <small>
                          {order.paymentStatus}
                        </small>
                      </td>

                      {/* TOTAL */}
                      <td>
                        <strong>
                          ₹{order.totalAmount}
                        </strong>
                      </td>

                      {/* STATUS */}
                      <td>
                        <select
                          className={`admin-order-status-select ${getStatusClass(
                            order.orderStatus
                          )}`}
                          value={order.orderStatus}
                          onChange={(event) =>
                            handleStatusChange(
                              order._id,
                              event.target.value
                            )
                          }
                          disabled={
                            order.orderStatus ===
                              "CANCELLED" ||
                            order.orderStatus ===
                              "DELIVERED"
                          }
                        >
                          <option value="PENDING">
                            PENDING
                          </option>

                          <option value="CONFIRMED">
                            CONFIRMED
                          </option>

                          <option value="SHIPPED">
                            SHIPPED
                          </option>

                          <option value="OUT_FOR_DELIVERY">
                            OUT FOR DELIVERY
                          </option>

                          <option value="DELIVERED">
                            DELIVERED
                          </option>

                          <option value="CANCELLED">
                            CANCELLED
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {statusConfirmation && (
  <div className="admin-order-confirmation-overlay">
    <div className="admin-order-confirmation-box">

      <h2>CONFIRM STATUS CHANGE</h2>

      <p>
        Are you sure you want to change this order status to:
      </p>

      <strong>
        {statusConfirmation.newStatus.replaceAll("_", " ")}
      </strong>

      <div className="admin-order-confirmation-actions">

        <button
          type="button"
          className="admin-order-confirmation-cancel"
          onClick={() => setStatusConfirmation(null)}
          disabled={updatingStatus}
        >
          CANCEL
        </button>

        <button
          type="button"
          className="admin-order-confirmation-confirm"
          onClick={confirmStatusChange}
          disabled={updatingStatus}
        >
          {updatingStatus ? "UPDATING..." : "CONFIRM"}
        </button>

      </div>

    </div>
  </div>
)}

      <AdminFooter />
    </div>
  );
}

export default AdminOrderManagement;