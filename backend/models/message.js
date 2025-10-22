import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema(
  {
    group: { type: Types.ObjectId, ref: "Group", required: true },
    sender: { type: Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["text", "file", "image"], default: "text" },
    content: { type: String, required: true },
    fileName: { type: String, default: null },
    fileSize: { type: String, default: null },
  },
  { timestamps: true }
);

const MessageModel = model("Message", messageSchema);

export default MessageModel;



