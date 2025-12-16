import { Schema, model, Types } from "mongoose";

const supervisionRequestSchema = new Schema(
  {
    group: {
      type: Types.ObjectId,
      ref: "Group",
      required: [true, "Group is required."],
    },
    supervisor: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Supervisor is required."],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    requestedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Requested by is required."],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
supervisionRequestSchema.index({ group: 1 });
supervisionRequestSchema.index({ supervisor: 1 });
supervisionRequestSchema.index({ status: 1 });

// Ensure one pending request per group-supervisor pair
supervisionRequestSchema.index({ group: 1, supervisor: 1, status: 1 });

const SupervisionRequestModel = model("SupervisionRequest", supervisionRequestSchema);

export default SupervisionRequestModel;
