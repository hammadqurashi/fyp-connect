import { Schema, model, Types } from "mongoose";

const invitationSchema = new Schema(
  {
    group: { type: Types.ObjectId, ref: "Group", required: true },
    sender: { type: Types.ObjectId, ref: "User", required: true },
    receiver: { type: Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const InvitationModel = model("Invitation", invitationSchema);

export default InvitationModel;



