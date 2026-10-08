import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";



function AddProduct() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);

    const [productName, setProductName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [fragranceNotes, setFragranceNotes] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [howToUse, setHowToUse] = useState("");
    const [shippingAndReturns, setShippingAndReturns] = useState("");

    const [productImages, setProductImages] = useState([]);
    // ==========================================
// IMAGE CROP STATES
// ==========================================

const [cropImage, setCropImage] = useState(null);
const [crop, setCrop] = useState({
    x: 0,
    y: 0
});
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

const [pendingImages, setPendingImages] = useState([]);


// ==========================================
// IMAGE CROP FUNCTIONS
// ==========================================

const onCropComplete = (
    croppedArea,
    croppedAreaPixels
) => {
    setCroppedAreaPixels(croppedAreaPixels);
};


// CREATE CROPPED IMAGE

const createCroppedImage = async (
    imageSrc,
    pixelCrop
) => {
    const image = new Image();

    image.src = imageSrc;

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });

    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    context.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(
                        new Error(
                            "Failed to create cropped image."
                        )
                    );
                    return;
                }

                resolve(blob);
            },
            "image/jpeg",
            0.9
        );
    });
};


// SAVE CROPPED IMAGE

const handleCropSave = async () => {
    if (!cropImage || !croppedAreaPixels) {
        return;
    }

    try {
        const croppedBlob = await createCroppedImage(
            cropImage.preview,
            croppedAreaPixels
        );

        const croppedFile = new File(
            [croppedBlob],
            `product-image-${Date.now()}.jpg`,
            {
                type: "image/jpeg"
            }
        );

        setProductImages((previousImages) => [
            ...previousImages,
            croppedFile
        ]);

        // Remove current preview URL
        URL.revokeObjectURL(
            cropImage.preview
        );

        // Close crop window
        setCropImage(null);

        // Reset crop
        setCrop({
            x: 0,
            y: 0
        });

        setZoom(1);

        setCroppedAreaPixels(null);

        // Open next image if available
        setPendingImages((previousImages) => {
            const remainingImages =
                previousImages.slice(1);

            if (remainingImages.length > 0) {
                const nextImage =
                    remainingImages[0];

                setCropImage({
                    file: nextImage,
                    preview:
                        URL.createObjectURL(
                            nextImage
                        )
                });

                setCrop({
                    x: 0,
                    y: 0
                });

                setZoom(1);
            }

            return remainingImages;
        });

    } catch (error) {
        console.error(
            "Image crop error:",
            error
        );
    }
};


// CANCEL CURRENT CROP

const handleCropCancel = () => {
    if (cropImage?.preview) {
        URL.revokeObjectURL(
            cropImage.preview
        );
    }

    setCropImage(null);

    setCrop({
        x: 0,
        y: 0
    });

    setZoom(1);

    setCroppedAreaPixels(null);

    setPendingImages([]);
};


