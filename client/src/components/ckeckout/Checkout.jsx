import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const productId = searchParams.get("productId");
  const buyNowData = location.state;

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH CHECKOUT ITEMS
  // ==========================================

  useEffect(() => {
    const fetchCheckoutItems = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        setLoading(true);
        setError("");

        // BUY NOW
        if (productId || buyNowData?.productId) {
  const selectedProductId =
    buyNowData?.productId || productId;

  const response = await axios.get(
    `http://localhost:5000/api/products/${selectedProductId}`
  );

  const product = response.data.product;

  if (!product) {
    setError("Product not found.");
    return;
  }

  if (!product.variants?.length) {
    setError("No variant available for this product.");
    return;
  }

  const variant =
    product.variants.find(
      (item) => item._id === buyNowData?.variantId
    ) || product.variants[0];

  const selectedQuantity =
    buyNowData?.quantity || 1;

  if (variant.stock <= 0) {
    setError("This product is out of stock.");
    return;
  }

  if (selectedQuantity > variant.stock) {
    setError(
      `Only ${variant.stock} items are available.`
    );
    return;
  }

  setCheckoutItems([
    {
      productId: product._id,
      productName: product.name,
      productImage: product.productImage?.[0] || "",
      variantId: variant._id,
      size: variant.size,
      price: variant.price,
      quantity: selectedQuantity,
    },
  ]);

  return;
}

        // CART CHECKOUT
        const response = await axios.get(
          "http://localhost:5000/api/cart",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const cartItems = response.data.cart?.items || [];

        if (cartItems.length === 0) {
          setError("Your cart is empty.");
          return;
        }

        const formattedItems = cartItems.map((item) => ({
          productId: item.productId?._id,
          productName: item.productId?.name,
          productImage: item.productId?.productImage?.[0] || "",
          variantId: item.variantId?._id,
          size: item.variantId?.size,
          price: item.variantId?.price || 0,
          quantity: item.quantity,
        }));

        setCheckoutItems(formattedItems);
      } catch (error) {
        console.error("Fetch checkout items error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load checkout details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutItems();
  }, [
  productId,
  navigate,
  buyNowData?.productId,
  buyNowData?.variantId,
  buyNowData?.quantity,
]);

  // ==========================================
  // FETCH ADDRESSES
  // ==========================================

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        setAddressLoading(true);

        const response = await axios.get(
          "http://localhost:5000/api/users/addresses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userAddresses = response.data.addresses || [];

        setAddresses(userAddresses);

        // Select default address automatically
        const defaultAddress = userAddresses.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (userAddresses.length > 0) {
          setSelectedAddressId(userAddresses[0]._id);
        }
      } catch (error) {
        console.error("Fetch addresses error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load addresses."
        );
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, [navigate]);

  // ==========================================
  // PRICE CALCULATIONS
  // ==========================================

  const subtotal = checkoutItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryCharge = 0;

  const total = subtotal + deliveryCharge;

  // ==========================================
  // PROCEED TO PAYMENT
  // ==========================================

  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address.");
      return;
    }

    setError("");

    console.log("Selected address:", selectedAddressId);
    console.log("Checkout items:", checkoutItems);
    console.log("Total:", total);

    // Payment will be implemented next.
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading || addressLoading) {
    return (
      <>
        <Navbar />

        <main className="checkout-page">
          <div className="checkout-message">
            Loading checkout...
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && checkoutItems.length === 0) {
    return (
      <>
        <Navbar />

        <main className="checkout-page">
          <div className="checkout-message error">
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

      <main className="checkout-page">
        <div className="checkout-container">

          <h1>CHECKOUT</h1>

          {error && (
            <p className="checkout-error-message">
              {error}
            </p>
          )}

          {/* ==========================================
              DELIVERY ADDRESS
          ========================================== */}

          <section className="checkout-section">

            <div className="checkout-section-header">
              <h2>DELIVERY ADDRESS</h2>

              <button
                type="button"
                className="checkout-add-address-button"
                onClick={() => navigate("/profile")}
              >
                + ADD ADDRESS
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="checkout-no-address">
                <p>
                  No delivery address found.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                >
                  ADD ADDRESS
                </button>
              </div>
            ) : (
              <div className="checkout-address-list">

                {addresses.map((address) => (
                  <label
                    key={address._id}
                    className={`checkout-address-card ${
                      selectedAddressId === address._id
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="checkout-address"
                      value={address._id}
                      checked={
                        selectedAddressId === address._id
                      }
                      onChange={() =>
                        setSelectedAddressId(address._id)
                      }
                    />

                    <div className="checkout-address-content">

                      <div className="checkout-address-top">

                        <strong>
                          {address.fullName}
                        </strong>

                        {address.isDefault && (
                          <span className="checkout-default-label">
                            DEFAULT
                          </span>
                        )}

                      </div>

                      <p>{address.address}</p>

                      <p>
                        {address.city},{" "}
                        {address.state} -{" "}
                        {address.pincode}
                      </p>

                    </div>

                  </label>
                ))}

              </div>
            )}

          </section>

          {/* ==========================================
              ORDER SUMMARY
          ========================================== */}

          <section className="checkout-section">

            <h2>ORDER SUMMARY</h2>

            <div className="checkout-items">

              {checkoutItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="checkout-item"
                >

                  <div className="checkout-item-image">

                    {item.productImage ? (
                      <img
                        src={`http://localhost:5000${item.productImage}`}
                        alt={item.productName}
                      />
                    ) : (
                      <div>No Image</div>
                    )}

                  </div>

                  <div className="checkout-item-details">

                    <h3>{item.productName}</h3>

                    <p>
                      Size: {item.size}
                    </p>

                    <p>
                      Quantity: {item.quantity}
                    </p>

                  </div>

                  <div className="checkout-item-price">

                    ₹{item.price * item.quantity}

                  </div>

                </div>
              ))}

            </div>

          </section>

          {/* ==========================================
              PRICE SUMMARY
          ========================================== */}

          <section className="checkout-summary">

            <h2>PRICE SUMMARY</h2>

            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="checkout-summary-row">
              <span>Delivery</span>
              <span>
                {deliveryCharge === 0
                  ? "FREE"
                  : `₹${deliveryCharge}`}
              </span>
            </div>

            <div className="checkout-summary-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              type="button"
              className="checkout-payment-button"
              onClick={handleProceedToPayment}
            >
              PROCEED TO PAYMENT
            </button>

          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;