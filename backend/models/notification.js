import { Schema, model, Types } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: { type: Types.ObjectId, ref: "User", required: true },
    audience: { type: String, enum: ["student", "supervisor", "both", "specific"], default: "specific" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const NotificationModel = model("Notification", notificationSchema);

export default NotificationModel;



