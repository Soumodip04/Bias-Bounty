import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // The user receiving the reward
      required: true,
    },
    receiverAddress: {
      type: String,
      required: true,
    },
    amount: {
      type: Number, // in octas
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
    reason: {
      type: String, // Optional - reason or event that triggered the reward
    },
  },
  { timestamps: true }
);

const Reward = mongoose.model("Reward", rewardSchema);

export default Reward;
