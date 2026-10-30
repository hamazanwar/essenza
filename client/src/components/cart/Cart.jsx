import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

// Handle Cloudinary URLs and legacy local image paths
const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${api.defaults.baseURL.replace(/\/api\/?$/, "")}${image.startsWith("/") ? image : `/${image}`}`;
};

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [stockError, setStockError] = useState("");
  const [checkingCheckout, setCheckingCheckout] = useState(false);

  useEffect(() => {
    const getCart = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          setError("Please login to view your cart.");
          setLoading(false);
          return;
        }

        const response = await api.get("/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCart(response.data.cart);
      } catch (error) {
        console.error("Get cart error:", error);

        setError(error.response?.data?.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    getCart();
  }, []);

  // UPDATE QUANTITY
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login to update your cart.");
        return;
      }

      setError("");
      setCartMessage("");

      const response = await api.patch(
        `/cart/${itemId}`,
        {
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCart(response.data.cart);
    } catch (error) {
      console.error("Update cart quantity error:", error);

      setError(error.response?.data?.message || "Failed to update quantity");
    }
  };

  // REMOVE ITEM
  const removeItem = async (itemId) => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login to remove items.");
        return;
      }

      setError("");
      setCartMessage("");

      const response = await api.delete(`/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCart(response.data.cart);
      setCartMessage("Product removed from cart.");
    } catch (error) {
      console.error("Remove cart item error:", error);

      setError(error.response?.data?.message || "Failed to remove product");
    }
  };

  // CHECK STOCK BEFORE PROCEEDING TO CHECKOUT
  const handleProceedToCheckout = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please login to continue.");
        return;
      }

      setError("");
setCartMessage("");
setStockError("");
setCheckingCheckout(true);

      // Fetch the latest cart and stock information from the backend
      const response = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const latestCart = response.data.cart;

      // Update the cart UI with the latest data
      setCart(latestCart);

      const unavailableItems = (latestCart?.items || []).filter((item) => {
        const stock = Number(item.variantId?.stock ?? 0);
        const quantity = Number(item.quantity ?? 0);

        return stock <= 0 || quantity > stock;
      });

      // Stop checkout if any item is unavailable
      if (unavailableItems.length > 0) {
        const messages = unavailableItems.map((item) => {
          const productName = item.productId?.name || "This product";
          const stock = Number(item.variantId?.stock ?? 0);
          const quantity = Number(item.quantity ?? 0);

          if (stock <= 0) {
            return `${productName} (${item.variantId?.size || "selected size"}) is out of stock.`;
          }

          return `${productName} has only ${stock} item(s) available, but your cart has ${quantity}.`;
        });

        setError("");
        setCartMessage("");
        setStockError(messages.join(" "));
        return;
      }
      setStockError("");
      // Navigate only when all cart items are available
      navigate("/checkout");
    } catch (error) {
      console.error("Checkout stock validation error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to check product availability. Please try again.",
      );
    } finally {
      setCheckingCheckout(false);
    }
  };

  // CALCULATE SUBTOTAL USING DISCOUNTED PRICES
  const subtotal =
    cart?.items?.reduce(
      (total, item) =>
        total + (item.discountedPrice ?? item.variantId.price) * item.quantity,
      0,
    ) || 0;

  const originalSubtotal =
    cart?.items?.reduce(
      (total, item) => total + item.variantId.price * item.quantity,
      0,
    ) || 0;

  const totalDiscount = originalSubtotal - subtotal;

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="cart-page">
          <div className="cart-message">Loading cart...</div>
        </main>

        <Footer />
      </>
    );
  }

  if (error && !cart) {
    return (
      <>
        <Navbar />

        <main className="cart-page">
          <div className="cart-message error">{error}</div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <div className="cart-container">
          <h1>YOUR CART</h1>

          {cartMessage && (
  <p className="cart-success-message">{cartMessage}</p>
)}

{error && <p className="cart-error-message">{error}</p>}

{stockError && (
  <p className="cart-stock-error">{stockError}</p>
)}

          {cart?.items?.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map((item) => (
                  <div key={item._id} className="cart-item">
                    {/* PRODUCT IMAGE */}
                    <div className="cart-item-image">
                      {item.productId?.productImage?.length > 0 ? (
                        <img
                          src={getImageUrl(item.productId.productImage[0])}
                          alt={item.productId.name}
                        />
                      ) : (
                        <div>No Image</div>
                      )}
                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="cart-item-details">
                      <h2>{item.productId?.name}</h2>

                      <p>Size: {item.variantId?.size}</p>

                      {Number(item.variantId?.stock ?? 0) <= 0 && (
                        <p className="cart-stock-error">Out of stock</p>
                      )}

                      {Number(item.variantId?.stock ?? 0) > 0 &&
                        Number(item.quantity) >
                          Number(item.variantId.stock) && (
                          <p className="cart-stock-error">
                            Only {item.variantId.stock} item(s) available
                          </p>
                        )}

                      {item.discountAmount > 0 ? (
                        <>
                          <p className="cart-original-price">
                            ₹{item.originalPrice}
                          </p>

                          <p className="cart-discounted-price">
                            ₹{item.discountedPrice}
                          </p>

                          <p className="cart-offer-badge">
                            {item.discountType === "PERCENTAGE"
                              ? `${item.discountValue}% OFF`
                              : `₹${item.discountValue} OFF`}
                          </p>
                        </>
                      ) : (
                        <p>₹{item.variantId?.price}</p>
                      )}
                    </div>

                    {/* QUANTITY */}
                    <div className="cart-item-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.variantId.stock}
                      >
                        +
                      </button>
                    </div>

                    {/* ITEM SUBTOTAL */}

                    <div className="cart-item-subtotal">
                      ₹
                      {(
                        (item.discountedPrice ?? item.variantId.price) *
                        item.quantity
                      ).toFixed(2)}
                    </div>

                    {/* REMOVE */}
                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => removeItem(item._id)}
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>

              {/* CART SUMMARY */}
              <div className="cart-summary">
                <h2>CART SUMMARY</h2>

                <div className="cart-summary-row">
                  <span>Subtotal</span>

                  <span>₹{subtotal}</span>

                  {totalDiscount > 0 && (
                    <div className="cart-summary-row cart-discount-row">
                      <span>Offer Discount</span>
                      <span>-₹{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="cart-summary-row">
                  <span>Total</span>

                  <span>₹{subtotal}</span>
                </div>

                <button
                  type="button"
                  className="checkout-button"
                  onClick={handleProceedToCheckout}
                  disabled={checkingCheckout}
                >
                  {checkingCheckout
                    ? "CHECKING STOCK..."
                    : "PROCEED TO CHECKOUT"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Cart;
