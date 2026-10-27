const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const WithdrawalRequest = require("../models/WithdrawalRequest");

const {
    getAllCustomersService,
    updateCustomerStatusService,
    getCustomerDetailsService
} = require("../services/customerService");


// ==========================================
// GET ALL CUSTOMERS
// ==========================================

const getAllCustomers = async (req, res) => {
    try {

        const result =
            await getAllCustomersService();

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get customers error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};


// ==========================================
// BLOCK / UNBLOCK CUSTOMER
// ==========================================

const updateCustomerStatus = async (
    req,
    res
) => {
    try {

        const result =
            await updateCustomerStatusService(
                req.params.id
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Update customer status error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};

// ==========================================
// GET CUSTOMER DETAILS
// ==========================================

const getCustomerDetails = async (
    req,
    res
) => {
    try {

        const result =
            await getCustomerDetailsService(
                req.params.id
            );

        res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get customer details error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.statusCode
                    ? error.message
                    : "Server error"
        });
    }
};



const getCustomerWallet = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid customer ID.",
            });
        }

        const wallet = await Wallet.findOne({
            userId: id,
        }).lean();

        if (!wallet) {
            return res.status(200).json({
                wallet: null,
                transactions: [],
                withdrawalRequests: [],
            });
        }

        const [transactions, withdrawalRequests] = await Promise.all([
            WalletTransaction.find({
                walletId: wallet._id,
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),

            WithdrawalRequest.find({
                userId: id,
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean(),
        ]);

        const reservedBalance = wallet.reservedBalance || 0;

        return res.status(200).json({
            wallet: {
                _id: wallet._id,
                balance: wallet.balance,
                reservedBalance,
                availableBalance: wallet.balance - reservedBalance,
                isActive: wallet.isActive,
            },
            transactions,
            withdrawalRequests,
        });
    } catch (error) {
        console.error("Get customer wallet error:", error);

        return res.status(500).json({
            message: "Failed to retrieve customer wallet.",
        });
    }
};





const reviewWithdrawalRequest = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID.",
            });
        }

        const { requestId } = req.params;
        const { action, adminNote = "" } = req.body;


        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: "Invalid withdrawal request ID.",
            });
        }

        if (!["APPROVE", "REJECT"].includes(action)) {
            return res.status(400).json({
                message: "Action must be APPROVE or REJECT.",
            });
        }

        if (
            typeof adminNote !== "string" ||
            adminNote.length > 500
        ) {
            return res.status(400).json({
                message: "Admin note must be 500 characters or fewer.",
            });
        }

        let updatedRequest;

        await session.withTransaction(async () => {
            const request = await WithdrawalRequest.findOne({
    _id: requestId,
    userId: req.params.id,
    status: "PENDING",
}).session(session);

            if (!request) {
                const error = new Error(
                    "Withdrawal request not found or already reviewed."
                );
                error.statusCode = 409;
                throw error;
            }

            const wallet = await Wallet.findOne({
                _id: request.walletId,
                userId: request.userId,
            }).session(session);

            if (!wallet) {
                const error = new Error("Wallet not found.");
                error.statusCode = 404;
                throw error;
            }

            if (wallet.reservedBalance < request.amount) {
                const error = new Error(
                    "Reserved wallet balance is insufficient. Request was not changed."
                );
                error.statusCode = 409;
                throw error;
            }

            if (action === "REJECT") {
                const releasedWallet = await Wallet.findOneAndUpdate(
                    {
                        _id: wallet._id,
                        reservedBalance: { $gte: request.amount },
                    },
                    {
                        $inc: {
                            reservedBalance: -request.amount,
                        },
                    },
                    {
                        new: true,
                        session,
                    }
                );

                if (!releasedWallet) {
                    const error = new Error(
                        "Unable to release the reserved balance."
                    );
                    error.statusCode = 409;
                    throw error;
                }

                request.status = "REJECTED";
            } else {
                // Approval authorizes the next payout step.
                // Keep funds reserved until payout outcome is confirmed.
                request.status = "APPROVED";
            }

            request.adminNote = adminNote.trim();
            request.reviewedAt = new Date();

            // This must be the authenticated admin's ID.
            // We will confirm its exact property in the next step.
            request.reviewedBy =
    req.admin?.adminId ||
    req.admin?.id ||
    req.admin?._id ||
    req.admin?.userId ||
    null;

            await request.save({ session });

            updatedRequest = request;
        });

        return res.status(200).json({
            success: true,
            message:
                action === "REJECT"
                    ? "Withdrawal request rejected. Reserved funds have been released."
                    : "Withdrawal request approved. Funds remain reserved until payout is resolved.",
            data: {
                withdrawalRequest: updatedRequest,
            },
        });
    } catch (error) {
        console.error("Review withdrawal request error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to review withdrawal request.",
        });
    } finally {
        await session.endSession();
    }
};

