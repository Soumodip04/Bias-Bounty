import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    workerId: {
      type: String, // or ObjectId if you use user references
      required: true,
      trim: true,
    },
    workerUsername: {
      type: String,
      required: true,
      trim: true,
    },
    datasetId: {
      type: String, // refers to File._id
      required: true,
      trim: true,
    },
    clientId: {
      type: String, // owner/uploader of the dataset
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["applied", "in-progress", "submitted", "approved", "rejected"],
      default: "applied",
    },
    submissionLink: {
      type: String, // could be a file link, repo URL, etc.
      trim: true,
    },
    notes: {
      type: String, // optional message by the worker
      trim: true,
    },
    rewardClaimed: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);