const [variants, setVariants] = useState([
        {
            size: "",
            price: "",
            stock: ""
        }
    ]);

    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // FETCH CATEGORIES
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("adminToken");

            const response = await axios.get(
                "http://localhost:5000/api/admin/categories",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCategories(response.data.categories);
        } catch (error) {
            console.error("Category fetch error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load categories."
            );
        }
    };

    // ADD PRODUCT
    const handleAddProduct = async () => {
        // PRODUCT NAME VALIDATION
        if (!productName.trim()) {
            setError("Product name is required.");
            setSuccess("");
            return;
        }

        // CATEGORY VALIDATION
        if (!categoryId) {
            setError("Please select a category.");
            setSuccess("");
            return;
        }

        // DESCRIPTION VALIDATION
        if (!description.trim()) {
            setError("Product description is required.");
            setSuccess("");
            return;
        }

        // VARIANT VALIDATION
        if (variants.length === 0) {
            setError("At least one product variant is required.");
            setSuccess("");
            return;
        }

        const hasInvalidVariant = variants.some(
            (variant) =>
                !variant.size.trim() ||
                variant.price === "" ||
                variant.stock === "" ||
                Number(variant.price) < 0 ||
                Number(variant.stock) < 0
        );

        if (hasInvalidVariant) {
            setError(
                "Please enter valid size, price and stock for all variants."
            );
            setSuccess("");
            return;
        }

        // DUPLICATE SIZE VALIDATION
        const variantSizes = variants.map((variant) =>
            variant.size.trim().toLowerCase()
        );

        const hasDuplicateSize =
            new Set(variantSizes).size !== variantSizes.length;

        if (hasDuplicateSize) {
            setError("Each product variant must have a different size.");
            setSuccess("");
            return;
        }

        try {
            setAdding(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("adminToken");

            // CREATE FORM DATA
            const formData = new FormData();

            formData.append("categoryId", categoryId);
            formData.append("name", productName);
            formData.append("description", description);
            formData.append("fragranceNotes", fragranceNotes);
            formData.append("ingredients", ingredients);
            formData.append("howToUse", howToUse);
            formData.append("shippingAndReturns", shippingAndReturns);

            // ADD PRODUCT IMAGES
            productImages.forEach((image) => {
                formData.append("productImages", image);
            });

            // CREATE PRODUCT
            const response = await axios.post(
                "http://localhost:5000/api/admin/products",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const productId = response.data.product._id;

            // CREATE PRODUCT VARIANTS
            for (const variant of variants) {
                await axios.post(
                    "http://localhost:5000/api/admin/variants",
                    {
                        productId,
                        size: variant.size,
                        price: Number(variant.price),
                        stock: Number(variant.stock)
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }

            setSuccess("Product added successfully.");

            // GO BACK TO PRODUCT LIST
            setTimeout(() => {
                navigate("/admin/products");
            }, 1000);

        } catch (error) {
            console.error("Add product error:", error);

            setError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setAdding(false);
        }
    };

    // LOAD CATEGORIES WHEN PAGE LOADS
    useEffect(() => {
  fetchCategories();
}, []);

    return (
        <div className="admin-product-page">

            <AdminNavbar />

            <main className="admin-product-content">

                <h1>ADD PRODUCT</h1>

                {error && (
                    <p className="product-error">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="product-success">
                        {success}
                    </p>
                )}

                <div className="product-form">


                    {/* PRODUCT NAME */}
                    <input
                        type="text"
                        placeholder="Product name"
                        value={productName}
                        onChange={(event) =>
                            setProductName(event.target.value)
                        }
                    />

                    {/* CATEGORY */}
                    <select
                        value={categoryId}
                        onChange={(event) =>
                            setCategoryId(event.target.value)
                        }
                    >
                        <option value="">
                            Select category
                        </option>

                        {categories
                            .filter((category) => category.isActive)
                            .map((category) => (
                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>
                            ))}
                    </select>

                    {/* DESCRIPTION */}
                    <textarea
                        placeholder="Product description"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                    />

                    {/* FRAGRANCE NOTES */}
                    <textarea
                        placeholder="Fragrance notes"
                        value={fragranceNotes}
                        onChange={(event) =>
                            setFragranceNotes(event.target.value)
                        }
                    />

                    {/* INGREDIENTS */}
                    <textarea
                        placeholder="Ingredients"
                        value={ingredients}
                        onChange={(event) =>
                            setIngredients(event.target.value)
                        }
                    />

                    {/* HOW TO USE */}
                    <textarea
                        placeholder="How to use"
                        value={howToUse}
                        onChange={(event) =>
                            setHowToUse(event.target.value)
                        }
                    />

                    {/* SHIPPING & RETURNS */}
                    <textarea
                        placeholder="Shipping & returns"
                        value={shippingAndReturns}
                        onChange={(event) =>
                            setShippingAndReturns(event.target.value)
                        }
                    />

                    {/* PRODUCT VARIANTS */}
                    <div className="product-variants">

                        <div className="product-variants-header">

                            <h3>PRODUCT VARIANTS</h3>

                            <button
                                type="button"
                                className="product-variant-add"
                                onClick={() => {
                                    setVariants((previousVariants) => [
                                        ...previousVariants,
                                        {
                                            size: "",
                                            price: "",
                                            stock: ""
                                        }
                                    ]);
                                }}
                            >
                                + ADD VARIANT
                            </button>

                        </div>

                        {variants.map((variant, index) => (

                            <div
                                key={index}
                                className="product-variant-row"
                            >

                                {/* SIZE */}
                                <input
                                    type="text"
                                    placeholder="Size (e.g. 50ml)"
                                    value={variant.size}
                                    onChange={(event) => {

                                        const updatedVariants = [
                                            ...variants
                                        ];

                                        updatedVariants[index].size =
                                            event.target.value;

                                        setVariants(updatedVariants);
                                    }}
                                />

                                {/* PRICE */}
                                <input
                                    type="number"
                                    placeholder="Price"
                                    min="0"
                                    value={variant.price}
                                    onChange={(event) => {

                                        const updatedVariants = [
                                            ...variants
                                        ];

                                        updatedVariants[index].price =
                                            event.target.value;

                                        setVariants(updatedVariants);
                                    }}
                                />

                                {/* STOCK */}
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    min="0"
                                    value={variant.stock}
                                    onChange={(event) => {

                                        const updatedVariants = [
                                            ...variants
                                        ];

                                        updatedVariants[index].stock =
                                            event.target.value;

                                        setVariants(updatedVariants);
                                    }}
                                />

                                {/* REMOVE VARIANT */}
                                {variants.length > 1 && (
                                    <button
                                        type="button"
                                        className="product-variant-remove"
                                        onClick={() => {

                                            setVariants(
                                                (previousVariants) =>
                                                    previousVariants.filter(
                                                        (_, variantIndex) =>
                                                            variantIndex !== index
                                                    )
                                            );
                                        }}
                                    >
                                        REMOVE
                                    </button>
                                )}

                            </div>

                        ))}

                    </div>

                    {/* ==========================================
    PRODUCT IMAGES
========================================== */}

<input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    onChange={(event) => {

        const selectedImages =
            Array.from(event.target.files);

        if (selectedImages.length === 0) {
            return;
        }

        const firstImage = selectedImages[0];

        setPendingImages(selectedImages);

        setCropImage({
            file: firstImage,
            preview: URL.createObjectURL(firstImage)
        });

        setCrop({
            x: 0,
            y: 0
        });

        setZoom(1);

        // Allow selecting same image again
        event.target.value = "";
    }}
/>

                    {/* SELECTED IMAGES */}
                    {productImages.length > 0 && (

                        <div className="selected-product-images">

                            {productImages.map((image, index) => (

                                <div
                                    key={index}
                                    className="selected-product-image-item"
                                >

                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={image.name}
                                    />

                                    <span>
                                        {image.name}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setProductImages(
                                                (previousImages) =>
                                                    previousImages.filter(
                                                        (_, imageIndex) =>
                                                            imageIndex !== index
                                                    )
                                            );
                                        }}
                                    >
                                        REMOVE
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                    {/* ADD PRODUCT */}
                    <button
                        type="button"
                        onClick={handleAddProduct}
                        disabled={adding}
                    >
                        {adding
                            ? "ADDING..."
                            : "ADD PRODUCT"}
                    </button>

                    {/* BACK */}
                    <button
                        type="button"
                        onClick={() => navigate("/admin/products")}
                    >
                        BACK TO PRODUCTS
                    </button>

                </div>

{/* ==========================================
    IMAGE CROP MODAL
========================================== */}

{cropImage && (
    <div className="image-crop-overlay">

        <div className="image-crop-modal">

            <div className="image-crop-header">

                <h2>
                    CROP PRODUCT IMAGE
                </h2>

                <p>
                    Adjust the image before adding it.
                </p>

            </div>

            <div className="image-crop-area">

                <Cropper
                    image={cropImage.preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={1 / 1.05}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />

            </div>

            <div className="image-crop-controls">

                <label>
                    ZOOM
                </label>

                <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(event) =>
                        setZoom(
                            Number(event.target.value)
                        )
                    }
                />

            </div>

            <div className="image-crop-actions">

                <button
                    type="button"
                    onClick={handleCropCancel}
                >
                    CANCEL
                </button>

                <button
                    type="button"
                    onClick={handleCropSave}
                >
                    CROP & SAVE
                </button>

            </div>

        </div>

    </div>
)}

</main>

<AdminFooter />
        </div>
    );
}

export default AddProduct;