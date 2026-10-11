
const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const WithdrawalRequest = require("../models/WithdrawalRequest");

const createWithdrawalRequestService = async ({ userId, amount }) => {
  const requestedAmount = Number(amount);

  if (
    !Number.isFinite(requestedAmount) ||
    requestedAmount < 1 ||
    Math.round(requestedAmount * 100) !== requestedAmount * 100
  ) {
    const error = new Error(
      "Enter a valid withdrawal amount of at least ₹1, with up to two decimal places."
    );
    error.statusCode = 400;
    throw error;
  }

  const roundedAmount =
    Math.round((requestedAmount + Number.EPSILON) * 100) / 100;

  const session = await mongoose.startSession();
  let withdrawal;

  try {
    await session.withTransaction(async () => {
      const wallet = await Wallet.findOne({
        userId,
        isActive: true,
      }).session(session);

      if (!wallet) {
        const error = new Error("Active wallet not found.");
        error.statusCode = 404;
        throw error;
      }

      // Reserve funds only if sufficient unreserved balance remains.
      const updatedWallet = await Wallet.findOneAndUpdate(
        {
          _id: wallet._id,
          isActive: true,
          $expr: {
            $gte: [
              {
                $subtract: [
                  "$balance",
                  { $ifNull: ["$reservedBalance", 0] },
                ],
              },
              roundedAmount,
            ],
          },
        },
        {
          $inc: { reservedBalance: roundedAmount },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedWallet) {
        const error = new Error("Insufficient available wallet balance.");
        error.statusCode = 400;
        throw error;
      }

      const requests = await WithdrawalRequest.create(
        [
          {
            userId,
            walletId: wallet._id,
            amount: roundedAmount,
            status: "PENDING",
          },
        ],
        { session }
      );

      withdrawal = requests[0];
    });

    return withdrawal;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createWithdrawalRequestService,
};
