import { Schema, model, Types } from "mongoose";

const postLikeSchema = new Schema(
  {
    post: { type: Types.ObjectId, ref: "Post", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Ensure one like per user per post
postLikeSchema.index({ post: 1, user: 1 }, { unique: true });

const PostLikeModel = model("PostLike", postLikeSchema);

export default PostLikeModel;

