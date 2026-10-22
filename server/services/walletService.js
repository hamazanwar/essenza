
const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

// Find an existing wallet or create one for the user.
const getOrCreateWalletService = async (userId) => {
  let wallet = await Wallet.findOne({ userId });

  if (wallet) {
    return wallet;
  }

  try {
    return await Wallet.create({ userId });
  } catch (error) {
    if (error.code === 11000) {
      wallet = await Wallet.findOne({ userId });

      if (wallet) {
        return wallet;
      }
    }

    throw error;
  }
};

// Get wallet balance and recent successful transactions.
const getWalletDetailsService = async (userId) => {
  const wallet = await getOrCreateWalletService(userId);

  if (!wallet.isActive) {
    const error = new Error("Your wallet is currently inactive.");
    error.statusCode = 403;
    throw error;
  }

  const transactions = await WalletTransaction.find({
    walletId: wallet._id,
    status: "SUCCESS",
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
  walletId: wallet._id,
  balance: wallet.balance,
  reservedBalance: wallet.reservedBalance || 0,
  availableBalance:
    wallet.balance - (wallet.reservedBalance || 0),
  transactions,
};
};

// Apply a credit or debit exactly once.
// Call this only from trusted server-side payment/order/admin logic.
const applyWalletTransactionService = async ({
  userId,
  type,
  source,
  amount,
  referenceId,
  orderId = null,
  paymentId = null,
  description = "",
  performedBy = null,
}) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!["CREDIT", "DEBIT"].includes(type)) {
    throw new Error("Invalid wallet transaction type.");
  }

 const allowedSources = [
  "ADD_MONEY",
  "ORDER_PAYMENT",
  "REFUND",
  "EXCHANGE_PAYMENT",
  "ADMIN_CREDIT",
  "ADMIN_DEBIT",
];

  if (!allowedSources.includes(source)) {
    throw new Error("Invalid wallet transaction source.");
  }

  const transactionAmount = Number(amount);

  if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
    throw new Error("Transaction amount must be greater than zero.");
  }

  if (!referenceId || typeof referenceId !== "string") {
    throw new Error("A unique transaction reference is required.");
  }

  // Keep currency values precise to two decimal places.
  const roundedAmount = Math.round((transactionAmount + Number.EPSILON) * 100) / 100;

  if (roundedAmount <= 0) {
    throw new Error("Invalid transaction amount.");
  }

  const session = await mongoose.startSession();

  let result;

  try {
    await session.withTransaction(async () => {
      // Prevent a duplicate reference from being applied again.
      const existingTransaction = await WalletTransaction.findOne({
        referenceId,
      }).session(session);

      if (existingTransaction) {
        if (
          existingTransaction.userId.toString() !== userId.toString() ||
          existingTransaction.type !== type ||
          existingTransaction.source !== source ||
          existingTransaction.amount !== roundedAmount
        ) {
          throw new Error("Transaction reference has already been used.");
        }

        result = {
          duplicate: true,
          transaction: existingTransaction,
        };

        return;
      }

      const wallet = await Wallet.findOne({ userId }).session(session);

      if (!wallet) {
        throw new Error("Wallet not found.");
      }

      if (!wallet.isActive) {
        const error = new Error("Your wallet is currently inactive.");
        error.statusCode = 403;
        throw error;
      }

      const balanceBefore = wallet.balance;

      // Use a conditional update so concurrent debits cannot overspend.
      const balanceCondition = {
        _id: wallet._id,
        isActive: true,
      };

      if (type === "DEBIT") {
  balanceCondition.$expr = {
    $gte: [
      { $subtract: ["$balance", { $ifNull: ["$reservedBalance", 0] }] },
      roundedAmount,
    ],
  };
}

      const balanceUpdate =
        type === "CREDIT"
          ? { $inc: { balance: roundedAmount } }
          : { $inc: { balance: -roundedAmount } };

      const updatedWallet = await Wallet.findOneAndUpdate(
        balanceCondition,
        balanceUpdate,
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!updatedWallet) {
        throw new Error(
          type === "DEBIT"
            ? "Insufficient wallet balance."
            : "Wallet is inactive or unavailable."
        );
      }

      const transaction = await WalletTransaction.create(
        [
          {
            walletId: wallet._id,
            userId,
            type,
            source,
            amount: roundedAmount,
            balanceBefore,
            balanceAfter: updatedWallet.balance,
            orderId,
            paymentId,
            referenceId,
            status: "SUCCESS",
            description,
            performedBy,
          },
        ],
        { session }
      );

      result = {
        duplicate: false,
        wallet: updatedWallet,
        transaction: transaction[0],
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getOrCreateWalletService,
  getWalletDetailsService,
  applyWalletTransactionService,
};