const completeWithdrawalPayout = async (req, res) => {
    console.log("✅ completeWithdrawalPayout CALLED");
    const session = await mongoose.startSession();

    try {
        const { id: customerId, requestId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(customerId) ||
            !mongoose.Types.ObjectId.isValid(requestId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer or withdrawal request ID.",
            });
        }

        let updatedRequest;

        await session.withTransaction(async () => {
            const request = await WithdrawalRequest.findOne({
                _id: requestId,
                userId: customerId,
                status: "APPROVED",
            }).session(session);

            if (!request) {
                const error = new Error(
                    "Approved withdrawal request not found or already completed."
                );
                error.statusCode = 409;
                throw error;
            }

            const wallet = await Wallet.findOne({
                _id: request.walletId,
                userId: customerId,
                isActive: true,
            }).session(session);

            if (!wallet) {
                const error = new Error("Active wallet not found.");
                error.statusCode = 404;
                throw error;
            }

            const amount = request.amount;

            if (
                !Number.isFinite(amount) ||
                amount <= 0 ||
                wallet.balance < amount ||
                wallet.reservedBalance < amount
            ) {
                const error = new Error(
                    "Insufficient wallet or reserved balance. Payout was not completed."
                );
                error.statusCode = 409;
                throw error;
            }

            const balanceBefore = wallet.balance;
            const referenceId = `withdrawal_${request._id}`;

            // Prevent a duplicate debit for this withdrawal.
            const existingTransaction = await WalletTransaction.findOne({
                referenceId,
            }).session(session);

            if (existingTransaction) {
                const error = new Error(
                    "A transaction already exists for this withdrawal."
                );
                error.statusCode = 409;
                throw error;
            }

            const updatedWallet = await Wallet.findOneAndUpdate(
                {
                    _id: wallet._id,
                    userId: customerId,
                    isActive: true,
                    balance: { $gte: amount },
                    reservedBalance: { $gte: amount },
                },
                {
                    $inc: {
                        balance: -amount,
                        reservedBalance: -amount,
                    },
                },
                {
                    new: true,
                    session,
                }
            );

            if (!updatedWallet) {
                const error = new Error(
                    "Wallet balance changed. Please refresh and try again."
                );
                error.statusCode = 409;
                throw error;
            }

            console.log("PAYOUT TRANSACTION:", {
  walletId: String(wallet._id),
  userId: String(customerId),
  source: "WITHDRAWAL",
  amount,
  referenceId,
});
console.log("✅ SAVING WITHDRAWAL TRANSACTION");
            await WalletTransaction.create(
                [
                    {
                        walletId: wallet._id,
                        userId: customerId,
                        type: "DEBIT",
                        source: "WITHDRAWAL",
                        amount,
                        balanceBefore,
                        balanceAfter: updatedWallet.balance,
                        referenceId,
                        status: "SUCCESS",
                        description: `Withdrawal payout completed: ${request._id}`,
                        performedBy:
                            req.admin?.adminId ||
                            req.admin?.id ||
                            req.admin?._id ||
                            req.admin?.userId ||
                            null,
                    },
                ],
                { session }
            );

            request.status = "COMPLETED";
            request.payoutId = referenceId;
            request.reviewedAt = new Date();

            await request.save({ session });

            updatedRequest = request;
        });

        return res.status(200).json({
            success: true,
            message: "Withdrawal marked as completed and wallet balance deducted.",
            data: {
                withdrawalRequest: updatedRequest,
            },
        });
    } catch (error) {
        console.error("Complete withdrawal payout error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to complete withdrawal payout.",
        });
    } finally {
        await session.endSession();
    }
};




module.exports = {
    getAllCustomers,
    updateCustomerStatus,
    getCustomerDetails,
    getCustomerWallet,
    reviewWithdrawalRequest,
    completeWithdrawalPayout
};