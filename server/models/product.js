const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        productImage: {
            type: [String],
            default: []
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        fragranceNotes: {
            type: String,
            default: "",
            trim: true
        },

        ingredients: {
            type: String,
            default: "",
            trim: true
        },

        howToUse: {
            type: String,
            default: "",
            trim: true
        },

        shippingAndReturns: {
            type: String,
            default: "",
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;