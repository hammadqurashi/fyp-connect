import BaseService from "../base-service.js";
import Post from "../../models/post.js";
import PostLike from "../../models/post-like.js";
import PostComment from "../../models/post-comment.js";
import User from "../../models/user.js";

class SupervisorPostService extends BaseService {
  // Create a new post
  async createPost(supervisorId, data) {
    try {
      const { title, content, tags, requirements, projectType } = data;

      if (!title || !content) {
        return this.handleResponse(
          400,
          false,
          "Title and content are required"
        );
      }

      const post = await Post.create({
        supervisor: supervisorId,
        title,
        content,
        tags: tags || [],
        requirements: requirements || [],
        projectType: projectType || "research",
        isActive: true,
      });

      const populatedPost = await Post.findById(post._id)
        .populate("supervisor", "firstName lastName email profileImg")
        .lean();

      return this.handleResponse(201, true, "Post created successfully", {
        post: populatedPost,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Get all posts by supervisor
  async getMyPosts(supervisorId) {
    try {
      const posts = await Post.find({ supervisor: supervisorId })
        .populate("supervisor", "firstName lastName email profileImg")
        .sort({ createdAt: -1 })
        .lean();

      // Get likes and comments with user details for each post
      const postsWithStats = await Promise.all(
        posts.map(async (post) => {
          const [likes, comments, isLiked] = await Promise.all([
            PostLike.find({ post: post._id })
              .populate("user", "firstName lastName email profileImg")
              .sort({ createdAt: -1 })
              .lean(),
            PostComment.find({ post: post._id })
              .populate("user", "firstName lastName email profileImg")
              .sort({ createdAt: -1 })
              .lean(),
            PostLike.exists({ post: post._id, user: supervisorId }),
          ]);

          return {
            ...post,
            likesCount: likes.length,
            commentsCount: comments.length,
            isLiked: !!isLiked,
            likes: likes.map((like) => ({
              _id: like._id,
              user: like.user,
              createdAt: like.createdAt,
            })),
            comments: comments.map((comment) => ({
              _id: comment._id,
              user: comment.user,
              content: comment.content,
              createdAt: comment.createdAt,
            })),
          };
        })
      );

      return this.handleResponse(200, true, "Posts retrieved", {
        posts: postsWithStats,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Update a post
  async updatePost(supervisorId, postId, data) {
    try {
      const post = await Post.findOne({
        _id: postId,
        supervisor: supervisorId,
      });

      if (!post) {
        return this.handleResponse(404, false, "Post not found");
      }

      Object.assign(post, data);
      await post.save();

      const populatedPost = await Post.findById(post._id)
        .populate("supervisor", "firstName lastName email profileImg")
        .lean();

      return this.handleResponse(200, true, "Post updated", {
        post: populatedPost,
      });
    } catch (err) {
      return this.handleError(err);
    }
  }

  // Delete a post
  async deletePost(supervisorId, postId) {
    try {
      const post = await Post.findOneAndDelete({
        _id: postId,
        supervisor: supervisorId,
      });

      if (!post) {
        return this.handleResponse(404, false, "Post not found");
      }

      // Delete associated likes and comments
      await Promise.all([
        PostLike.deleteMany({ post: postId }),
        PostComment.deleteMany({ post: postId }),
      ]);

      return this.handleResponse(200, true, "Post deleted");
    } catch (err) {
      return this.handleError(err);
    }
  }
}

const supervisorPostService = new SupervisorPostService();

export default supervisorPostService;

