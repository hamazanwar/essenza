import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import api from "../../services/api";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

// Handle Cloudinary URLs and legacy local image paths
const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const serverUrl = api.defaults.baseURL.replace(/\/api\/?$/, "");

  return `${serverUrl}${image.startsWith("/") ? image : `/${image}`}`;
};

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

  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);

const [newAddress, setNewAddress] = useState({
  fullName: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
});

const [addressSaving, setAddressSaving] = useState(false);
const [addressFormError, setAddressFormError] = useState("");

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
          const selectedProductId = buyNowData?.productId || productId;

          const response = await api.get(`/products/${selectedProductId}`);

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
              (item) => item._id === buyNowData?.variantId,
            ) || product.variants[0];

          const selectedQuantity = buyNowData?.quantity || 1;

          if (variant.stock <= 0) {
            setError("This product is out of stock.");
            return;
          }

          if (selectedQuantity > variant.stock) {
            setError(`Only ${variant.stock} items are available.`);
            return;
          }

         const offerResponse = await api.get("/admin/offers/active");

          const activeOffers = offerResponse.data.offers || [];

          const applicableOffers = activeOffers.filter((offer) => {
            const productMatches = offer.applicableProducts?.some(
              (item) => String(item._id || item) === String(product._id),
            );

            const categoryMatches = offer.applicableCategories?.some(
              (item) =>
                String(item._id || item) ===
                String(product.categoryId?._id || product.categoryId),
            );

            return productMatches || categoryMatches;
          });

          const bestOffer = applicableOffers.reduce((best, offer) => {
            const discountedPrice =
              offer.discountType === "PERCENTAGE"
                ? variant.price * (1 - offer.discountValue / 100)
                : Math.max(0, variant.price - offer.discountValue);

            return !best || discountedPrice < best.discountedPrice
              ? { offer, discountedPrice }
              : best;
          }, null);

          const discountedPrice = bestOffer
            ? Math.round(bestOffer.discountedPrice * 100) / 100
            : variant.price;

          setCheckoutItems([
            {
              productId: product._id,
              productName: product.name,
              productImage: product.productImage?.[0] || "",
              variantId: variant._id,
              size: variant.size,
              price: variant.price,
              originalPrice: variant.price,
              discountedPrice,
              discountAmount:
                Math.round((variant.price - discountedPrice) * 100) / 100,
              offerName: bestOffer?.offer.name || null,
              discountType: bestOffer?.offer.discountType || null,
              discountValue: bestOffer?.offer.discountValue || 0,
              quantity: selectedQuantity,
            },
          ]);

          return;
        }

        // CART CHECKOUT
        const response = await api.get("/cart", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

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
          originalPrice: item.originalPrice ?? item.variantId?.price ?? 0,
          discountedPrice: item.discountedPrice ?? item.variantId?.price ?? 0,
          discountAmount: item.discountAmount ?? 0,
          offerName: item.offerName ?? null,
          discountType: item.discountType ?? null,
          discountValue: item.discountValue ?? 0,
          quantity: item.quantity,
        }));

        setCheckoutItems(formattedItems);
      } catch (error) {
        console.error("Fetch checkout items error:", error);

        setError(
          error.response?.data?.message || "Failed to load checkout details.",
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

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get("/coupons");

        setCoupons(response.data.coupons || []);
      } catch (error) {
        console.error(
          "Fetch coupons error:",
          error.response?.data || error.message,
        );
      }
    };

    fetchCoupons();
  }, []);

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

        const response = await api.get("/users/addresses", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        const userAddresses = response.data.addresses || [];

        setAddresses(userAddresses);

        // Select default address automatically
        const defaultAddress = userAddresses.find(
          (address) => address.isDefault,
        );

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        } else if (userAddresses.length > 0) {
          setSelectedAddressId(userAddresses[0]._id);
        }
      } catch (error) {
        console.error("Fetch addresses error:", error);

        setError(error.response?.data?.message || "Failed to load addresses.");
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, [navigate]);

  const handleOpenAddressForm = () => {
  setNewAddress({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  setAddressFormError("");
  setShowAddressForm(true);
};

const handleCancelAddressForm = () => {
  setShowAddressForm(false);
  setAddressFormError("");
};

const handleSaveCheckoutAddress = async (event) => {
  event.preventDefault();

  try {
    setAddressSaving(true);
    setAddressFormError("");

    const token = localStorage.getItem("token");

    const response = await api.post(
      "/users/address",
      newAddress,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const savedAddress = response.data.address;

    if (!savedAddress?._id) {
      throw new Error("Address was saved, but its details were not returned.");
    }

    setAddresses((previousAddresses) => [
      ...previousAddresses,
      savedAddress,
    ]);

    // Automatically select the newly saved address.
    setSelectedAddressId(savedAddress._id);

    setShowAddressForm(false);

    setNewAddress({
      fullName: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
  } catch (error) {
    console.error("Save checkout address error:", error);

    setAddressFormError(
      error.response?.data?.message ||
        error.message ||
        "Unable to save address. Please try again.",
    );
  } finally {
    setAddressSaving(false);
  }
};

  // PRICE CALCULATIONS

const originalSubtotal = checkoutItems.reduce(
  (total, item) =>
    total + (item.originalPrice ?? item.price) * item.quantity,
  0,
);

const subtotal = Math.round(originalSubtotal * 100) / 100;

const discountedSubtotal = checkoutItems.reduce(
  (total, item) =>
    total + (item.discountedPrice ?? item.price) * item.quantity,
  0,
);

const totalDiscount =
  Math.round((subtotal - discountedSubtotal) * 100) / 100;

const deliveryCharge = 0;

const total =
  Math.round((discountedSubtotal - couponDiscount + deliveryCharge) * 100) /
  100;

  const handleApplyCoupon = (coupon) => {
    const now = new Date();
    const orderSubtotal = Math.round(subtotal * 100) / 100;

    if (
      !coupon.isActive ||
      new Date(coupon.startDate) > now ||
      new Date(coupon.expiryDate) <= now
    ) {
      setCouponMessage("This coupon is expired or unavailable.");
      return;
    }

    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      setCouponMessage("This coupon has reached its usage limit.");
      return;
    }

    if (orderSubtotal < coupon.minOrderAmount) {
      setCouponMessage(
        `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}.`,
      );
      return;
    }

    let discount =
      coupon.discountType === "PERCENTAGE"
        ? (orderSubtotal * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    discount = Math.round(Math.min(discount, orderSubtotal) * 100) / 100;

    setAppliedCoupon(coupon);
    setCouponCode(coupon.code);
    setCouponDiscount(discount);
    setCouponMessage(`Coupon ${coupon.code} applied successfully.`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponDiscount(0);
    setCouponMessage("");
  };

  // ==========================================
  // PROCEED TO PAYMENT
  // ==========================================

  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address.");
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address._id === selectedAddressId,
    );

    if (!selectedAddress) {
      setError("Selected address not found.");
      return;
    }

    setError("");

    navigate("/payment", {
      state: {
        checkoutItems,
        selectedAddress,
        subtotal,
        deliveryCharge,
        total,
        appliedCoupon,
        couponDiscount,
      },
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading || addressLoading) {
    return (
      <>
        <Navbar />

        <main className="checkout-page">
          <div className="checkout-message">Loading checkout...</div>
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
          <div className="checkout-message error">{error}</div>
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

          {error && <p className="checkout-error-message">{error}</p>}

          {/* ==========================================
              DELIVERY ADDRESS
          ========================================== */}

          <section className="checkout-section">
  <div className="checkout-section-header">
    <h2>DELIVERY ADDRESS</h2>

    {!showAddressForm && (
      <button
        type="button"
        className="checkout-add-address-button"
        onClick={handleOpenAddressForm}
      >
        + ADD ADDRESS
      </button>
    )}
  </div>

  {showAddressForm && (
    <form
      className="checkout-address-form"
      onSubmit={handleSaveCheckoutAddress}
    >
      <h3>ADD NEW ADDRESS</h3>

      {addressFormError && (
        <p className="checkout-error-message">
          {addressFormError}
        </p>
      )}

      <label htmlFor="checkout-fullName">FULL NAME</label>
      <input
        id="checkout-fullName"
        type="text"
        value={newAddress.fullName}
        onChange={(event) =>
          setNewAddress({
            ...newAddress,
            fullName: event.target.value,
          })
        }
        placeholder="Your name"
        required
      />

      <label htmlFor="checkout-address">ADDRESS</label>
      <input
        id="checkout-address"
        type="text"
        value={newAddress.address}
        onChange={(event) =>
          setNewAddress({
            ...newAddress,
            address: event.target.value,
          })
        }
        placeholder="House / Street / Area"
        required
      />

      <label htmlFor="checkout-city">CITY</label>
      <input
        id="checkout-city"
        type="text"
        value={newAddress.city}
        onChange={(event) =>
          setNewAddress({
            ...newAddress,
            city: event.target.value,
          })
        }
        placeholder="City"
        required
      />

      <label htmlFor="checkout-state">STATE</label>
      <input
        id="checkout-state"
        type="text"
        value={newAddress.state}
        onChange={(event) =>
          setNewAddress({
            ...newAddress,
            state: event.target.value,
          })
        }
        placeholder="State"
        required
      />

      <label htmlFor="checkout-pincode">PINCODE</label>
      <input
        id="checkout-pincode"
        type="text"
        value={newAddress.pincode}
        onChange={(event) =>
          setNewAddress({
            ...newAddress,
            pincode: event.target.value,
          })
        }
        placeholder="Pincode"
        required
      />

      <div className="checkout-address-form-actions">
        <button type="submit" disabled={addressSaving}>
          {addressSaving ? "SAVING..." : "SAVE ADDRESS"}
        </button>

        <button
          type="button"
          onClick={handleCancelAddressForm}
          disabled={addressSaving}
        >
          CANCEL
        </button>
      </div>
    </form>
  )}

  {!showAddressForm && addresses.length === 0 && (
    <div className="checkout-no-address">
      <p>No delivery address found.</p>

      <button type="button" onClick={handleOpenAddressForm}>
        ADD ADDRESS
      </button>
    </div>
  )}

  {!showAddressForm && addresses.length > 0 && (
    <div className="checkout-address-list">
      {addresses.map((address) => (
        <label
          key={address._id}
          className={`checkout-address-card ${
            selectedAddressId === address._id ? "selected" : ""
          }`}
        >
          <input
            type="radio"
            name="checkout-address"
            value={address._id}
            checked={selectedAddressId === address._id}
            onChange={() => setSelectedAddressId(address._id)}
          />

          <div className="checkout-address-content">
            <div className="checkout-address-top">
              <strong>{address.fullName}</strong>

              {address.isDefault && (
                <span className="checkout-default-label">
                  DEFAULT
                </span>
              )}
            </div>

            <p>{address.address}</p>

            <p>
              {address.city}, {address.state} - {address.pincode}
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
  src={getImageUrl(item.productImage)}
  alt={item.productName}
/>
                    ) : (
                      <div>No Image</div>
                    )}
                  </div>

                  <div className="checkout-item-details">
                    <h3>{item.productName}</h3>

                    <p>Size: {item.size}</p>

                    <p>Quantity: {item.quantity}</p>
                  </div>

                  <div className="checkout-item-price">
                    {item.discountAmount > 0 ? (
                      <>
                        <p className="checkout-original-price">
                          ₹{(item.originalPrice * item.quantity).toFixed(2)}
                        </p>

                        <p className="checkout-discounted-price">
                          ₹{(item.discountedPrice * item.quantity).toFixed(2)}
                        </p>

                        <p className="checkout-offer-badge">
                          {item.discountType === "PERCENTAGE"
                            ? `${item.discountValue}% OFF`
                            : `₹${item.discountValue} OFF`}
                        </p>

                        {item.offerName && (
                          <p className="checkout-offer-name">
                            {item.offerName}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="checkout-section checkout-coupons">
            <h2>AVAILABLE COUPONS</h2>

            {coupons.length === 0 ? (
              <p>No coupons are currently available.</p>
            ) : (
              <div className="checkout-coupon-list">
                {coupons.map((coupon) => (
                  <div className="checkout-coupon-card" key={coupon._id}>
                    <div>
                      <strong>{coupon.code}</strong>
                      <p>{coupon.description}</p>

                      <p>
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                      </p>

                      {coupon.minOrderAmount > 0 && (
                        <p>Minimum order: ₹{coupon.minOrderAmount}</p>
                      )}

                      {coupon.maxDiscount != null && (
                        <p>Maximum discount: ₹{coupon.maxDiscount}</p>
                      )}

                      <p>
                        Valid until:{" "}
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(coupon)}
                      disabled={appliedCoupon?._id === coupon._id}
                    >
                      {appliedCoupon?._id === coupon._id ? "APPLIED" : "APPLY"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="checkout-coupon-input">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(event) =>
                  setCouponCode(event.target.value.toUpperCase())
                }
              />

              <button
                type="button"
                onClick={() => {
                  const coupon = coupons.find(
                    (item) => item.code === couponCode.trim().toUpperCase(),
                  );

                  if (!coupon) {
                    setCouponMessage("Invalid coupon code.");
                    return;
                  }

                  handleApplyCoupon(coupon);
                }}
              >
                APPLY CODE
              </button>

              {appliedCoupon && (
                <button type="button" onClick={handleRemoveCoupon}>
                  REMOVE COUPON
                </button>
              )}
            </div>

            {couponMessage && (
              <p className="checkout-coupon-message">{couponMessage}</p>
            )}
          </section>

          {/* ==========================================
              PRICE SUMMARY
          ========================================== */}

          <section className="checkout-summary">
            <h2>PRICE SUMMARY</h2>

            <div className="checkout-summary-row">
             <span>Subtotal</span>
<span>₹{subtotal.toFixed(2)}</span>
            </div>

            {totalDiscount > 0 && (
              <div className="checkout-summary-row checkout-discount-row">
                <span>Offer Discount</span>
                <span>-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="checkout-summary-row checkout-discount-row">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span>-₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="checkout-summary-row">
              <span>Delivery</span>
              <span>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>

            <div className="checkout-summary-total">
              <span>Total</span>
<span>₹{total.toFixed(2)}</span>
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
