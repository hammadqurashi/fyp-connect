import { Schema, model, Types } from "mongoose";

const groupFileSchema = new Schema(
  {
    group: { type: Types.ObjectId, ref: "Group", required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const GroupFileModel = model("GroupFile", groupFileSchema);

export default GroupFileModel;

