import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Navbar from "../bars/Navbar";
import Footer from "../bars/Footer";

function ProductDetails() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");

  const [isImageZoomed, setIsImageZoomed] = useState(false);
const [zoomPosition, setZoomPosition] = useState({
  x: 50,
  y: 50,
});

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:5000/api/products/${productId}`,
        );

        const productData = response.data.product;

        setProduct(productData);

        if (productData.variants?.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      } catch (error) {
  console.error("Get product details error:", error);

  if (error.response?.status === 404) {
    setError("This product is no longer available.");
  } else {
    setError(
      error.response?.data?.message ||
        "Something went wrong"
    );
  }
} finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [productId]);

  const handleImageMouseMove = (event) => {
  const imageContainer = event.currentTarget;

  const rect = imageContainer.getBoundingClientRect();

  const x =
    ((event.clientX - rect.left) / rect.width) * 100;

  const y =
    ((event.clientY - rect.top) / rect.height) * 100;

  setZoomPosition({
    x,
    y,
  });
};

  const addToCart = async () => {
  try {
    const token = localStorage.getItem("token");

    setError("");
    setCartMessage("");

    if (!token) {
      setError("Please login to add products to your cart.");
      return;
    }

    if (!selectedVariant) {
      setError("Please select a product variant.");
      return;
    }

    const response = await axios.post(
      "http://localhost:5000/api/cart",
      {
        productId: productId,
        variantId: selectedVariant._id,
        quantity: quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Add to cart response:", response.data);

    setCartMessage("Product added to cart successfully.");
  } catch (error) {
    console.error("Add to cart error:", error);

    setError(
      error.response?.data?.message ||
        "Failed to add product to cart",
    );
  }
};

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="product-details-message">Loading product...</div>
        </main>

        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="product-details-message error">{error}</div>
        </main>

        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="product-details-message">Product not found.</div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="product-details-page">
        <div className="product-details-container">
          {/* PRODUCT IMAGE GALLERY */}
          <section className="product-gallery">
            <div
  className={`product-main-image ${
    isImageZoomed ? "image-zoomed" : ""
  }`}
  onMouseEnter={() => {
    setIsImageZoomed(true);
  }}
  onMouseMove={handleImageMouseMove}
  onMouseLeave={() => {
    setIsImageZoomed(false);
    setZoomPosition({
      x: 50,
      y: 50,
    });
  }}
>
  {product.productImage?.length > 0 ? (
    <img
      src={`http://localhost:5000${product.productImage[selectedImage]}`}
      alt={product.name}
      style={{
        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
      }}
    />
  ) : (
    <div className="product-main-image-placeholder">
      No Image
    </div>
  )}
</div>

            {/* THUMBNAILS */}
            {product.productImage?.length > 1 && (
              <div className="product-thumbnails">
                {product.productImage.map((image, index) => (
                  <button
                    key={index}
                    className={`product-thumbnail ${
                      selectedImage === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={`http://localhost:5000${image}`}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* PRODUCT INFORMATION */}
          <section className="product-details-info">
            <p className="product-details-category">
              {product.categoryId?.name}
            </p>

            <h1>{product.name}</h1>

            <p className="product-details-description">{product.description}</p>
            {selectedVariant && (
              <div className="selected-variant-info">
                <p className="selected-variant-price">
                  ₹{selectedVariant.price}
                </p>

                <p className="selected-variant-stock">
                  {selectedVariant.stock > 0
                    ? `${selectedVariant.stock} available`
                    : "Out of stock"}
                </p>
              </div>
            )}

            {product.variants?.length > 0 ? (
              <div className="product-variants">
                <h3>Size</h3>

                <div className="variant-list">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      className={
                        selectedVariant?._id === variant._id ? "selected" : ""
                      }
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p>No variants available.</p>
            )}
            {selectedVariant && selectedVariant.stock > 0 && (
              <div className="product-quantity">
                <h3>Quantity</h3>

                <div className="quantity-selector">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((previousQuantity) =>
                        Math.max(1, previousQuantity - 1),
                      )
                    }
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((previousQuantity) =>
                        Math.min(selectedVariant.stock, previousQuantity + 1),
                      )
                    }
                    disabled={quantity >= selectedVariant.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            {cartMessage && (
  <p className="cart-success-message">
    {cartMessage}
  </p>
)}
            {selectedVariant && selectedVariant.stock > 0 && (
              <div className="product-action-buttons">
                <button
                  type="button"
                  className="add-to-cart-button"
                  onClick={addToCart}
                >
                  ADD TO CART
                </button>

                <button
                  type="button"
                  className="buy-now-button"
                  onClick={() => {
                    // Buy now logic will be added next
                  }}
                >
                  BUY NOW
                </button>
              </div>
            )}
            {product.fragranceNotes && (
              <div className="product-info-section">
                <h3>FRAGRANCE NOTES</h3>
                <p>{product.fragranceNotes}</p>
              </div>
            )}

            {product.ingredients && (
              <div className="product-info-section">
                <h3>INGREDIENTS</h3>
                <p>{product.ingredients}</p>
              </div>
            )}

            {product.howToUse && (
              <div className="product-info-section">
                <h3>HOW TO USE</h3>
                <p>{product.howToUse}</p>
              </div>
            )}

            {product.shippingAndReturns && (
              <div className="product-info-section">
                <h3>SHIPPING & RETURNS</h3>
                <p>{product.shippingAndReturns}</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetails;
