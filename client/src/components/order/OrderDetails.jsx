import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { jsPDF } from "jspdf";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const getImageUrl = (image) => {
  if (!image) return "";

  // Cloudinary image URL
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Old local server image path
  const serverUrl = api.defaults.baseURL.replace(/\/api\/?$/, "");

  return `${serverUrl}${image.startsWith("/") ? image : `/${image}`}`;
};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invoicePreview, setInvoicePreview] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get(`/orders/${orderId}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        setOrder(response.data.order);
      } catch (err) {
        console.error("Fetch order details error:", err);

        setError(
          err.response?.data?.message || "Unable to load order details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getShortOrderId = () => {
    return order?._id?.slice(-8).toUpperCase() || "";
  };

  const downloadInvoice = () => {
    if (!order) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const left = 18;
    const right = pageWidth - 18;
    let y = 20;

    const addLine = () => {
      pdf.setDrawColor(210, 210, 210);
      pdf.line(left, y, right, y);
      y += 9;
    };

    const addLabelValue = (label, value) => {
      pdf.setFont("helvetica", "normal");
      pdf.text(label, left, y);

      pdf.setFont("helvetica", "bold");
      pdf.text(String(value), right, y, { align: "right" });

      y += 8;
    };

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("ESSENZA", left, y);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("ORDER INVOICE", right, y, { align: "right" });

    y += 8;
    pdf.setFontSize(9);
    pdf.text("Fragrance. Refined.", left, y);

    y += 8;
    addLine();

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Invoice Details", left, y);
    y += 9;

    pdf.setFontSize(10);
    addLabelValue("Order ID", `#${getShortOrderId()}`);
    addLabelValue("Order Date", formatDate(order.createdAt));
    addLabelValue("Order Status", order.orderStatus);
    addLabelValue("Payment Method", order.paymentMethod);
    addLabelValue("Payment Status", order.paymentStatus);
    addLabelValue("Payment ID", order.paymentId || "Not available");

    addLine();

    pdf.setFont("helvetica", "bold");
    pdf.text("Delivery Address", left, y);
    y += 8;

    pdf.setFont("helvetica", "normal");

   const address = order.deliveryAddress || order.addressId || {};

const addressLines = [
  address.fullName,
  address.phoneNumber
    ? `Phone: ${address.phoneNumber}`
    : "Phone: Not provided",
  address.address,
  [address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", "),
].filter(Boolean);
    if (addressLines.length === 0) {
      addressLines.push("Address information unavailable");
    }

    addressLines.forEach((line) => {
      const wrapped = pdf.splitTextToSize(String(line), pageWidth - 36);
      pdf.text(wrapped, left, y);
      y += wrapped.length * 5;
    });

    y += 5;
    addLine();

    pdf.setFont("helvetica", "bold");
    pdf.text("Items Ordered", left, y);
    y += 9;

    const descriptionX = left;
    const quantityX = 130;
    const priceX = right;

    pdf.setFontSize(9);
    pdf.text("Product", descriptionX, y);
    pdf.text("Qty", quantityX, y, { align: "right" });
    pdf.text("Amount", priceX, y, { align: "right" });

    y += 5;
    addLine();

    pdf.setFont("helvetica", "normal");

    (order.items || []).forEach((item) => {
      if (y > 260) {
        pdf.addPage();
        y = 20;
      }

      const productDescription = `${item.productName || "Product"} (${item.size || "N/A"})`;

      const productLines = pdf.splitTextToSize(productDescription, 95);

      pdf.text(productLines, descriptionX, y);
      pdf.text(String(item.quantity || 0), quantityX, y, {
        align: "right",
      });
      pdf.text(formatAmount(item.totalPrice), priceX, y, {
        align: "right",
      });

      y += Math.max(productLines.length * 5, 8);
    });

    y += 5;

    if (y > 260) {
      pdf.addPage();
      y = 20;
    }

    addLine();
    pdf.setFontSize(10);

    addLabelValue("Original Subtotal", formatAmount(originalSubtotal));

if (offerDiscount > 0) {
  addLabelValue("Offer Discount", `-${formatAmount(offerDiscount)}`);
}

if (couponDiscount > 0) {
  const couponLabel = order.couponCode
    ? `Coupon Discount (${order.couponCode})`
    : "Coupon Discount";

  addLabelValue(couponLabel, `-${formatAmount(couponDiscount)}`);
}

addLabelValue("Delivery Charge", formatAmount(deliveryCharge));

y += 2;
pdf.setFontSize(13);
addLabelValue("TOTAL", formatAmount(totalAmount));

    y += 10;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("Thank you for shopping with ESSENZA.", pageWidth / 2, y, {
      align: "center",
    });

    pdf.save(`ESSENZA-Invoice-${getShortOrderId()}.pdf`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="order-details-page">
          <p className="order-details-message">Loading order details...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="order-details-page">
          <div className="order-details-error">
            <h2>ORDER NOT FOUND</h2>
            <p>{error || "We couldn't find this order."}</p>
            <button type="button" onClick={() => navigate("/my-orders")}>
              BACK TO MY ORDERS
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const address = order.deliveryAddress || order.addressId || {};

  // Calculate invoice amounts from the saved order items
const originalSubtotal = (order.items || []).reduce(
  (sum, item) =>
    sum + Number(item.originalPrice ?? item.price ?? 0) * Number(item.quantity || 0),
  0
);

const offerDiscount = (order.items || []).reduce(
  (sum, item) =>
    sum + Number(item.discountAmount || 0) * Number(item.quantity || 0),
  0
);

const subtotal = Number(order.subtotal || 0);
const couponDiscount = Number(order.couponDiscount || 0);
const deliveryCharge = Number(order.deliveryCharge || 0);
const totalAmount = Number(order.totalAmount || 0);

  
const orderStages = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "OUT FOR DELIVERY",
  "DELIVERED",
];

const currentStatus = String(order.orderStatus || "")
  .toUpperCase()
  .replaceAll("_", " ");

const currentStageIndex = orderStages.indexOf(currentStatus);


  return (
    <>
      <Navbar />

      <main className="order-details-page">
        <div className="order-details-container">
          <button
            type="button"
            className="order-details-back"
            onClick={() => navigate("/my-orders")}
          >
            ← BACK TO MY ORDERS
          </button>

          <header className="order-details-heading">
            <div>
              <p className="order-details-eyebrow">ESSENZA ORDERS</p>
              <h1>ORDER DETAILS</h1>
              <p>Order #{getShortOrderId()}</p>
            </div>

            <span
              className={`order-details-status ${String(
                order.orderStatus,
              ).toLowerCase()}`}
            >
              {order.orderStatus}
            </span>
          </header>

          
<section className="order-tracking">
  <h2>ORDER TRACKING</h2>

  {currentStatus === "CANCELLED" ? (
    <p className="order-tracking-cancelled">
      This order has been cancelled.
    </p>
  ) : (
    <div className="order-tracking-timeline">
      {orderStages.map((stage, index) => {
        const completed = index <= currentStageIndex;

        return (
          <div className="order-tracking-step" key={stage}>
            <div className="order-tracking-step-top">
              <div
                className={`order-tracking-bubble ${
                  completed ? "completed" : ""
                }`}
              >
                {index < currentStageIndex ? "✓" : index + 1}
              </div>

              {index < orderStages.length - 1 && (
                <div
                  className={`order-tracking-line ${
                    index < currentStageIndex ? "completed" : ""
                  }`}
                />
              )}
            </div>

            <span
              className={`order-tracking-label ${
                completed ? "completed" : ""
              }`}
            >
              {stage}
            </span>
          </div>
        );
      })}
    </div>
  )}
</section>


          <section className="order-details-card">
            <h2>ORDER INFORMATION</h2>

            <div className="order-details-grid">
              <div>
                <span>ORDER DATE</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>

              <div>
                <span>PAYMENT METHOD</span>
                <strong>
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </strong>
              </div>

              <div>
                <span>PAYMENT STATUS</span>
                <strong>{order.paymentStatus}</strong>
              </div>

              <div>
                <span>PAYMENT ID</span>
                <strong>{order.paymentId || "Not available"}</strong>
              </div>
            </div>
          </section>

          <section className="order-details-card">
            <h2>ITEMS ORDERED</h2>

            <div className="order-details-items">
              {(order.items || []).map((item, index) => (
                <div
                  className="order-details-item"
                  key={`${item.variantId || item.productId || "item"}-${index}`}
                >
                  <div className="order-details-image">
                    {item.productImage ? (
                      <img
  src={getImageUrl(item.productImage)}
  alt={item.productName}
/>
                    ) : (
                      <span>No image</span>
                    )}
                  </div>

                  <div className="order-details-product">
                    <h3>{item.productName}</h3>
                    <p>Size: {item.size || "N/A"}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>

                  <strong>{formatAmount(item.totalPrice)}</strong>
                </div>
              ))}
            </div>
          </section>

          <div className="order-details-two-column">
            <section className="order-details-card">
              <h2>DELIVERY ADDRESS</h2>

             <div className="order-details-address">
  <strong>{address.fullName || "Customer"}</strong>

  <p>{address.phoneNumber || "Phone number not provided"}</p>

  <p>{address.address || "Address unavailable"}</p>

  <p>
    {[address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(", ")}
  </p>
</div>
            </section>

            <section className="order-details-card">
  <h2>ORDER SUMMARY</h2>

  <div className="order-summary-row">
    <span>Original Subtotal</span>
    <span>{formatAmount(originalSubtotal)}</span>
  </div>

  {offerDiscount > 0 && (
    <div className="order-summary-row">
      <span>Offer Discount</span>
      <span>-{formatAmount(offerDiscount)}</span>
    </div>
  )}

  {couponDiscount > 0 && (
    <div className="order-summary-row">
      <span>
        Coupon Discount
        {order.couponCode ? ` (${order.couponCode})` : ""}
      </span>
      <span>-{formatAmount(couponDiscount)}</span>
    </div>
  )}

  <div className="order-summary-row">
    <span>Delivery Charge</span>
    <span>{formatAmount(deliveryCharge)}</span>
  </div>

  <div className="order-summary-row order-summary-total">
    <strong>Total</strong>
    <strong>{formatAmount(totalAmount)}</strong>
  </div>
</section>
          </div>

          <section className="order-details-invoice">
            <div>
              <h2>YOUR INVOICE</h2>
              <p>View the invoice or download a PDF copy for your records.</p>
            </div>

            <div className="order-invoice-actions">
              <button
                type="button"
                className="order-invoice-preview-button"
                onClick={() => setInvoicePreview((previous) => !previous)}
              >
                {invoicePreview ? "HIDE INVOICE" : "VIEW INVOICE"}
              </button>

              <button
                type="button"
                className="order-invoice-download-button"
                onClick={downloadInvoice}
              >
                DOWNLOAD INVOICE PDF ↓
              </button>
            </div>
          </section>

          {invoicePreview && (
            <section className="order-invoice-preview">
              <div className="order-invoice-preview-header">
                <div>
                  <h2>ESSENZA</h2>
                  <p>ORDER INVOICE</p>
                </div>

                <div>
                  <span>INVOICE FOR</span>
                  <strong>#{getShortOrderId()}</strong>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
              </div>

              <div className="order-invoice-preview-address">
  <h3>DELIVERY ADDRESS</h3>

  <strong>{address.fullName || "Customer"}</strong>

  <p>{address.phoneNumber || "Phone number not provided"}</p>

  <p>{address.address || "Address unavailable"}</p>

  <p>
    {[address.city, address.state, address.pincode]
      .filter(Boolean)
      .join(", ")}
  </p>
</div>

              <div className="order-invoice-preview-items">
                {(order.items || []).map((item, index) => (
                  <div
                    className="order-invoice-preview-item"
                    key={`${item.variantId || item.productId || "invoice"}-${index}`}
                  >
                    <span>
                      {item.productName} — {item.size || "N/A"} ×{" "}
                      {item.quantity}
                    </span>
                   <strong>
  {formatAmount(
    Number(item.originalPrice ?? item.price ?? 0) *
      Number(item.quantity || 0)
  )}
</strong>
                  </div>
                ))}
              </div>

          <div className="order-invoice-preview-breakdown">
  <div>
    <span>Original Subtotal</span>
    <span>{formatAmount(originalSubtotal)}</span>
  </div>

  {offerDiscount > 0 && (
    <div>
      <span>Offer Discount</span>
      <span>-{formatAmount(offerDiscount)}</span>
    </div>
  )}

  {couponDiscount > 0 && (
    <div>
      <span>
        Coupon Discount
        {order.couponCode ? ` (${order.couponCode})` : ""}
      </span>
      <span>-{formatAmount(couponDiscount)}</span>
    </div>
  )}

  <div>
    <span>Delivery Charge</span>
    <span>{formatAmount(deliveryCharge)}</span>
  </div>
</div>

<div className="order-invoice-preview-total">
  <span>Total</span>
  <strong>{formatAmount(totalAmount)}</strong>
</div>

              <p className="order-invoice-thank-you">
                Thank you for shopping with ESSENZA.
              </p>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default OrderDetails;
