const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }
    },
    {
        _id: true
    }
);

const wishlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        products: {
            type: [wishlistItemSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Wishlist =
    mongoose.models.Wishlist ||
    mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;