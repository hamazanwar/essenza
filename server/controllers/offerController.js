
const mongoose = require("mongoose");
const Offer = require("../models/Offer");

// CREATE OFFER
const createOffer = async (req, res) => {
    try {
        const {
            name,
            description,
            discountType,
            discountValue,
            applicableProducts,
            applicableCategories,
            startDate,
            endDate,
            isActive,
        } = req.body;

        const offer = await Offer.create({
            name,
            description,
            discountType,
            discountValue,
            applicableProducts,
            applicableCategories,
            startDate,
            endDate,
            isActive,
        });

        return res.status(201).json({
            success: true,
            message: "Offer created successfully.",
            offer,
        });
    } catch (error) {
        console.error("Create offer error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create offer.",
        });
    }
};

// GET ALL OFFERS
const getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find()
            .populate("applicableProducts", "name productImage")
            .populate("applicableCategories", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            offers,
        });
    } catch (error) {
        console.error("Get offers error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve offers.",
        });
    }
};


 // GET ACTIVE OFFERS FOR CUSTOMER SIDE
const getActiveOffers = async (req, res) => {
    try {
        const now = new Date();

        const offers = await Offer.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gt: now },
        })
            .populate("applicableProducts", "name")
            .populate("applicableCategories", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            offers,
        });
    } catch (error) {
        console.error("Get active offers error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve active offers.",
        });
    }
};


// UPDATE OFFER
const updateOffer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid offer ID.",
            });
        }

        const offer = await Offer.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        )
            .populate("applicableProducts", "name productImage")
            .populate("applicableCategories", "name");

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Offer updated successfully.",
            offer,
        });
    } catch (error) {
        console.error("Update offer error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update offer.",
        });
    }
};

// DELETE OFFER
const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid offer ID.",
            });
        }

        const offer = await Offer.findByIdAndDelete(id);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Offer deleted successfully.",
        });
    } catch (error) {
        console.error("Delete offer error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete offer.",
        });
    }
};

module.exports = {
    createOffer,
    getAllOffers,
    updateOffer,
    deleteOffer,
    getActiveOffers
};
