import { Schema, model, Types } from "mongoose";

const postSchema = new Schema(
  {
    supervisor: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: [true, "Title is required."] },
    content: { type: String, required: [true, "Content is required."] },
    tags: [{ type: String }],
    requirements: [{ type: String }],
    projectType: { type: String, enum: ["research", "industry", "both"], default: "research" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PostModel = model("Post", postSchema);

export default PostModel;



