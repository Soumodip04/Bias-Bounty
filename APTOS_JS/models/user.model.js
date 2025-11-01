import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["COMPANY", "RESEARCHER"],
      required: true,
    },
    wallet_address: {
      type: String,
      required: true,
      unique: true,
    },
    private_key: {
      type: String,
      required: true,
      select: false, // hides private key from queries by default
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
