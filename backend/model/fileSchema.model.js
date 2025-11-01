import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // uploader (client)
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    reward: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date, // optional, for time-limited tasks
    },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
