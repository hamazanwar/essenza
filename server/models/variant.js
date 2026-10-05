const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        productName: {
            type: String,
            required: true,
            trim: true
        },

        size: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        stock: {
            type: Number,
            required: true,
            min: 0
        },

        images: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Variant = mongoose.model("Variant", variantSchema);

module.exports = Variant;