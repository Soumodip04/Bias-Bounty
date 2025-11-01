// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    senderAddress: {
      type: String,
      required: true,
    },
    receiverAddress: {
      type: String,
      required: true,
    },
    amount: {
      type: Number, // amount in octas
      required: true,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    explorerUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
