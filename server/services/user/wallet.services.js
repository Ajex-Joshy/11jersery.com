import User from "../../models/user.model.js";
import walletTransaction from "../../models/wallet-transaction.js";
import { getPagination } from "../../utils/helpers.js";

export const checkWalletBalance = async (userId, amount) => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.balance < amount) {
    throw new Error("Insufficient wallet balance");
  }
  return wallet;
};

export const debitWallet = async (session, userId, amount, orderId, reason) => {
  const user = await User.findById(userId).select("wallet");
  let wallet = user.wallet || 0;

  if (wallet < amount || !wallet)
    throw new Error("Insufficient balance in wallet");

  user.wallet -= amount;
  await walletTransaction.create(
    [
      {
        userId,
        amount: amount,
        type: "DEBIT",
        reason,
        status: "SUCCESS",
      },
    ],
    { session }
  );
  await user.save({ session });
};

export const creditWallet = async (
  session,
  userId,
  amount,
  reason,
  paymentMethod
) => {
  const user = await User.findById(userId).select("wallet");
  let wallet = user.wallet || 0;
  console.log(wallet);

  wallet += amount;
  console.log("wallet", "amount", amount);
  await user.save();

  return await walletTransaction.create(
    [
      {
        userId,
        amount,
        type: "CREDIT",
        reason,
        status: "SUCCESS",
        paymentMethod,
      },
    ],
    { session }
  );
};

export const getUserWalletData = async (userId, queryParams) => {
  const { page = 1, limit = 5, type, status, startDate, endDate } = queryParams;

  const user = await User.findById(userId).select("wallet");
  if (!user) throw createError(404, "User not found");

  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const walletQuery = { userId };

  if (type) walletQuery.type = type; // CREDIT / DEBIT
  if (status) walletQuery.status = status;
  if (startDate || endDate) {
    walletQuery.createdAt = {};
    if (startDate) walletQuery.createdAt.$gte = new Date(startDate);
    if (endDate) walletQuery.createdAt.$lte = new Date(endDate);
  }

  const [transactions, totalTransactions] = await Promise.all([
    walletTransaction
      .find(walletQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select("-__v")
      .lean(),
    walletTransaction.countDocuments(walletQuery),
  ]);

  return {
    balance: user.wallet || 0,
    transactions,
    pagination: {
      totalTransactions,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalTransactions / pageSize),
      limit: pageSize,
    },
  };
};
