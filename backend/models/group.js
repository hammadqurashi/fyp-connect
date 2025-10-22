import { Schema, model, Types } from "mongoose";

const groupSchema = new Schema(
  {
    name: { type: String, required: [true, "Group name is required."] },
    description: { type: String, default: "" },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    members: [{ type: Types.ObjectId, ref: "User" }],
    supervisor: { type: Types.ObjectId, ref: "User", default: null },
    isFormed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const GroupModel = model("Group", groupSchema);

export default GroupModel;



