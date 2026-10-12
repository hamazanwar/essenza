
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        discountType: {
            type: String,
            enum: ["PERCENTAGE", "FIXED"],
            required: true,
        },

        discountValue: {
            type: Number,
            required: true,
            min: [0.01, "Discount value must be greater than zero."],
        },

        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        applicableCategories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

offerSchema.pre("validate", function (next) {
    if (
        this.discountType === "PERCENTAGE" &&
        this.discountValue > 100
    ) {
        this.invalidate(
            "discountValue",
            "Percentage discount cannot exceed 100%."
        );
    }

    if (
        this.startDate &&
        this.endDate &&
        this.endDate <= this.startDate
    ) {
        this.invalidate(
            "endDate",
            "End date must be after the start date."
        );
    }

    if (
        (!this.applicableProducts ||
            this.applicableProducts.length === 0) &&
        (!this.applicableCategories ||
            this.applicableCategories.length === 0)
    ) {
        this.invalidate(
            "applicableProducts",
            "Select at least one product or category for the offer."
        );
    }
});

module.exports = mongoose.model("Offer", offerSchema);
