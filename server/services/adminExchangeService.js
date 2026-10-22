
const mongoose = require("mongoose");
const ReturnRequest = require("../models/ReturnRequest");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const Variant = require("../models/variant");

const completeExchangeService = async ({
  returnRequestId,
  itemId,
  adminId,
}) => {
  if (
    !mongoose.Types.ObjectId.isValid(returnRequestId) ||
    !mongoose.Types.ObjectId.isValid(itemId)
  ) {
    throw new Error("Invalid return request or item ID");
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const request = await ReturnRequest.findById(
        returnRequestId
      ).session(session);

      if (!request) {
        throw new Error("Exchange request not found");
      }

      if (request.requestType !== "EXCHANGE") {
        throw new Error("This request is not an exchange");
      }

      const item = request.items.id(itemId);

      if (!item) {
        throw new Error("Exchange item not found");
      }

      // A completed exchange must never be processed again.
      if (item.status === "COMPLETED") {
        throw new Error("This exchange item is already completed");
      }

      if (item.status !== "APPROVED") {
        throw new Error("Only approved exchange items can be completed");
      }

      if (!item.exchangeVariantId) {
        throw new Error("Replacement variant is not selected");
      }

      const quantity = Number(item.quantity);
      const originalUnitPrice = Number(item.unitPrice);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(originalUnitPrice) ||
        originalUnitPrice < 0
      ) {
        throw new Error("Invalid exchange quantity or original price");
      }

      const originalVariant = await Variant.findById(
        item.variantId
      ).session(session);

      const replacementVariant = await Variant.findById(
        item.exchangeVariantId
      ).session(session);

      if (!originalVariant || !replacementVariant) {
        throw new Error("Original or replacement variant not found");
      }

      if (
        String(originalVariant.productId) !== String(item.productId) ||
        String(replacementVariant.productId) !== String(item.productId)
      ) {
        throw new Error("Exchange variants do not match the product");
      }

      if (
        !Number.isFinite(Number(replacementVariant.price)) ||
        Number(replacementVariant.price) < 0
      ) {
        throw new Error("Invalid replacement variant price");
      }

      const priceDifference = Math.round(
        Math.max(
          0,
          Number(replacementVariant.price) - originalUnitPrice
        ) * quantity * 100
      ) / 100;

      let duplicateTransaction = false;

      // Charge the difference only when the replacement is more expensive.
      if (priceDifference > 0) {
        const wallet = await Wallet.findOne({
          userId: request.userId,
        }).session(session);

        if (!wallet || !wallet.isActive) {
          throw new Error("Active customer wallet not found");
        }

        const referenceId =
          `exchange_payment_${request._id}_${item._id}`;

        const existingTransaction = await WalletTransaction.findOne({
          referenceId,
        }).session(session);

        if (existingTransaction) {
          // A transaction without a completed exchange should not normally
          // exist because both are saved in the same database transaction.
          throw new Error(
            "Exchange payment already exists; please verify this request"
          );
        }

        const balanceBefore = Number(wallet.balance);
        const reservedBalance = Number(wallet.reservedBalance || 0);

        if (
          balanceBefore - reservedBalance < priceDifference
        ) {
          throw new Error(
            `Insufficient wallet balance. ₹${priceDifference.toFixed(2)} is required`
          );
        }

        const balanceAfter = Math.round(
          (balanceBefore - priceDifference) * 100
        ) / 100;

        // Atomic conditional debit: do not spend reserved wallet funds.
        const updatedWallet = await Wallet.findOneAndUpdate(
          {
            _id: wallet._id,
            isActive: true,
            balance: { $gte: priceDifference + reservedBalance },
          },
          {
            $inc: { balance: -priceDifference },
          },
          {
            new: true,
            session,
          }
        );

        if (!updatedWallet) {
          throw new Error(
            "Wallet balance changed. Please try again"
          );
        }

        await WalletTransaction.create(
          [
            {
              walletId: wallet._id,
              userId: request.userId,
              type: "DEBIT",
              source: "EXCHANGE_PAYMENT",
              amount: priceDifference,
              balanceBefore,
              balanceAfter,
              orderId: request.orderId,
              referenceId,
              status: "SUCCESS",
              description:
                `Price difference for exchange request ${request._id}`,
              performedBy: adminId || null,
            },
          ],
          { session }
        );
      }

      // If both variants are the same, stock should remain unchanged.
      if (
        String(originalVariant._id) !==
        String(replacementVariant._id)
      ) {
        const stockUpdated = await Variant.updateOne(
          {
            _id: replacementVariant._id,
            stock: { $gte: quantity },
          },
          {
            $inc: { stock: -quantity },
          },
          { session }
        );

        if (stockUpdated.modifiedCount !== 1) {
          throw new Error(
            "Insufficient replacement stock. Exchange was not completed"
          );
        }

        await Variant.updateOne(
          { _id: originalVariant._id },
          { $inc: { stock: quantity } },
          { session }
        );
      }

      item.status = "COMPLETED";
      item.completedAt = new Date();
      item.refundAmount = 0;
      item.adminNote = priceDifference > 0
        ? `Exchange completed. ₹${priceDifference.toFixed(2)} collected from wallet`
        : "Exchange completed. No additional payment required";

      const statuses = request.items.map((entry) => entry.status);

      if (statuses.every((status) => status === "COMPLETED")) {
        request.status = "COMPLETED";
      } else if (
        statuses.every(
          (status) =>
            status === "COMPLETED" || status === "REJECTED"
        )
      ) {
        request.status = "COMPLETED";
      } else if (
        statuses.some(
          (status) =>
            status === "COMPLETED" || status === "APPROVED"
        )
      ) {
        request.status = "PARTIALLY_APPROVED";
      }

      await request.save({ session });

      result = {
        request,
        itemId: item._id,
        priceDifference,
        duplicateTransaction,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  completeExchangeService,
};
