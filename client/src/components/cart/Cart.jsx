import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const getCart = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your cart.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/cart",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setCart(response.data.cart);
      } catch (error) {
        console.error("Get cart error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load cart",
        );
      } finally {
        setLoading(false);
      }
    };

    getCart();
  }, []);

  // UPDATE QUANTITY
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to update your cart.");
        return;
      }

      setError("");
      setCartMessage("");

      const response = await axios.patch(
        `http://localhost:5000/api/cart/${itemId}`,
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
      console.error(
        "Update cart quantity error:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "Failed to update quantity",
      );
    }
  };

  // REMOVE ITEM
  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to remove items.");
        return;
      }

      setError("");
      setCartMessage("");

      const response = await axios.delete(
        `http://localhost:5000/api/cart/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCart(response.data.cart);
      setCartMessage("Product removed from cart.");
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "Failed to remove product",
      );
    }
  };

  // CALCULATE SUBTOTAL
  const subtotal =
    cart?.items?.reduce(
      (total, item) =>
        total +
        item.variantId.price * item.quantity,
      0,
    ) || 0;

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="cart-page">
          <div className="cart-message">
            Loading cart...
          </div>
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
          <div className="cart-message error">
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

      <main className="cart-page">
        <div className="cart-container">

          <h1>YOUR CART</h1>

          {cartMessage && (
            <p className="cart-success-message">
              {cartMessage}
            </p>
          )}

          {error && (
            <p className="cart-error-message">
              {error}
            </p>
          )}

          {cart?.items?.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <div className="cart-items">

                {cart.items.map((item) => (
                  <div
                    key={item._id}
                    className="cart-item"
                  >

                    {/* PRODUCT IMAGE */}
                    <div className="cart-item-image">
                      {item.productId?.productImage
                        ?.length > 0 ? (
                        <img
                          src={`http://localhost:5000${item.productId.productImage[0]}`}
                          alt={item.productId.name}
                        />
                      ) : (
                        <div>
                          No Image
                        </div>
                      )}
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="cart-item-details">

                      <h2>
                        {item.productId?.name}
                      </h2>

                      <p>
                        Size: {item.variantId?.size}
                      </p>

                      <p>
                        ₹{item.variantId?.price}
                      </p>

                    </div>

                    {/* QUANTITY */}
                    <div className="cart-item-quantity">

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            item.quantity - 1,
                          )
                        }
                        disabled={
                          item.quantity <= 1
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            item.quantity + 1,
                          )
                        }
                        disabled={
                          item.quantity >=
                          item.variantId.stock
                        }
                      >
                        +
                      </button>

                    </div>

                    {/* ITEM SUBTOTAL */}
                    <div className="cart-item-subtotal">
                      ₹
                      {item.variantId.price *
                        item.quantity}
                    </div>

                    {/* REMOVE */}
                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() =>
                        removeItem(item._id)
                      }
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

                  <span>
                    ₹{subtotal}
                  </span>
                </div>

                <div className="cart-summary-row">
                  <span>Total</span>

                  <span>
                    ₹{subtotal}
                  </span>
                </div>

                <button
                  type="button"
                  className="checkout-button"
                >
                  PROCEED TO CHECKOUT
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