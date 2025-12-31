import { Schema, model, Types } from "mongoose";

const postCommentSchema = new Schema(
  {
    post: { type: Types.ObjectId, ref: "Post", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: [true, "Comment content is required."] },
  },
  { timestamps: true }
);

// Index for faster queries
postCommentSchema.index({ post: 1, createdAt: -1 });

const PostCommentModel = model("PostComment", postCommentSchema);

export default PostCommentModel;

